#!/usr/bin/env bash
# Removes a pull request's images from the ci-artifacts orphan branch when the
# PR is closed. Deletes every "<category>/pr-<number>/" directory on the branch.
#
# Required env:
#   ARTIFACTS_BRANCH  Orphan branch name (e.g. ci-artifacts)
#   PR_NUMBER         Pull request number whose images should be removed
#   GITHUB_REPOSITORY owner/repo (provided by Actions)
#   GH_TOKEN          Token with contents:write (GITHUB_TOKEN or a PAT)
# Optional env:
#   GITHUB_SERVER_URL Defaults to https://github.com
set -euo pipefail

: "${ARTIFACTS_BRANCH:?}"
: "${PR_NUMBER:?}"
: "${GITHUB_REPOSITORY:?}"
: "${GH_TOKEN:?}"
SERVER_URL="${GITHUB_SERVER_URL:-https://github.com}"

host="${SERVER_URL#https://}"
remote="https://x-access-token:${GH_TOKEN}@${host}/${GITHUB_REPOSITORY}.git"

# Nothing to do if the branch doesn't exist yet.
if ! git ls-remote --exit-code --heads "$remote" "$ARTIFACTS_BRANCH" >/dev/null 2>&1; then
  echo "Branch '$ARTIFACTS_BRANCH' does not exist; nothing to clean up" >&2
  exit 0
fi

work="$(mktemp -d)"
repo="$work/repo"
git clone --no-checkout --depth 1 --branch "$ARTIFACTS_BRANCH" "$remote" "$repo" >/dev/null 2>&1
cd "$repo"
git config user.name "github-actions[bot]"
git config user.email "github-actions[bot]@users.noreply.github.com"
git checkout "$ARTIFACTS_BRANCH" >/dev/null 2>&1

# Match this PR's directory under any category (visual/, lighthouse/, ...).
mapfile -t dirs < <(find . -type d -name "pr-${PR_NUMBER}" -not -path '*/.git/*')
if [ "${#dirs[@]}" -eq 0 ]; then
  echo "No image directories found for PR #${PR_NUMBER}" >&2
  exit 0
fi

for d in "${dirs[@]}"; do
  git rm -rq "$d"
done

git commit -m "Clean up images for closed PR #${PR_NUMBER}" >/dev/null
git push origin "$ARTIFACTS_BRANCH" >/dev/null 2>&1
echo "Removed ${#dirs[@]} image director(ies) for PR #${PR_NUMBER}"
