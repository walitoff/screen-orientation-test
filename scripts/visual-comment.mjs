#!/usr/bin/env node
// Builds the PR comment markdown for the visual-regression report.
// Reads visual-output/results.json and emits a table per viewport linking the
// expected / actual / heatmap images hosted on the artifacts branch.
//
// Env:
//   RAW_BASE  Base raw URL for the pushed images, e.g.
//             https://raw.githubusercontent.com/<owner>/<repo>/<branch>/<dir>
//   OUT       Optional output file path (defaults to stdout).

import {readFileSync, writeFileSync, existsSync} from "node:fs";

const RAW_BASE = (process.env.RAW_BASE || "").replace(/\/$/, "");
const RESULTS = "visual-output/results.json";

if (!RAW_BASE) {
    console.error("RAW_BASE env var is required");
    process.exit(1);
}
if (!existsSync(RESULTS)) {
    console.error(`${RESULTS} not found`);
    process.exit(1);
}

const results = JSON.parse(readFileSync(RESULTS, "utf8"));
// Stable order regardless of test completion order.
results.sort((a, b) => a.name.localeCompare(b.name));

const anyBaseline = results.some((r) => r.isBaseline);
const lines = [];
lines.push("### Visual Regression Report");
lines.push("");

if (anyBaseline) {
    lines.push(
        "> No baseline existed for one or more viewports, so the current render " +
        "was captured as the new baseline. Re-run once a baseline is committed to see diffs."
    );
    lines.push("");
}

for (const r of results) {
    const pct = (r.ratio * 100).toFixed(3);
    const status = r.isBaseline ? "baseline created" : `${pct}% changed (${r.diffPixels}px)`;
    const dir = `${RAW_BASE}/${r.name}`;
    lines.push(`#### ${r.name} — ${r.width}x${r.height} — ${status}`);
    lines.push("");
    lines.push("| Expected | Actual | Heatmap |");
    lines.push("|----|----|----|");
    lines.push(
        `| ![expected](${dir}/expected.png) ` +
        `| ![actual](${dir}/actual.png) ` +
        `| ![heatmap](${dir}/diff.png) |`
    );
    lines.push("");
}

const body = lines.join("\n");
if (process.env.OUT) {
    writeFileSync(process.env.OUT, body);
} else {
    process.stdout.write(body);
}
