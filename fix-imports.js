/**
 * fix-imports.js
 * Corrige los imports en controladores y rutas:
 * - Archivos con "export { X, Y }" necesitan "import * as X from"
 * - Archivos con "export default X"  necesitan "import X from"  (ya estan bien)
 *
 * Uso: node fix-imports.js
 * Ejecutar desde: backend/
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs'
import { join, extname } from 'path'

// Paso 1: determina si un archivo tiene solo exports nombrados (sin default)
function hasOnlyNamedExports(filePath) {
  try {
    const code = readFileSync(filePath, 'utf8')
    const hasNamed  = /^export\s+\{/m.test(code)
    const hasDefault = /^export\s+default\b/m.test(code)
    return hasNamed && !hasDefault
  } catch {
    return false
  }
}

// Paso 2: recorre todos los .js de src/ recursivamente
function getAllJsFiles(dir) {
  const results = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) {
      results.push(...getAllJsFiles(full))
    } else if (extname(full) === '.js') {
      results.push(full)
    }
  }
  return results
}

// Normaliza separadores de ruta a forward slash
function normalize(p) {
  return p.replace(/\\/g, '/')
}

const SRC = 'src'
const allFiles = getAllJsFiles(SRC)

// Construye un Set de archivos con solo exports nombrados
const namedOnlyFiles = new Set()
for (const f of allFiles) {
  if (hasOnlyNamedExports(f)) {
    namedOnlyFiles.add(normalize(f))
  }
}

console.log(`\nArchivos con exports nombrados detectados (${namedOnlyFiles.size}):`)
for (const f of namedOnlyFiles) console.log(`  - ${f}`)

// Paso 3: en cada archivo, corrige los imports que apuntan a esos archivos
let totalCambios = 0

for (const filePath of allFiles) {
  const original = readFileSync(filePath, 'utf8')
  const fileDir   = normalize(filePath).split('/').slice(0, -1).join('/')

  // Busca: import X from './algo.js' o import X from '../algo.js'
  const importRegex = /^import\s+(\w+)\s+from\s+'(\.\.?\/[^']+)'/gm

  const fixed = original.replace(importRegex, (match, name, importPath) => {
    // Resuelve la ruta absoluta del modulo importado
    const resolved = normalize(join(fileDir, importPath))

    if (namedOnlyFiles.has(resolved)) {
      // Necesita namespace import porque el modulo solo tiene exports nombrados
      return `import * as ${name} from '${importPath}'`
    }
    // Default export: el import esta bien como esta
    return match
  })

  if (fixed !== original) {
    writeFileSync(filePath, fixed, 'utf8')
    const numCambios = (fixed.match(/import \* as/g) || []).length -
                       (original.match(/import \* as/g) || []).length
    console.log(`\n✓ ${normalize(filePath)}`)
    totalCambios++
  }
}

console.log(`\nResultado: ${totalCambios} archivos actualizados.`)
console.log('Ejecuta: node server.js')
