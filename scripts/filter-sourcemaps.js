#!/usr/bin/env node
/**
 * Filter source maps to keep only application sources, removing third-party code.
 * This significantly reduces upload size for Faro while preserving useful stack traces.
 */

const fs = require('fs')
const path = require('path')

const STATIC_DIR = path.join(process.cwd(), '.next/static')

function findMapFiles(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      findMapFiles(fullPath, files)
    } else if (entry.name.endsWith('.map')) {
      files.push(fullPath)
    }
  }
  return files
}

// Check if a source path is from our application code
function isAppSource(source) {
  // App sources in Turbopack start with turbopack:///[project]/src/
  if (source.includes('[project]/src/')) return true
  // Also include project root files
  if (source.includes('[project]/') && !source.includes('node_modules')) return true
  return false
}

async function filterSourceMaps() {
  const mapFiles = findMapFiles(STATIC_DIR)

  let kept = 0
  let removed = 0
  let stripped = 0
  let totalSizeBefore = 0
  let totalSizeAfter = 0

  for (const fullPath of mapFiles) {
    const mapFile = path.relative(STATIC_DIR, fullPath)
    const sizeBefore = fs.statSync(fullPath).size
    totalSizeBefore += sizeBefore

    try {
      const content = JSON.parse(fs.readFileSync(fullPath, 'utf8'))
      const sources = content.sources || []

      // Find indices of app sources
      const appSourceIndices = sources
        .map((source, index) => isAppSource(source) ? index : -1)
        .filter(index => index !== -1)

      if (appSourceIndices.length === 0) {
        // No app sources - remove the file entirely
        fs.unlinkSync(fullPath)
        removed++
        if (process.env.VERBOSE) {
          console.log(`Removed: ${mapFile} (no app sources)`)
        }
      } else if (appSourceIndices.length < sources.length) {
        // Has mix of app and third-party - strip third-party sources
        const newContent = {
          version: content.version,
          sources: appSourceIndices.map(i => sources[i]),
          sourcesContent: content.sourcesContent
            ? appSourceIndices.map(i => content.sourcesContent[i])
            : undefined,
          names: content.names,
          mappings: '', // Clear mappings as they reference old indices
          ignoreList: content.ignoreList,
        }

        // Remove undefined fields
        Object.keys(newContent).forEach(key => {
          if (newContent[key] === undefined) delete newContent[key]
        })

        fs.writeFileSync(fullPath, JSON.stringify(newContent))
        stripped++

        const sizeAfter = fs.statSync(fullPath).size
        totalSizeAfter += sizeAfter

        if (process.env.VERBOSE) {
          console.log(`Stripped: ${mapFile} (${sources.length} -> ${appSourceIndices.length} sources, ${(sizeBefore/1024).toFixed(0)}KB -> ${(sizeAfter/1024).toFixed(0)}KB)`)
        }
      } else {
        // All sources are app sources - keep as is
        kept++
        totalSizeAfter += sizeBefore
        if (process.env.VERBOSE) {
          console.log(`Kept: ${mapFile} (all app sources)`)
        }
      }
    } catch (err) {
      console.error(`Error processing ${mapFile}:`, err.message)
      kept++
      totalSizeAfter += sizeBefore
    }
  }

  console.log(`Source maps: ${kept} kept, ${stripped} stripped, ${removed} removed`)
  console.log(`Size: ${(totalSizeBefore/1024/1024).toFixed(1)}MB -> ${(totalSizeAfter/1024/1024).toFixed(1)}MB`)
}

filterSourceMaps().catch(err => {
  console.error('Failed to filter source maps:', err)
  process.exit(1)
})
