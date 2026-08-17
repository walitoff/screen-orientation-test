# CI setup and configuration

One-time repository configuration needed for the GitHub Actions workflows in
[`.github/workflows`](./workflows). Most jobs work out of the box; the items below
must be set up by a repository admin.

## Repository variables

Set under **Settings → Secrets and variables → Actions → Variables**.

| Variable | Used by | Purpose |
|----|----|----|
| `UBUNTU_VERSION` | all workflows | Runner image label, e.g. `ubuntu-latest` or `ubuntu-24.04`. Jobs fail to start if unset. |

## Secrets

Set under **Settings → Secrets and variables → Actions → Secrets**.

| Secret | Used by | Required | Purpose |
|----|----|----|----|
| `SONAR_TOKEN` | SonarCloud | Yes for that job | Authenticates the SonarCloud scan. |
| `CODACY_PROJECT_TOKEN` | Codacy | Optional | Codacy project token; the scan runs with defaults if omitted. |
| `VISUAL_TOKEN` | Visual, Lighthouse, Cleanup | Optional (recommended) | PAT for pushing images and baselines. See below. |

No third-party image host is used. The Lighthouse and Visual jobs publish their
PR-comment images to an orphan branch in this same repository (see
[Image hosting](#image-hosting)), so there is no `IMGBB_API_KEY` or similar to set.

## Visual regression job

The `Visual` job in [`tests.js.yml`](./workflows/tests.js.yml) renders the page in
Chromium, diffs it against committed baselines, and posts an expected / actual /
heatmap comparison to the pull request. It needs the following.

### Workflow permissions

Under **Settings → Actions → General → Workflow permissions**:

- Select **Read and write permissions**.
- Enable **Allow GitHub Actions to create and approve pull requests**.

The job also declares `contents: write` and `pull-requests: write` itself, but the
account-level setting above must allow it.

### Baseline images

- Baselines live in `test/visual/baseline/` and **are generated in CI** (Linux font
  rendering), not committed from a developer machine.
- On the **first** pull request run no baselines exist, so the job captures the
  current render as the baseline, commits it back to the PR branch, and comments
  "baseline created". The **next** run is the first real comparison.
- To refresh baselines after an intentional UI change, add the
  `update-visual-baselines` label to the PR (create the label once under
  **Issues → Labels**). CI regenerates the baselines and commits them back.

### `VISUAL_TOKEN` (recommended)

The job commits refreshed baselines back to the PR branch. With the default
`GITHUB_TOKEN`, those commits do **not** re-trigger workflows (GitHub prevents
recursive runs), so the visual check will not re-run automatically on the new
baseline commit. Provide a fine-grained PAT as `VISUAL_TOKEN` (scopes: `contents:write`,
`pull-requests:write`) to avoid this; the checkout step uses it when present and
falls back to `GITHUB_TOKEN` otherwise.

## Image hosting

All PR-comment images (Lighthouse score cards and the visual regression
expected/actual/heatmap set) are pushed to a single orphan branch named
`ci-artifacts` by [`scripts/publish-images.sh`](../scripts/publish-images.sh), then
referenced by their `raw.githubusercontent.com` URLs in the comment. This replaces
the previous third-party image host.

- Each job writes to a distinct path so parallel jobs don't collide:
  `visual/pr-<n>/<run_id>/` and `lighthouse/pr-<n>/<run_id>/`. The script also
  retries on push races.
- The branch is created automatically on first use. It only stores images
  referenced by PR comments and can be pruned or deleted at any time without
  affecting the site or its history.
- Pushing uses `VISUAL_TOKEN` when set, otherwise `GITHUB_TOKEN`. The account-level
  **Read and write permissions** setting above must be enabled either way.
- When a PR is closed, the [`Cleanup PR artifacts`](./workflows/cleanup-artifacts.yml)
  workflow removes that PR's `pr-<n>/` directories from the branch automatically.

### Fork pull requests

The Visual and Lighthouse jobs push images and comment on the PR, which requires a
write-scoped token. Pull requests from forks only receive a read-only token, so both
jobs (and the cleanup job) are skipped for fork PRs via a
`github.event.pull_request.head.repo.fork == false` guard. The `Build` and `HTML`
jobs still run on fork PRs. To enable the image-publishing jobs for trusted forks,
you would need a workflow that runs in the base-repo context (e.g. `pull_request_target`),
which is intentionally not used here to avoid exposing write tokens to fork code.

## Local development

Everything except the browser download is covered by `npm ci`. For the visual suite
locally:

```bash
npx playwright install chromium   # one-time browser download
npm run visual                    # compare against baselines (starts Hugo automatically)
npm run visual:update             # regenerate local baselines (do not commit these)
```

`npm test` (lint suite plus unit tests) needs no browser or Hugo and runs anywhere.
`npm run test:html` and `npm run lighthouse:check` need a built site or running server
and are normally exercised in CI.
