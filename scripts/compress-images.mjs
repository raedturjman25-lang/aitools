import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = process.cwd();
const TARGET_DIRS = ['images', 'dist/images'];
const IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg']);

async function exists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function walk(dir) {
  const out = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...await walk(full));
      continue;
    }

    const ext = path.extname(entry.name).toLowerCase();
    if (IMAGE_EXTENSIONS.has(ext)) {
      out.push(full);
    }
  }

  return out;
}

async function optimizeOne(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const before = await fs.readFile(filePath);
  let optimized;

  if (ext === '.png') {
    optimized = await sharp(before)
      .png({
        compressionLevel: 9,
        effort: 10,
        palette: true,
        quality: 90,
        dither: 0.9,
      })
      .toBuffer();
  } else {
    optimized = await sharp(before)
      .jpeg({
        quality: 84,
        mozjpeg: true,
      })
      .toBuffer();
  }

  if (optimized.length < before.length) {
    await fs.writeFile(filePath, optimized);
    return { changed: true, before: before.length, after: optimized.length };
  }

  return { changed: false, before: before.length, after: before.length };
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(2)} MB`;
}

async function main() {
  const allFiles = [];

  for (const rel of TARGET_DIRS) {
    const abs = path.join(ROOT, rel);
    if (await exists(abs)) {
      allFiles.push(...await walk(abs));
    }
  }

  let changedCount = 0;
  let beforeTotal = 0;
  let afterTotal = 0;

  for (const filePath of allFiles) {
    const result = await optimizeOne(filePath);
    beforeTotal += result.before;
    afterTotal += result.after;

    if (result.changed) {
      changedCount += 1;
      console.log(`optimized: ${path.relative(ROOT, filePath)} | ${formatBytes(result.before)} -> ${formatBytes(result.after)}`);
    }
  }

  const saved = beforeTotal - afterTotal;
  const ratio = beforeTotal > 0 ? (saved / beforeTotal) * 100 : 0;

  console.log('---');
  console.log(`files scanned: ${allFiles.length}`);
  console.log(`files optimized: ${changedCount}`);
  console.log(`total before: ${formatBytes(beforeTotal)}`);
  console.log(`total after: ${formatBytes(afterTotal)}`);
  console.log(`saved: ${formatBytes(saved)} (${ratio.toFixed(2)}%)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
