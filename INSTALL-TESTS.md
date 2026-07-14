# Instalacion de pruebas Jest — POS Cafeteria

## 1. Descomprime el zip dentro de la carpeta `backend/`

La estructura quedara asi:
```
backend/
├── babel.config.js       ← NUEVO
├── jest.config.js        ← NUEVO
├── INSTALL-TESTS.md      ← NUEVO
├── __tests__/            ← NUEVO
│   ├── stock-insuficiente.test.js
│   ├── calculos-venta.test.js
│   └── corte-caja.test.js
├── src/                  (sin cambios)
├── app.js                (sin cambios)
├── server.js             (sin cambios)
└── package.json          (sin cambios)
```

## 2. Instala las dependencias de prueba

```bash
npm install --save-dev \
  jest \
  babel-jest \
  @babel/core \
  @babel/preset-env
```

## 3. Agrega el script de test a package.json

En la seccion `"scripts"` de tu `package.json` existente, agrega:

```json
"test":          "node --experimental-vm-modules node_modules/.bin/jest",
"test:watch":    "node --experimental-vm-modules node_modules/.bin/jest --watch",
"test:coverage": "node --experimental-vm-modules node_modules/.bin/jest --coverage"
```

## 4. Ejecuta las pruebas

```bash
# Todas las pruebas
npm test

# Con reporte de cobertura
npm run test:coverage

# Solo un archivo
npm test -- stock-insuficiente

# Modo watch (re-ejecuta al guardar cambios)
npm run test:watch
```

## Archivos de prueba incluidos

| Archivo                        | HUs cubiertas         | Escenarios |
|--------------------------------|-----------------------|------------|
| `stock-insuficiente.test.js`   | HU-05, HU-10, T-22   | 8 pruebas  |
| `calculos-venta.test.js`       | HU-05, HU-06, T-27   | 10 pruebas |
| `corte-caja.test.js`           | HU-13, HU-14, T-38   | 12 pruebas |

## Nota sobre mocks

Todas las pruebas usan `jest.mock('../src/config/supabase-client')` para
aislar la logica de negocio de la base de datos real. Ninguna prueba
hace conexiones a Supabase.
