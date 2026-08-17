#!/usr/bin/env bash
# Prunes stale PR images from the ci-artifacts orphan branch. Sweeps every
# "<category>/pr-<number>/" directory on the branch and removes those whose PR
# has been closed for at least RETENTION_DAYS. Open PRs are always kept, so
# recently merged/auto-merged PRs stay visible during the grace period.
#
# Required env:
#   ARTIFACTS_BRANCH  Orphan branch name (e.g. ci-artifacts)
#   GITHUB_REPOSITORY owner/repo (provided by Actions)
#   GH_TOKEN          Token with contents:write + repo read (GITHUB_TOKEN or PAT)
# Optional env:
#   RETENTION_DAYS    Days to keep images after a PR closes (default 30)
#   GITHUB_SERVER_URL Defaults to https://github.com
set -euo pipefail

: "${ARTIFACTS_BRANCH:?}"
: "${GITHUB_REPOSITORY:?}"
: "${GH_TOKEN:?}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"
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

now="$(date -u +%s)"
cutoff=$((RETENTION_DAYS * 24 * 3600))

# Collect the unique PR numbers that have image directories on the branch.
mapfile -t pr_numbers < <(
  find . -type d -name 'pr-*' -not -path '*/.git/*' |
    sed -E 's#.*/pr-([0-9]+)$#\1#' | grep -E '^[0-9]+$' | sort -u
)

if [ "${#pr_numbers[@]}" -eq 0 ]; then
  echo "No PR image directories found on '$ARTIFACTS_BRANCH'" >&2
  exit 0
fi

removed_total=0
for pr in "${pr_numbers[@]}"; do
  # Query the PR's state and close time. state=open -> always keep.
  read -r state closed_at < <(
    gh api "repos/${GITHUB_REPOSITORY}/pulls/${pr}" \
      --jq '[.state, (.closed_at // "")] | @tsv' 2>/dev/null || echo -e "unknown\t"
  )

  if [ "$state" = "unknown" ]; then
    echo "PR #${pr}: could not query state; keeping images" >&2
    continue
  fi
  if [ "$state" = "open" ] || [ -z "$closed_at" ]; then
    echo "PR #${pr}: open; keeping images" >&2
    continue
  fi

  closed_ts="$(date -u -d "$closed_at" +%s 2>/dev/null || echo 0)"
  age=$((now - closed_ts))
  if [ "$closed_ts" -eq 0 ]; then
    echo "PR #${pr}: unparseable closed_at ('$closed_at'); keeping images" >&2
    continue
  fi
  if [ "$age" -lt "$cutoff" ]; then
    echo "PR #${pr}: closed ${age}s ago (< ${RETENTION_DAYS}d); keeping images" >&2
    continue
  fi

  mapfile -t dirs < <(find . -type d -name "pr-${pr}" -not -path '*/.git/*')
  for d in "${dirs[@]}"; do
    git rm -rq "$d"
    removed_total=$((removed_total + 1))
  done
  echo "PR #${pr}: closed ${age}s ago (>= ${RETENTION_DAYS}d); removed ${#dirs[@]} director(ies)"
done

if [ "$removed_total" -eq 0 ]; then
  echo "Nothing to prune"
  exit 0
fi

git commit -m "Prune images for PRs closed over ${RETENTION_DAYS} days ago" >/dev/null
git push origin "$ARTIFACTS_BRANCH" >/dev/null 2>&1
echo "Pruned images from ${removed_total} director(ies)"
