// Baut Bildmarke und Wortmarke als saubere SVG-Pfade.
const fs = require('fs');
const opentype = require('opentype.js');
const svgpath = require('svgpath');

const traced = fs.readFileSync('mark-traced2.svg', 'utf8');
const d = traced.match(/ d="([^"]+)"/)[1];
const box = { x: 91.819, y: 57.742, w: 1492.139, h: 1216.877 };
const MARK_H = 100;
const s = MARK_H / box.h;
const markD = svgpath(d).translate(-box.x, -box.y).scale(s).round(2).toString();
const markW = +(box.w * s).toFixed(2);
fs.writeFileSync('mark.json', JSON.stringify({ d: markD, w: markW, h: MARK_H }));

function wordmark({ weight, tracking, markScale, gap }) {
  const font = opentype.parse(fs.readFileSync(`node_modules/@fontsource/inter/files/inter-latin-${weight}-normal.woff`).buffer);
  const capH = font.tables.os2.sCapHeight / font.unitsPerEm; // in em
  const fontSize = 100 / capH; // Versalhöhe = 100
  const markH = 100 * markScale;
  const k = markH / MARK_H;
  const mW = markW * k;
  const x0 = mW + gap * fontSize;
  const glyphPath = font.getPath('PORTAL', x0, 100, fontSize, { letterSpacing: tracking, kerning: true });
  const bb = glyphPath.getBoundingBox();
  const textD = glyphPath.toPathData(2);
  const mark = svgpath(markD).scale(k).translate(0, 100 - markH).round(2).toString();
  const width = Math.ceil(bb.x2 + 1);
  return { svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} 100"><path fill-rule="evenodd" d="${mark}"/><path d="${textD}"/></svg>`, width, mark, textD };
}

const variants = [
  { weight: 600, tracking: 0.08, markScale: 1.0, gap: 0.06 },
  { weight: 600, tracking: 0.1, markScale: 1.08, gap: 0.08 },
  { weight: 700, tracking: 0.1, markScale: 1.08, gap: 0.08 },
  { weight: 500, tracking: 0.12, markScale: 1.08, gap: 0.1 },
];
let html = '<html><body style="margin:0;padding:24px;background:#fff;font-family:sans-serif;display:flex;flex-direction:column;gap:28px">';
variants.forEach((v, i) => {
  const w = wordmark(v);
  fs.writeFileSync(`wordmark-${i}.svg`, w.svg);
  html += `<div style="display:flex;align-items:center;gap:40px"><span style="width:30px;font-size:12px;color:#888">${i}</span><img src="wordmark-${i}.svg" style="height:56px"><span style="display:inline-flex;align-items:center;gap:28px;font:15px Inter,sans-serif;color:#0e1411"><img src="wordmark-${i}.svg" style="height:17px">Plattform</span><span style="background:#12402A;padding:10px 14px;border-radius:8px;display:inline-flex"><img src="wordmark-${i}.svg" style="height:14px;filter:invert(1)"></span></div>`;
});
html += '</body></html>';
fs.writeFileSync('wordmarks.html', html);
console.log('ok', markW);
