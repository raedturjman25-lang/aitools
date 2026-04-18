import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const outDir = resolve(root, "dist");

const itemsToCopy = [
  "index.html",
  "styles.css",
  "script.js",
  "app.js",
  "robots.txt",
  "sitemap.xml",
  "privacy.html",
  "about",
  "admin",
  "assets",
  "blog",
  "contact",
  "content",
  "images",
  "privacy-policy",
  "tools"
];

if (existsSync(outDir)) {
  rmSync(outDir, { recursive: true, force: true });
}

mkdirSync(outDir, { recursive: true });

for (const entry of itemsToCopy) {
  const src = resolve(root, entry);
  const dest = resolve(outDir, entry);

  if (!existsSync(src)) {
    console.warn(`[build] Skipping missing path: ${entry}`);
    continue;
  }

  cpSync(src, dest, { recursive: true });
}

console.log("[build] Static site copied to dist/");
