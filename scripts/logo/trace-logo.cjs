// Zeichnet das Logo (xportal-logo.jpg) als Vektor nach: potrace, dann auf Höhe 100 normiert.
// Vorbereitung: Bild vierfach vergrößern, leicht weichzeichnen, bei 128 in Schwarz-Weiß trennen (PNG).
// Aufruf mit potrace und svgpath (npm): node trace-logo.cjs <vorbereitetes-png> <ausgabe.json>
const fs = require('fs')
const potrace = require('potrace')
const svgpath = require('svgpath')

const [, , input, output] = process.argv
potrace.trace(input, { threshold: 128, turdSize: 400, optCurve: true, optTolerance: 0.6, alphaMax: 1.0 }, (error, svg) => {
  if (error) throw error
  const d = svg.match(/ d="([^"]+)"/)[1]
  // Teilpfade trennen, je Teilpfad Begrenzung bestimmen.
  const parts = d.split(/(?=M)/).map((part) => part.trim()).filter(Boolean)
  const boxOf = (part) => {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
    svgpath(part).abs().iterate((segment) => {
      for (let i = 1; i + 1 < segment.length; i += 2) {
        const x = segment[i], y = segment[i + 1]
        minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y)
      }
    })
    return { minX, minY, maxX, maxY }
  }
  const boxes = parts.map(boxOf)
  const all = boxes.reduce((a, b) => ({ minX: Math.min(a.minX, b.minX), minY: Math.min(a.minY, b.minY), maxX: Math.max(a.maxX, b.maxX), maxY: Math.max(a.maxY, b.maxY) }))
  const scale = 100 / (all.maxY - all.minY)
  const norm = (part) => svgpath(part).abs().translate(-all.minX, -all.minY).scale(scale).round(1).toString()
  const width = Math.ceil((all.maxX - all.minX) * scale)
  // Das X endet links vom P; sein Schwung reicht unter das P, beginnt aber weit links.
  const pStart = Math.min(...boxes.filter((box) => box.minX > all.minX + (all.maxX - all.minX) * 0.2).map((box) => box.minX))
  const markParts = parts.filter((_, index) => boxes[index].minX < pStart)
  const markBoxes = boxes.filter((box) => box.minX < pStart)
  const markMaxX = Math.max(...markBoxes.map((box) => box.maxX))
  const result = {
    wordmark: { viewBox: `0 0 ${width} 100`, d: parts.map(norm).join(' ') },
    mark: { viewBox: `0 0 ${Math.ceil((markMaxX - all.minX) * scale)} 100`, d: markParts.map(norm).join(' ') },
    parts: parts.length,
    markParts: markParts.length,
  }
  fs.writeFileSync(output, JSON.stringify(result))
  console.log({ width, parts: parts.length, markParts: markParts.length, markWidth: result.mark.viewBox, size: result.wordmark.d.length })
})
