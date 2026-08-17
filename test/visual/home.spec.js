import {test, expect} from "@playwright/test";
import {PNG} from "pngjs";
import pixelmatch from "pixelmatch";
import fs from "node:fs";
import path from "node:path";

// Representative breakpoints: mobile portrait, mobile landscape, tablet, desktop.
const VIEWPORTS = [
    {name: "mobile-portrait", width: 360, height: 780},
    {name: "mobile-landscape", width: 780, height: 360},
    {name: "tablet", width: 768, height: 1024},
    {name: "desktop", width: 1920, height: 1080},
];

// Fail the test when the share of differing pixels exceeds this ratio.
// Tunable; kept small but non-zero to tolerate sub-pixel font rendering.
const MAX_DIFF_PIXEL_RATIO = 0.01;

const BASELINE_DIR = path.join("test", "visual", "baseline");
const OUTPUT_DIR = "visual-output";

// When true (set by `visual:update` / --update-snapshots), the actual capture
// is written as the new baseline and the diff assertion is skipped.
const UPDATE = process.argv.includes("--update-snapshots") ||
    process.env.UPDATE_SNAPSHOTS === "1";

function ensureDir(dir) {
    fs.mkdirSync(dir, {recursive: true});
}

test.describe("home page visual regression", () => {
    for (const vp of VIEWPORTS) {
        test(`${vp.name} (${vp.width}x${vp.height})`, async ({page}) => {
            await page.setViewportSize({width: vp.width, height: vp.height});
            await page.goto("/", {waitUntil: "networkidle"});
            // Let UIkit finish initializing and fonts settle before capture.
            await page.waitForTimeout(500);

            const actualBuffer = await page.screenshot({fullPage: true});

            const baselinePath = path.join(BASELINE_DIR, `${vp.name}.png`);
            const outDir = path.join(OUTPUT_DIR, vp.name);
            ensureDir(outDir);

            // First run (or update mode): establish the baseline and stop.
            if (UPDATE || !fs.existsSync(baselinePath)) {
                ensureDir(BASELINE_DIR);
                fs.writeFileSync(baselinePath, actualBuffer);
                fs.writeFileSync(path.join(outDir, "expected.png"), actualBuffer);
                fs.writeFileSync(path.join(outDir, "actual.png"), actualBuffer);
                // A blank diff keeps the PR comment layout consistent.
                const blank = new PNG({width: vp.width, height: vp.height});
                fs.writeFileSync(path.join(outDir, "diff.png"), PNG.sync.write(blank));
                writeResult(vp, 0, 0, true);
                test.info().annotations.push({type: "baseline", description: "created"});
                return;
            }

            const expected = PNG.sync.read(fs.readFileSync(baselinePath));
            const actual = PNG.sync.read(actualBuffer);

            // Compare on the larger canvas so size changes surface as diffs
            // instead of throwing; pixelmatch requires matching dimensions.
            const width = Math.max(expected.width, actual.width);
            const height = Math.max(expected.height, actual.height);
            const expectedResized = resizeCanvas(expected, width, height);
            const actualResized = resizeCanvas(actual, width, height);

            const diff = new PNG({width, height});
            const diffPixels = pixelmatch(
                expectedResized.data,
                actualResized.data,
                diff.data,
                width,
                height,
                {threshold: 0.1}
            );

            // Persist all three images for the PR comment.
            fs.writeFileSync(path.join(outDir, "expected.png"), PNG.sync.write(expectedResized));
            fs.writeFileSync(path.join(outDir, "actual.png"), PNG.sync.write(actualResized));
            fs.writeFileSync(path.join(outDir, "diff.png"), PNG.sync.write(diff));

            const ratio = diffPixels / (width * height);
            writeResult(vp, diffPixels, ratio, false);

            expect(
                ratio,
                `Visual diff for ${vp.name} is ${(ratio * 100).toFixed(3)}% ` +
                `(${diffPixels}px), above the ${(MAX_DIFF_PIXEL_RATIO * 100).toFixed(2)}% threshold`
            ).toBeLessThanOrEqual(MAX_DIFF_PIXEL_RATIO);
        });
    }
});

// Copies src pixels onto a (w x h) transparent canvas, top-left aligned.
function resizeCanvas(src, width, height) {
    if (src.width === width && src.height === height) {
        return src;
    }
    const out = new PNG({width, height});
    PNG.bitblt(src, out, 0, 0, src.width, src.height, 0, 0);
    return out;
}

// Appends one viewport's result to visual-output/results.json.
function writeResult(vp, diffPixels, ratio, isBaseline) {
    ensureDir(OUTPUT_DIR);
    const file = path.join(OUTPUT_DIR, "results.json");
    let all = [];
    if (fs.existsSync(file)) {
        try {
            all = JSON.parse(fs.readFileSync(file, "utf8"));
        } catch {
            all = [];
        }
    }
    all = all.filter((r) => r.name !== vp.name);
    all.push({
        name: vp.name,
        width: vp.width,
        height: vp.height,
        diffPixels,
        ratio,
        isBaseline,
    });
    fs.writeFileSync(file, JSON.stringify(all, null, 2));
}
