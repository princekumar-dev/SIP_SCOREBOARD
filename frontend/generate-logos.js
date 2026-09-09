

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function main() {
  const inputPath = 'C:/Users/princ/.gemini/antigravity-ide/brain/1d8b2697-dbc6-489e-9fba-9ccedba8845a/.user_uploaded/media_1788881874457.png';
  const img = sharp(inputPath);
  const meta = await img.metadata();

  // 1. Full transparent logo (clean knockout of white background)
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
  const transBuf = Buffer.alloc(info.width * info.height * 4);
  const darkBuf = Buffer.alloc(info.width * info.height * 4);

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];

    const brightness = (r + g + b) / 3;
    let alpha = 255;
    if (brightness > 245) {
      alpha = 0;
    } else if (brightness > 220) {
      alpha = Math.round(255 * (245 - brightness) / 25);
    }

    transBuf[i] = r;
    transBuf[i + 1] = g;
    transBuf[i + 2] = b;
    transBuf[i + 3] = Math.min(a, alpha);

    if (alpha > 0) {
      if (r < 65 && g < 75 && b < 130) {
        darkBuf[i] = 255;
        darkBuf[i + 1] = 255;
        darkBuf[i + 2] = 255;
        darkBuf[i + 3] = alpha;
      } else {
        darkBuf[i] = r;
        darkBuf[i + 1] = g;
        darkBuf[i + 2] = b;
        darkBuf[i + 3] = alpha;
      }
    } else {
      darkBuf[i + 3] = 0;
    }
  }

  // Save public/msgi-logo.png
  await sharp(transBuf, { raw: { width: info.width, height: info.height, channels: 4 } })
    .trim()
    .png()
    .toFile('public/msgi-logo.png');

  // Save public/msgi-logo-light.png
  await sharp(darkBuf, { raw: { width: info.width, height: info.height, channels: 4 } })
    .trim()
    .png()
    .toFile('public/msgi-logo-light.png');

  // 2. High-res badge version for navbar/header and icons
  const badgeSize = 256;
  const padding = 20;
  const contentSize = badgeSize - (padding * 2);

  // Extract emblem without white border
  const trimmedBuf = await sharp('public/msgi-logo.png').toBuffer();
  const emblemResized = await sharp(trimmedBuf)
    .resize(contentSize, contentSize, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .toBuffer();

  const circleSvg = `
    <svg width="${badgeSize}" height="${badgeSize}" xmlns="http://www.w3.org/2000/svg">
      <circle cx="${badgeSize/2}" cy="${badgeSize/2}" r="${badgeSize/2 - 4}" fill="#ffffff" stroke="#e4b84a" stroke-width="6"/>
    </svg>
  `;

  await sharp(Buffer.from(circleSvg))
    .composite([{ input: emblemResized, top: padding, left: padding }])
    .png()
    .toFile('public/msgi-badge.png');

  // Rectangular card badge
  const rectSvg = `
    <svg width="${badgeSize}" height="${badgeSize}" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="${badgeSize - 6}" height="${badgeSize - 6}" rx="48" fill="#ffffff" stroke="#e4b84a" stroke-width="6"/>
    </svg>
  `;

  await sharp(Buffer.from(rectSvg))
    .composite([{ input: emblemResized, top: padding, left: padding }])
    .png()
    .toFile('public/msgi-badge-rect.png');

  // 3. Favicon and Touch Icons
  const favBadge = await sharp('public/msgi-badge.png').toBuffer();
  
  await sharp(favBadge).resize(32, 32).png().toFile('public/favicon.png');
  await sharp(favBadge).resize(32, 32).png().toFile('public/favicon.ico');
  await sharp(favBadge).resize(192, 192).png().toFile('public/icon-192.png');
  await sharp(favBadge).resize(512, 512).png().toFile('public/icon-512.png');
  await sharp(favBadge).resize(180, 180).png().toFile('public/apple-touch-icon.png');

  // Next.js App Router root icons
  await sharp(favBadge).resize(32, 32).png().toFile('src/app/favicon.ico');
  await sharp(favBadge).resize(192, 192).png().toFile('src/app/icon.png');
  await sharp(favBadge).resize(180, 180).png().toFile('src/app/apple-icon.png');

  console.log('All logo assets generated successfully!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
