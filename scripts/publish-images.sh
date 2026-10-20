#!/usr/bin/env bash
# Publishes images to a dedicated orphan branch on the same GitHub repo and
# prints the raw base URL for the pushed directory. Replaces third-party image
# hosting (imgbb) for PR comments. Intended to run in GitHub Actions.
#
# Required env:
#   ARTIFACTS_BRANCH  Orphan branch name (e.g. ci-artifacts)
#   DEST_DIR          Subdirectory on that branch (e.g. visual/pr-5/123456).
#                     Use a unique path per job so parallel jobs don't collide.
#   SRC_DIR           Local directory whose images are published (recursively).
#   GITHUB_REPOSITORY owner/repo (provided by Actions)
#   GH_TOKEN          Token with contents:write (GITHUB_TOKEN or a PAT)
# Optional env:
#   GITHUB_SERVER_URL Defaults to https://github.com
# Prints:
#   RAW_BASE=<url>    on stdout (capture into $GITHUB_OUTPUT by the caller)
set -euo pipefail

: "${ARTIFACTS_BRANCH:?}"
: "${DEST_DIR:?}"
: "${SRC_DIR:?}"
: "${GITHUB_REPOSITORY:?}"
: "${GH_TOKEN:?}"
SERVER_URL="${GITHUB_SERVER_URL:-https://github.com}"

if [ ! -d "$SRC_DIR" ]; then
  echo "SRC_DIR '$SRC_DIR' not found; nothing to publish" >&2
  exit 1
fi

# Authenticated remote so the fresh clone below can push.
host="${SERVER_URL#https://}"
remote="https://x-access-token:${GH_TOKEN}@${host}/${GITHUB_REPOSITORY}.git"

# Copies image files from SRC_DIR into the checked-out branch, preserving
# their paths relative to SRC_DIR.
copy_images() {
  local repo="$1"
  find "$SRC_DIR" -type f \( \
    -iname '*.png' -o -iname '*.jpg' -o -iname '*.jpeg' -o \
    -iname '*.gif' -o -iname '*.webp' \) -print0 |
    while IFS= read -r -d '' f; do
      rel="${f#"$SRC_DIR"/}"
      mkdir -p "$repo/$DEST_DIR/$(dirname "$rel")"
      cp "$f" "$repo/$DEST_DIR/$rel"
    done
}

attempt() {
  local work repo
  work="$(mktemp -d)"
  repo="$work/repo"

  # Shallow clone; check out the artifacts branch or start an empty orphan.
  git clone --no-checkout --depth 1 "$remote" "$repo" >/dev/null 2>&1 ||
    git clone --no-checkout "$remote" "$repo" >/dev/null 2>&1
  (
    cd "$repo"
    git config user.name "github-actions[bot]"
    git config user.email "github-actions[bot]@users.noreply.github.com"
    if git ls-remote --exit-code --heads origin "$ARTIFACTS_BRANCH" >/dev/null 2>&1; then
      git fetch origin "$ARTIFACTS_BRANCH" --depth 1 >/dev/null 2>&1
      git checkout "$ARTIFACTS_BRANCH" >/dev/null 2>&1
    else
      git checkout --orphan "$ARTIFACTS_BRANCH" >/dev/null 2>&1
      git rm -rf . >/dev/null 2>&1 || true
    fi
  )

  copy_images "$repo"

  (
    cd "$repo"
    git add "$DEST_DIR"
    if git diff --cached --quiet; then
      echo "No image changes to publish" >&2
      exit 0
    fi
    git commit -m "CI images for ${DEST_DIR}" >/dev/null
    git push origin "$ARTIFACTS_BRANCH" >/dev/null 2>&1
  )
}

# Retry to tolerate races when parallel jobs push to the same branch; each
# retry re-clones, picking up other jobs' commits before pushing again.
published=0
for i in 1 2 3 4 5; do
  if attempt; then
    published=1
    break
  fi
  echo "Publish attempt $i failed (likely a concurrent push); retrying..." >&2
  sleep $((i * 3))
done

if [ "$published" -ne 1 ]; then
  echo "Failed to publish images after multiple attempts" >&2
  exit 1
fi

echo "RAW_BASE=https://raw.githubusercontent.com/${GITHUB_REPOSITORY}/${ARTIFACTS_BRANCH}/${DEST_DIR}"
