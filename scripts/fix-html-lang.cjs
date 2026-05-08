/* eslint-disable no-console */

/**
 * scripts/fix-html-lang.cjs
 * After `next build` (static export), all HTML files have lang="fr" from layout.tsx.
 * This script patches each file in out/ to use the correct lang based on its path.
 */

const fsp = require('node:fs/promises');
const path = require('node:path');

const OUT_DIR = path.resolve(__dirname, '..', 'out');

const LANG_PREFIXES = ['en', 'es', 'de'];

function langFromRelativePath(rel) {
  const normalized = rel.replace(/\\/g, '/');
  for (const lang of LANG_PREFIXES) {
    if (normalized === `${lang}/index.html` || normalized.startsWith(`${lang}/`)) {
      return lang;
    }
  }
  return 'fr';
}

async function walkHtmlFiles(dir) {
  const results = [];
  const entries = await fsp.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...(await walkHtmlFiles(full)));
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      results.push(full);
    }
  }
  return results;
}

async function main() {
  let files;
  try {
    files = await walkHtmlFiles(OUT_DIR);
  } catch {
    console.warn('[fix-html-lang] out/ directory not found, skipping.');
    return;
  }

  let patched = 0;
  let skipped = 0;

  for (const file of files) {
    const rel = path.relative(OUT_DIR, file);
    const lang = langFromRelativePath(rel);

    if (lang === 'fr') {
      skipped++;
      continue;
    }

    const content = await fsp.readFile(file, 'utf8');
    const updated = content.replace(/<html\s+lang="fr"/, `<html lang="${lang}"`);

    if (updated !== content) {
      await fsp.writeFile(file, updated, 'utf8');
      console.log(`[fix-html-lang] ${rel} → lang="${lang}"`);
      patched++;
    } else {
      skipped++;
    }
  }

  console.log(`[fix-html-lang] Done: ${patched} patched, ${skipped} skipped.`);
}

main().catch((err) => {
  console.error('[fix-html-lang] Error:', err);
  process.exit(1);
});
