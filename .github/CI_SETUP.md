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
- The [`Cleanup PR artifacts`](./workflows/cleanup-artifacts.yml) workflow runs daily
  and removes a PR's `pr-<n>/` directories only after the PR has been **closed for at
  least 30 days**. Open PRs are always kept, and recently merged (including
  auto-merged) PRs stay visible during the grace period so their results can still be
  reviewed. Adjust the window with the `retention_days` input when running the
  workflow manually, or by editing its default. Because it is schedule-driven, a
  missed run simply prunes on the next day.

### Fork pull requests

The Visual and Lighthouse jobs push images and comment on the PR, which requires a
write-scoped token. Pull requests from forks only receive a read-only token, so both
jobs are skipped for fork PRs via a
`github.event.pull_request.head.repo.fork == false` guard. The `Build` and `HTML`
jobs still run on fork PRs. For fork PRs, a maintainer can render the visuals
on demand with the `/visual` command below.

### `/visual` command (on-demand visual regression)

Because the automatic Visual job is skipped on fork PRs, a maintainer can trigger
it manually by commenting `/visual` on the pull request. This is handled by
[`visual-command.yml`](./workflows/visual-command.yml).

- It runs on `issue_comment`, which executes in the **base repository** context and
  therefore has a write-scoped token — this is what lets it publish images and
  comment on a fork PR.
- The `authorize` job gates the run: it only proceeds when the comment starts with
  `/visual`, is on a pull request, and the **commenter has `write`, `maintain`, or
  `admin`** permission. Comments from anyone else are ignored. On success it adds an
  "eyes" reaction to the comment so the maintainer knows the run started.
- The `visual` job checks out the PR head via `refs/pull/<n>/head` (works for forks),
  runs `npm run visual`, publishes to `ci-artifacts` under `visual/pr-<n>/<run_id>/`,
  and posts/updates the same comparison comment as the automatic job.

> Security note: this renders the fork's `src/` at that commit with a write token in
> scope. For this static Hugo site the risk is low (no build-time script execution
> beyond Hugo), but only trigger `/visual` after reviewing the PR's changes. The
> command deliberately checks commenter permission rather than running automatically,
> and it does not use `pull_request_target`.

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
