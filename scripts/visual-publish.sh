#!/usr/bin/env bash
# Publishes visual-regression images to a dedicated orphan branch and prints the
# raw base URL for the pushed directory. Intended to run in GitHub Actions.
#
# Required env:
#   ARTIFACTS_BRANCH  Orphan branch name (e.g. visual-regression-artifacts)
#   DEST_DIR          Subdirectory on that branch (e.g. pr-5/123456)
#   GITHUB_REPOSITORY owner/repo (provided by Actions)
#   GITHUB_SERVER_URL https://github.com (provided by Actions)
# Prints:
#   RAW_BASE=<url>    on stdout (capture into $GITHUB_OUTPUT by the caller)
set -euo pipefail

: "${ARTIFACTS_BRANCH:?}"
: "${DEST_DIR:?}"
: "${GITHUB_REPOSITORY:?}"

if [ ! -d visual-output ]; then
  echo "visual-output/ not found; nothing to publish" >&2
  exit 1
fi

# Work in a throwaway clone so we don't disturb the main working tree.
work="$(mktemp -d)"
git clone --no-checkout --depth 1 "${GITHUB_SERVER_URL}/${GITHUB_REPOSITORY}.git" "$work/repo" 2>/dev/null || \
  git clone --no-checkout "${GITHUB_SERVER_URL}/${GITHUB_REPOSITORY}.git" "$work/repo"
cd "$work/repo"

# Check out the artifacts branch, or create it as an empty orphan if absent.
if git ls-remote --exit-code --heads origin "$ARTIFACTS_BRANCH" >/dev/null 2>&1; then
  git fetch origin "$ARTIFACTS_BRANCH" --depth 1
  git checkout "$ARTIFACTS_BRANCH"
else
  git checkout --orphan "$ARTIFACTS_BRANCH"
  git rm -rf . >/dev/null 2>&1 || true
fi

mkdir -p "$DEST_DIR"
# Copy only the PNGs (skip results.json, which stays in the run's workspace).
cd - >/dev/null
find visual-output -name '*.png' -print0 | while IFS= read -r -d '' f; do
  rel="${f#visual-output/}"
  mkdir -p "$work/repo/$DEST_DIR/$(dirname "$rel")"
  cp "$f" "$work/repo/$DEST_DIR/$rel"
done

cd "$work/repo"
git add "$DEST_DIR"
if git diff --cached --quiet; then
  echo "No image changes to publish" >&2
else
  git commit -m "Visual artifacts for ${DEST_DIR}" >/dev/null
  git push origin "$ARTIFACTS_BRANCH"
fi

echo "RAW_BASE=https://raw.githubusercontent.com/${GITHUB_REPOSITORY}/${ARTIFACTS_BRANCH}/${DEST_DIR}"
