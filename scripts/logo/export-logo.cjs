// Schreibt die freigegebene Logo-Variante in das Web-Projekt.
const fs = require('fs');
const opentype = require('opentype.js');
const svgpath = require('svgpath');

const web = '../xportal-web';
const { d: markD, w: markW, h: MARK_H } = JSON.parse(fs.readFileSync('mark.json', 'utf8'));
const font = opentype.parse(fs.readFileSync(process.env.LOGO_FONT || 'node_modules/@fontsource/inter/files/inter-latin-600-normal.woff').buffer);
const capH = font.tables.os2.sCapHeight / font.unitsPerEm;
const fontSize = 100 / capH;
const markScale = 1.08;
const k = (100 * markScale) / MARK_H;
const x0 = markW * k + 0.08 * fontSize;
const glyphs = font.getPath('PORTAL', x0, 100 * markScale, fontSize, { letterSpacing: 0.1, kerning: true });
const textD = glyphs.toPathData(2);
const wmMark = svgpath(markD).scale(k).round(2).toString();
const wmW = Math.ceil(glyphs.getBoundingBox().x2 + 1);
const wmH = Math.ceil(100 * markScale);
const markVB = `0 0 ${Math.ceil(markW)} ${MARK_H}`;

const ts = `// Erzeugt aus der Bildmarke und Inter SemiBold (scripts/logo). Nicht von Hand ändern.
export const MARK = {
  viewBox: '${markVB}',
  d: '${markD}',
}

export const WORDMARK = {
  viewBox: '0 0 ${wmW} ${wmH}',
  mark: '${wmMark}',
  text: '${textD}',
}
`;
fs.mkdirSync(`${web}/components/brand`, { recursive: true });
fs.writeFileSync(`${web}/components/brand/logo-paths.ts`, ts);

const ink = '#0e1411';
fs.writeFileSync(`${web}/public/brand/xportal-mark.svg`, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${markVB}"><path fill="${ink}" fill-rule="evenodd" d="${markD}"/></svg>\n`);
fs.writeFileSync(`${web}/public/brand/xportal-wordmark.svg`, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${wmW} ${wmH}" fill="${ink}"><path fill-rule="evenodd" d="${wmMark}"/><path d="${textD}"/></svg>\n`);

// App-Icon: weiße Bildmarke auf Markengrün, mit Rand.
const size = 512;
const inner = 300;
const ik = inner / Math.max(markW, MARK_H);
const iw = markW * ik;
const ih = MARK_H * ik;
const iconMark = svgpath(markD).scale(ik).translate((size - iw) / 2, (size - ih) / 2).round(2).toString();
const icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}"><rect width="${size}" height="${size}" rx="112" fill="#17643b"/><path fill="#fff" fill-rule="evenodd" d="${iconMark}"/></svg>\n`;
fs.writeFileSync(`${web}/app/icon.svg`, icon);
fs.writeFileSync('apple-icon.svg', icon.replace(' rx="112"', ''));
console.log('wordmark', wmW, wmH, 'mark', markVB);
