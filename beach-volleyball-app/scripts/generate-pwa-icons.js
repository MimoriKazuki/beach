// PWAアイコン生成用のプレースホルダースクリプト
// 実際の実装では sharp や canvas などのライブラリを使用します

const fs = require('fs');
const path = require('path');

// アイコンのサイズ
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// SVGテンプレート（ビーチボールバレーのアイコン）
const createSVG = (size) => `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#3b82f6"/>
  <circle cx="${size/2}" cy="${size/2}" r="${size/3}" fill="white"/>
  <path d="M${size/2} ${size/6} L${size/2} ${size*5/6}" stroke="#3b82f6" stroke-width="${size/20}" />
  <path d="M${size/6} ${size/2} L${size*5/6} ${size/2}" stroke="#3b82f6" stroke-width="${size/20}" />
  <circle cx="${size/2}" cy="${size/2}" r="${size/3}" fill="none" stroke="#3b82f6" stroke-width="${size/20}"/>
</svg>
`;

// public/iconsディレクトリを作成
const iconsDir = path.join(__dirname, '../public/icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// 各サイズのSVGファイルを生成
sizes.forEach(size => {
  const svg = createSVG(size);
  const filename = path.join(iconsDir, `icon-${size}x${size}.svg`);
  fs.writeFileSync(filename, svg);
  console.log(`Generated: ${filename}`);
});

console.log('PWA icons generated successfully!');