import fs from "node:fs";
import path from "node:path";

const dist = path.resolve("dist");
const manifestPath = path.join(dist, "manifest.json");

if (!fs.existsSync(manifestPath)) {
  throw new Error(`Built manifest not found: ${manifestPath}`);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

function objectValues(value) {
  return value && typeof value === "object" ? Object.values(value) : [];
}

const references = [
  ...objectValues(manifest.icons),
  manifest.action?.default_icon,
  ...objectValues(manifest.action?.default_icon),
  manifest.action?.default_popup,
  manifest.background?.service_worker,
  manifest.side_panel?.default_path,
  manifest.options_page,
  manifest.options_ui?.page,
  manifest.devtools_page,
  ...objectValues(manifest.chrome_url_overrides),
  ...(manifest.content_scripts ?? []).flatMap((script) => [...(script.js ?? []), ...(script.css ?? [])]),
  ...(manifest.web_accessible_resources ?? []).flatMap((resource) => resource.resources ?? []),
  ...(manifest.sandbox?.pages ?? []),
].filter((reference) => typeof reference === "string" && reference.length > 0);

const uniqueReferences = [...new Set(references)];

const missing = uniqueReferences.filter((reference) => {
  const outputPath = path.resolve(dist, reference);
  const relativePath = path.relative(dist, outputPath);
  if (relativePath.startsWith(`..${path.sep}`) || path.isAbsolute(relativePath)) return true;

  if (/[!*?[\]]/.test(reference)) {
    return fs.globSync(reference, { cwd: dist, nodir: true }).length === 0;
  }

  return !fs.existsSync(outputPath) || !fs.statSync(outputPath).isFile();
});

if (missing.length > 0) {
  throw new Error(`Missing manifest-referenced output files:\n${missing.join("\n")}`);
}

console.log(`Validated ${uniqueReferences.length} manifest-referenced output files.`);
