/**
 * convert-to-esm.js
 * Convierte todos los archivos del backend de CommonJS (require/module.exports)
 * a ES Modules (import/export).
 *
 * Uso: node convert-to-esm.js
 * Ejecutar desde la carpeta: backend/
 */

import { readFileSync, writeFileSync } from 'fs'
import { extname } from 'path'

// Lista de archivos a convertir
const FILES = [
  'src/middlewares/validate-middleware.js',
  'src/modules/auth/auth-controller.js',
  'src/modules/auth/auth-routes.js',
  'src/modules/auth/auth-schema.js',
  'src/modules/auth/auth-service.js',
  'src/modules/cash-register/cash-register-controller.js',
  'src/modules/cash-register/cash-register-routes.js',
  'src/modules/cash-register/cash-register-schema.js',
  'src/modules/cash-register/cash-register-service.js',
  'src/modules/inventory/inventory-controller.js',
  'src/modules/inventory/inventory-routes.js',
  'src/modules/inventory/inventory-schema.js',
  'src/modules/inventory/inventory-service.js',
  'src/modules/inventory/movements-service.js',
  'src/modules/products/product-controller.js',
  'src/modules/products/product-routes.js',
  'src/modules/products/product-schema.js',
  'src/modules/products/product-service.js',
  'src/modules/sales/sale-controller.js',
  'src/modules/sales/sale-routes.js',
  'src/modules/sales/sale-schema.js',
  'src/modules/sales/sale-service.js',
  'src/modules/users/user-controller.js',
  'src/modules/users/user-routes.js',
  'src/modules/users/user-schema.js',
  'src/modules/users/user-service.js',
  'src/utils/api-response.js',
  'src/utils/app-error.js',
  'src/utils/async-handler.js',
  'src/utils/calculations.js',
  'src/utils/logger.js',
  'src/config/env.js',
  'src/config/supabase-client.js',
  'src/routes/index.js',
]

// Agrega extension .js a rutas relativas que no la tengan
function addJsExtension(importPath) {
  const isRelative = importPath.startsWith('./') || importPath.startsWith('../')
  const hasExtension = extname(importPath) !== ''
  if (isRelative && !hasExtension) {
    return importPath + '.js'
  }
  return importPath
}

// Aplica todas las transformaciones CJS a ESM sobre el contenido del archivo
function convertContent(code) {
  let result = code

  // 1. const { X, Y } = require('mod')  →  import { X, Y } from 'mod'
  result = result.replace(
    /^const\s+\{([^}]+)\}\s*=\s*require\(['"]([^'"]+)['"]\)\s*;?/gm,
    (_, names, mod) => `import { ${names.trim()} } from '${addJsExtension(mod)}'`
  )

  // 2. const X = require('mod')  →  import X from 'mod'
  result = result.replace(
    /^const\s+([A-Za-z_$][\w$]*)\s*=\s*require\(['"]([^'"]+)['"]\)\s*;?/gm,
    (_, name, mod) => `import ${name} from '${addJsExtension(mod)}'`
  )

  // 3. module.exports = { X, Y, Z }  →  export { X, Y, Z }
  result = result.replace(
    /^module\.exports\s*=\s*\{([^}]+)\}\s*;?/gm,
    (_, names) => `export { ${names.trim()} }`
  )

  // 4. module.exports = algo  →  export default algo
  result = result.replace(
    /^module\.exports\s*=\s*(.+)/gm,
    (_, value) => `export default ${value.replace(/;$/, '')}`
  )

  return result
}

// Procesa cada archivo
let convertidos = 0
let errores = 0

for (const filePath of FILES) {
  try {
    const original = readFileSync(filePath, 'utf8')
    const convertido = convertContent(original)

    if (original !== convertido) {
      writeFileSync(filePath, convertido, 'utf8')
      console.log(`✓ Convertido: ${filePath}`)
      convertidos++
    } else {
      console.log(`— Sin cambios: ${filePath}`)
    }
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.log(`⚠ No encontrado (omitido): ${filePath}`)
    } else {
      console.error(`✗ Error en ${filePath}:`, err.message)
      errores++
    }
  }
}

console.log(`\nResultado: ${convertidos} archivos convertidos, ${errores} errores.`)
console.log('Ahora ejecuta: node server.js')
