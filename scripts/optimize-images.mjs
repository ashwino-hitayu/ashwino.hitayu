// Prepares photos for the web:  npm run images
//
// For every photo in public/products/ and public/treatments/:
//   - wider than 1000px?  resized to 1000px wide (re-encoded once, so running
//     this again never re-compresses an already-optimised photo)
//   - writes a 500px-wide copy next to it (name-500.jpg) for phones
//   - records both sizes in src/imageSizes.json, which the pages use for
//     srcset (so phones download the small copy) and width/height
// Drop new photos in those folders, run `npm run images`, commit the result.
import { readdir, stat, writeFile } from 'node:fs/promises';
import { extname, basename, join } from 'node:path';
import sharp from 'sharp';

const ROOT = new URL('../public/', import.meta.url).pathname;
const FOLDERS = ['products', 'treatments'];
const MAX_WIDTH = 1000;
const SMALL_WIDTH = 500;
const IS_PHOTO = /\.(jpe?g|png|webp)$/i;
const SMALL_SUFFIX = `-${SMALL_WIDTH}`;

const jpeg = (img, quality) => img.jpeg({ quality, mozjpeg: true, progressive: true });
const kb = (n) => `${Math.round(n / 1024)} KB`;

const manifest = {};
for (const folder of FOLDERS) {
  const dir = join(ROOT, folder);
  const files = (await readdir(dir)).filter((f) => IS_PHOTO.test(f) && !basename(f, extname(f)).endsWith(SMALL_SUFFIX));
  for (const file of files.sort()) {
    const path = join(dir, file);
    let meta = await sharp(path).rotate().metadata();
    const before = (await stat(path)).size;

    if (meta.width > MAX_WIDTH) {
      const buf = await jpeg(sharp(path).rotate().resize({ width: MAX_WIDTH }), 78).toBuffer();
      await writeFile(path, buf);
      meta = await sharp(path).metadata();
      console.log(`resized   ${folder}/${file}  ${kb(before)} -> ${kb(buf.length)}`);
    }

    const small = join(dir, `${basename(file, extname(file))}${SMALL_SUFFIX}${extname(file)}`);
    // (re)make the small copy if it's missing or older than the photo
    const sourceTime = (await stat(path)).mtimeMs;
    const smallFresh = await stat(small).then(
      (s) => s.mtimeMs >= sourceTime,
      () => false
    );
    if (!smallFresh && meta.width > SMALL_WIDTH) {
      const buf = await jpeg(sharp(path).resize({ width: SMALL_WIDTH }), 76).toBuffer();
      await writeFile(small, buf);
      console.log(`small     ${folder}/${basename(small)}  ${kb(buf.length)}`);
    }

    const src = `/${folder}/${file}`;
    manifest[src] = { width: meta.width, height: meta.height, ...(meta.width > SMALL_WIDTH ? { small: `/${folder}/${basename(small)}` } : {}) };
  }
}

await writeFile(new URL('../src/imageSizes.json', import.meta.url), JSON.stringify(manifest, null, 2) + '\n');
console.log(`\nsrc/imageSizes.json: ${Object.keys(manifest).length} photos`);
