// Creates WebP versions of the site photos at several widths and writes a
// manifest the app uses to build srcset attributes.
//   npm run images      (run again after adding or replacing a photo)
//
// public/images/flooring/flooring-tile.jpg → flooring-tile-480.webp, -800.webp, -1024.webp
// The original JPG stays as a fallback.
import { readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import sharp from 'sharp';

const PUBLIC = 'public';
const SOURCES = ['images', 'brand'];
const WIDTHS = [320, 480, 800, 1200, 1600];
const QUALITY = 72;
const MANIFEST = 'src/app/core/images/image-manifest.json';

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) yield* walk(path);
    else yield path;
  }
}

const manifest = {};
let written = 0;

for (const source of SOURCES) {
  for (const file of walk(join(PUBLIC, source))) {
    if (!/\.(jpe?g|png)$/i.test(file) || /icon-\d+\.png$/.test(file)) continue;
    const { width } = await sharp(file).metadata();
    // Every width below the original, plus the original width itself.
    const widths = [...new Set([...WIDTHS.filter((w) => w < width), width])];
    for (const w of widths) {
      const out = file.replace(/\.(jpe?g|png)$/i, `-${w}.webp`);
      await sharp(file).resize({ width: w }).webp({ quality: QUALITY, effort: 5 }).toFile(out);
      written++;
    }
    const key = relative(PUBLIC, file).split(sep).join('/');
    manifest[key] = widths;
  }
}

writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + '\n');
console.log(`Wrote ${written} WebP files for ${Object.keys(manifest).length} images → ${MANIFEST}`);
