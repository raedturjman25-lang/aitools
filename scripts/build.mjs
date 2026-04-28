import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { relative, resolve, sep } from "node:path";

const root = process.cwd();
const outDir = resolve(root, "dist");
const siteUrl = (process.env.SITE_URL || "https://aitoolshubpro.me").replace(/\/+$/, "");

const excludedDirectories = new Set([".git", "dist", "node_modules"]);
const excludedRoutes = new Set(["/admin/", "/privacy-policy/"]);

function toRoute(filePath) {
  const normalized = filePath.split(sep).join("/");

  if (normalized === "index.html") {
    return "/";
  }

  if (normalized.endsWith("/index.html")) {
    return `/${normalized.slice(0, -"index.html".length)}`;
  }

  return `/${normalized}`;
}

function collectHtmlPages(directory) {
  const pages = [];
  const entries = readdirSync(directory, { withFileTypes: true });

  for (const entry of entries) {
    const absolutePath = resolve(directory, entry.name);

    if (entry.isDirectory()) {
      if (excludedDirectories.has(entry.name)) {
        continue;
      }

      pages.push(...collectHtmlPages(absolutePath));
      continue;
    }

    if (!entry.isFile() || !entry.name.endsWith(".html")) {
      continue;
    }

    const relativePath = relative(root, absolutePath);
    const route = toRoute(relativePath);

    if (excludedRoutes.has(route)) {
      continue;
    }

    const lastModified = statSync(absolutePath).mtime.toISOString().slice(0, 10);
    pages.push({ route, lastModified });
  }

  return pages;
}

function escapeXml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function buildSitemapXml(pages) {
  const uniquePages = Array.from(
    new Map(
      pages.map((page) => [page.route, page])
    ).values()
  ).sort((a, b) => {
    if (a.route === "/") {
      return -1;
    }

    if (b.route === "/") {
      return 1;
    }

    return a.route.localeCompare(b.route);
  });

  const urlEntries = uniquePages
    .map(({ route, lastModified }) => {
      const loc = `${siteUrl}${route}`;
      return [
        "  <url>",
        `    <loc>${escapeXml(loc)}</loc>`,
        `    <lastmod>${lastModified}</lastmod>`,
        "  </url>"
      ].join("\n");
    })
    .join("\n");

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urlEntries,
    "</urlset>",
    ""
  ].join("\n");
}

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
  "terms-of-service",
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

const pages = collectHtmlPages(root);
const sitemap = buildSitemapXml(pages);
writeFileSync(resolve(outDir, "sitemap.xml"), sitemap, "utf8");

console.log(`[build] Static site copied to dist/ and sitemap generated for ${pages.length} pages.`);
