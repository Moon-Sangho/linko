#!/usr/bin/env node
/**
 * Build platform icons from resources/icon.svg
 *
 * Outputs:
 *   resources/icon.icns  — macOS
 *   resources/icon.ico   — Windows
 *   resources/icon.png   — Linux (512×512)
 */

import { Resvg } from '@resvg/resvg-js'
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from 'fs'
import { execSync } from 'child_process'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const svgPath = join(root, 'resources', 'icon.svg')
const svgData = readFileSync(svgPath, 'utf-8')

function renderPng(size) {
  const resvg = new Resvg(svgData, {
    fitTo: { mode: 'width', value: size },
  })
  return resvg.render().asPng()
}

// ── 1. Linux PNG (512×512) ──────────────────────────────────────────────────
console.log('Generating icon.png (512×512)...')
writeFileSync(join(root, 'resources', 'icon.png'), renderPng(512))
console.log('  ✓ resources/icon.png')

// ── 2. macOS .icns via iconutil ─────────────────────────────────────────────
const ICNS_SIZES = [16, 32, 64, 128, 256, 512, 1024]
const iconsetDir = join(root, 'resources', 'icon.iconset')

if (existsSync(iconsetDir)) rmSync(iconsetDir, { recursive: true })
mkdirSync(iconsetDir)

console.log('Generating .iconset PNGs...')
for (const size of ICNS_SIZES) {
  const png = renderPng(size)
  writeFileSync(join(iconsetDir, `icon_${size}x${size}.png`), png)
  // Retina (@2x) for sizes up to 512
  if (size <= 512) {
    writeFileSync(join(iconsetDir, `icon_${size}x${size}@2x.png`), renderPng(size * 2))
  }
}

console.log('Running iconutil...')
execSync(`iconutil -c icns "${iconsetDir}" -o "${join(root, 'resources', 'icon.icns')}"`)
rmSync(iconsetDir, { recursive: true })
console.log('  ✓ resources/icon.icns')

// ── 3. Windows .ico (multi-size) via sips + manual ICO assembly ─────────────
// ICO format: header + directory + raw PNG blobs
console.log('Generating icon.ico...')

const ICO_SIZES = [16, 32, 48, 64, 128, 256]
const pngBuffers = ICO_SIZES.map((s) => renderPng(s))

// ICO header: 3 × WORD (reserved=0, type=1, count=n)
const count = ICO_SIZES.length
const headerSize = 6
const dirEntrySize = 16
const dirSize = dirEntrySize * count

let offset = headerSize + dirSize

const header = Buffer.alloc(headerSize)
header.writeUInt16LE(0, 0)       // reserved
header.writeUInt16LE(1, 2)       // type: 1 = ICO
header.writeUInt16LE(count, 4)   // number of images

const dirEntries = []
for (let i = 0; i < count; i++) {
  const size = ICO_SIZES[i]
  const png = pngBuffers[i]
  const entry = Buffer.alloc(dirEntrySize)
  entry.writeUInt8(size >= 256 ? 0 : size, 0)   // width  (0 = 256)
  entry.writeUInt8(size >= 256 ? 0 : size, 1)   // height (0 = 256)
  entry.writeUInt8(0, 2)                          // color count
  entry.writeUInt8(0, 3)                          // reserved
  entry.writeUInt16LE(1, 4)                       // color planes
  entry.writeUInt16LE(32, 6)                      // bits per pixel
  entry.writeUInt32LE(png.length, 8)              // size of image data
  entry.writeUInt32LE(offset, 12)                 // offset of image data
  offset += png.length
  dirEntries.push(entry)
}

const icoBuffer = Buffer.concat([header, ...dirEntries, ...pngBuffers])
writeFileSync(join(root, 'resources', 'icon.ico'), icoBuffer)
console.log('  ✓ resources/icon.ico')

console.log('\nDone. All icons generated in resources/')
