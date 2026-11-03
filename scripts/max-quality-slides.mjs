import sharp from "sharp";
import fs from "fs";
import path from "path";

const dir = "public/slides";
const files = fs.readdirSync(dir).filter((f) => f.endsWith(".jpg"));

for (const file of files) {
  const input = path.join(dir, file);
  const buf = fs.readFileSync(input);
  const meta = await sharp(buf, { failOn: "none" }).metadata();
  const isMobile = file.includes("mobile");

  const width = isMobile
    ? Math.max(meta.width || 0, 1600)
    : Math.max(meta.width || 0, 3200);
  const height = isMobile
    ? Math.max(meta.height || 0, 2844)
    : Math.max(meta.height || 0, 1800);

  const pipeline = () =>
    sharp(buf, { failOn: "none" }).resize(width, height, {
      fit: "cover",
      kernel: sharp.kernel.lanczos3,
      withoutEnlargement: false,
    });

  const outJpg = await pipeline()
    .jpeg({ quality: 98, mozjpeg: true, chromaSubsampling: "4:4:4" })
    .toBuffer();

  const outWebp = await pipeline()
    .webp({ quality: 96, effort: 6, smartSubsample: true })
    .toBuffer();

  fs.writeFileSync(input, outJpg);
  fs.writeFileSync(input.replace(/\.jpg$/i, ".webp"), outWebp);

  console.log(
    file,
    `${meta.width}x${meta.height}`,
    "->",
    `${width}x${height}`,
    `${Math.round(outJpg.length / 1024)}KB jpg`,
    `${Math.round(outWebp.length / 1024)}KB webp`,
  );
}
