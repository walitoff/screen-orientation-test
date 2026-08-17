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
| `IMGBB_API_KEY` | Lighthouse, Screenshots | Yes for those jobs | Uploads report/screenshot images to imgbb for the PR comment. |
| `SONAR_TOKEN` | SonarCloud | Yes for that job | Authenticates the SonarCloud scan. |
| `CODACY_PROJECT_TOKEN` | Codacy | Optional | Codacy project token; the scan runs with defaults if omitted. |
| `VISUAL_TOKEN` | Visual | Optional (recommended) | PAT so auto-committed baselines re-trigger checks. See below. |

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

### Artifacts branch

Comparison images are pushed to an orphan branch named
`visual-regression-artifacts` under `pr-<number>/<run_id>/`. The branch is created
automatically on first use. It only stores images referenced by PR comments and can
be pruned or deleted at any time without affecting the site or its history.

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
