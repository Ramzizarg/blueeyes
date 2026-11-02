import sharp from "sharp";
import fs from "fs";
import path from "path";

const wordmark = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="118" fill="#0d1018"/>
  <text x="42" y="292" font-family="Arial Black, Impact, sans-serif" font-weight="800" font-size="86" letter-spacing="-4.5" fill="#f4f6fb">blueeyes</text>
  <circle cx="456" cy="300" r="16" fill="#b4cbff"/>
</svg>`;

const monogram = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="118" fill="#0d1018"/>
  <text x="210" y="345" text-anchor="middle" font-family="Arial Black, Impact, sans-serif" font-weight="800" font-size="300" letter-spacing="-14" fill="#f4f6fb">b</text>
  <circle cx="368" cy="372" r="30" fill="#b4cbff"/>
</svg>`;

function makeIco(pngs, sizes) {
  const count = pngs.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(count, 4);
  const dir = Buffer.alloc(16 * count);
  let offset = 6 + 16 * count;
  const bodies = [];
  for (let i = 0; i < count; i++) {
    const png = pngs[i];
    const size = sizes[i];
    dir.writeUInt8(size === 256 ? 0 : size, i * 16 + 0);
    dir.writeUInt8(size === 256 ? 0 : size, i * 16 + 1);
    dir.writeUInt8(0, i * 16 + 2);
    dir.writeUInt8(0, i * 16 + 3);
    dir.writeUInt16LE(1, i * 16 + 4);
    dir.writeUInt16LE(32, i * 16 + 6);
    dir.writeUInt32LE(png.length, i * 16 + 8);
    dir.writeUInt32LE(offset, i * 16 + 12);
    offset += png.length;
    bodies.push(png);
  }
  return Buffer.concat([header, dir, ...bodies]);
}

const app = "src/app";
const pub = "public";

fs.writeFileSync(path.join(pub, "logo.svg"), wordmark);
fs.writeFileSync(path.join(app, "icon.svg"), monogram);

const sizes = [16, 32, 48];
const pngs = [];
for (const size of sizes) {
  pngs.push(
    await sharp(Buffer.from(monogram)).resize(size, size).png().toBuffer(),
  );
}
fs.writeFileSync(path.join(app, "favicon.ico"), makeIco(pngs, sizes));

await sharp(Buffer.from(monogram)).resize(64, 64).png().toFile(path.join(app, "icon.png"));
await sharp(Buffer.from(wordmark)).resize(180, 180).png().toFile(path.join(app, "apple-icon.png"));
await sharp(Buffer.from(wordmark)).resize(512, 512).png().toFile(path.join(pub, "logo.png"));
await sharp(Buffer.from(wordmark))
  .resize(1200, 630, { fit: "contain", background: "#0d1018" })
  .png()
  .toFile(path.join(pub, "og.png"));

console.log("done");
