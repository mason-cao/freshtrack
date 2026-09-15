import { mkdirSync } from "node:fs";
import sharp from "sharp";

const COLORS = {
  sage: [82, 122, 82, 255],
  cream: [250, 248, 245, 255],
  sageLight: [220, 230, 220, 255],
};

function iconPixels(size) {
  const pixels = Buffer.alloc(size * size * 4);
  const scale = size / 512;

  function setPixel(x, y, color, opacity = 1) {
    if (x < 0 || y < 0 || x >= size || y >= size) return;
    const index = (y * size + x) * 4;
    for (let i = 0; i < 3; i++) {
      pixels[index + i] = Math.round(
        pixels[index + i] * (1 - opacity) + color[i] * opacity
      );
    }
    pixels[index + 3] = 255;
  }

  function fill(color) {
    for (let i = 0; i < pixels.length; i += 4) {
      pixels[i] = color[0];
      pixels[i + 1] = color[1];
      pixels[i + 2] = color[2];
      pixels[i + 3] = color[3];
    }
  }

  function rect(x, y, width, height, color, opacity = 1) {
    const left = Math.round(x * scale);
    const top = Math.round(y * scale);
    const right = Math.round((x + width) * scale);
    const bottom = Math.round((y + height) * scale);
    for (let py = top; py < bottom; py++) {
      for (let px = left; px < right; px++) setPixel(px, py, color, opacity);
    }
  }

  function circle(cx, cy, radius, color, opacity = 1) {
    const centerX = cx * scale;
    const centerY = cy * scale;
    const r = radius * scale;
    const minX = Math.floor(centerX - r);
    const maxX = Math.ceil(centerX + r);
    const minY = Math.floor(centerY - r);
    const maxY = Math.ceil(centerY + r);
    for (let py = minY; py <= maxY; py++) {
      for (let px = minX; px <= maxX; px++) {
        const dx = px + 0.5 - centerX;
        const dy = py + 0.5 - centerY;
        if (dx * dx + dy * dy <= r * r) setPixel(px, py, color, opacity);
      }
    }
  }

  function ellipse(cx, cy, rx, ry, rotationDeg, color, opacity = 1) {
    const centerX = cx * scale;
    const centerY = cy * scale;
    const radiusX = rx * scale;
    const radiusY = ry * scale;
    const angle = (rotationDeg * Math.PI) / 180;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const bound = Math.ceil(Math.max(radiusX, radiusY) * 1.6);
    for (let py = Math.floor(centerY - bound); py <= centerY + bound; py++) {
      for (let px = Math.floor(centerX - bound); px <= centerX + bound; px++) {
        const dx = px + 0.5 - centerX;
        const dy = py + 0.5 - centerY;
        const localX = dx * cos + dy * sin;
        const localY = -dx * sin + dy * cos;
        if ((localX * localX) / (radiusX * radiusX) + (localY * localY) / (radiusY * radiusY) <= 1) {
          setPixel(px, py, color, opacity);
        }
      }
    }
  }

  fill(COLORS.sage);
  circle(256, 256, 164, COLORS.cream, 0.13);
  ellipse(372, 148, 52, 19, 42, COLORS.sageLight, 1);
  ellipse(374, 148, 31, 6, 42, COLORS.cream, 0.72);

  rect(144, 145, 54, 245, COLORS.cream);
  rect(144, 145, 138, 45, COLORS.cream);
  rect(144, 249, 129, 43, COLORS.cream);

  rect(262, 145, 194, 45, COLORS.cream);
  rect(332, 145, 54, 245, COLORS.cream);

  return pixels;
}

mkdirSync("public", { recursive: true });
for (const [file, size] of [
  ["public/icon-192.png", 192],
  ["public/icon-512.png", 512],
  ["public/icon-512-maskable.png", 512],
  ["public/apple-touch-icon.png", 180],
]) {
  await sharp(iconPixels(size), { raw: { width: size, height: size, channels: 4 } })
    .png({ compressionLevel: 9 })
    .toFile(file);
}
