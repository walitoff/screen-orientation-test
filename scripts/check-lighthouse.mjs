#!/usr/bin/env node
// Fails the build if any Lighthouse category score falls below its threshold.
// Reads the JSON reports produced by `npm run lighthouse-desktop` / `-mobile`
// (files: desktop.report.json, mobile.report.json). Report-and-gate for C.

import {readFileSync, existsSync} from "node:fs";

// Minimum acceptable score (0-100) per category. Tune as the project evolves.
const THRESHOLDS = {
    performance: 90,
    accessibility: 100,
    "best-practices": 95,
    seo: 90,
};

// Reports to check: label -> file path. Missing files are treated as an error
// so a broken Lighthouse step can't silently pass the gate.
const REPORTS = {
    Desktop: "desktop.report.json",
    Mobile: "mobile.report.json",
};

let failed = false;

for (const [label, file] of Object.entries(REPORTS)) {
    if (!existsSync(file)) {
        console.error(`✖ ${label}: report file "${file}" not found`);
        failed = true;
        continue;
    }

    let report;
    try {
        report = JSON.parse(readFileSync(file, "utf8"));
    } catch (e) {
        console.error(`✖ ${label}: could not parse "${file}": ${e.message}`);
        failed = true;
        continue;
    }

    const categories = report.categories || {};
    for (const [key, min] of Object.entries(THRESHOLDS)) {
        const category = categories[key];
        if (!category || typeof category.score !== "number") {
            console.error(`✖ ${label}: category "${key}" missing from report`);
            failed = true;
            continue;
        }
        const score = Math.round(category.score * 100);
        if (score < min) {
            console.error(`✖ ${label}: ${key} scored ${score}, below threshold ${min}`);
            failed = true;
        } else {
            console.log(`✓ ${label}: ${key} scored ${score} (>= ${min})`);
        }
    }
}

if (failed) {
    console.error("\nLighthouse thresholds not met.");
    process.exit(1);
}
console.log("\nAll Lighthouse thresholds met.");
