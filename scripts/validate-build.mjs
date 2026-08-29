import fs from "node:fs";
import path from "node:path";

const dist = path.resolve("dist");
const manifestPath = path.join(dist, "manifest.json");

if (!fs.existsSync(manifestPath)) {
  throw new Error(`Built manifest not found: ${manifestPath}`);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const references = [
  ...Object.values(manifest.icons ?? {}),
  manifest.background?.service_worker,
  manifest.side_panel?.default_path,
  ...(manifest.content_scripts ?? []).flatMap((script) => script.js ?? []),
].filter(Boolean);

const missing = references.filter((reference) => {
  const outputPath = path.resolve(dist, reference);
  return !outputPath.startsWith(`${dist}${path.sep}`) || !fs.existsSync(outputPath);
});

if (missing.length > 0) {
  throw new Error(`Missing manifest-referenced output files:\n${missing.join("\n")}`);
}

console.log(`Validated ${references.length} manifest-referenced output files.`);
