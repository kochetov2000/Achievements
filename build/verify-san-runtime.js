"use strict";

const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml")

const root = path.resolve(__dirname, "..");
const runtimeRoot = path.join(root, "assets", "san-runtime");
const requiredFiles = [
  "dist/app/global.css",
  "notify/base.css",
  "notify/baseanim.css",
  "notify/presets/presets.json",
  "fonts/TitilliumWeb-SemiBold.ttf",
  "fonts/Roboto-Medium.ttf",
  "fonts/VT323-Regular.ttf",
  "fonts/JetBrainsMono-Light.ttf",
  "img/sanlogosquare.svg",
  "img/sanlogotrophy.svg",
  "img/sanlogotrophy_small.svg",
  "img/sanlogotrophy_bronze.svg",
  "img/sanlogotrophy_silver.svg",
  "img/sanlogotrophy_gold.svg",
  "img/steamlogonew.svg",
  "img/ribbonbw.svg",
];

const presetNames = [
  "default",
  "xqjan",
  "steamdeck",
  "epicgames",
  "xboxone",
  "xbox360",
  "ps5",
  "ps4",
  "ps3",
  "windows",
  "gfwl",
];
for (const preset of presetNames) {
  requiredFiles.push(`notify/presets/${preset}/index.html`);
  requiredFiles.push(`notify/presets/${preset}/styles.css`);
}

const missing = [];
const empty = [];
for (const relativePath of requiredFiles) {
  const fullPath = path.join(runtimeRoot, ...relativePath.split("/"));
  if (!fs.existsSync(fullPath)) {
    missing.push(relativePath);
    continue;
  }
  if (!fs.statSync(fullPath).size) empty.push(relativePath);
}

const packageJson = yaml.load(fs.readFileSync(path.join(root, "electron-builder.yml"), "utf8"));
const packagedFiles = Array.isArray(packageJson?.files)
  ? packageJson.files
  : [];
const assetsIncluded = packagedFiles.some((entry) => {
  const value = typeof entry === "string" ? entry : entry?.from;
  return typeof value === "string" && /^assets(?:[\\/]|\*\*)/.test(value);
});

if (missing.length || empty.length || !assetsIncluded) {
  const details = [];
  if (missing.length) details.push(`missing: ${missing.join(", ")}`);
  if (empty.length) details.push(`empty: ${empty.join(", ")}`);
  if (!assetsIncluded) details.push("electron-builder.yml does not include assets/**");
  throw new Error(`SAN runtime verification failed (${details.join("; ")})`);
}

console.log(`SAN runtime verified (${requiredFiles.length} files).`);
