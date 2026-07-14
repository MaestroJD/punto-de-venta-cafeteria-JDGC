// Configuracion de Jest para el proyecto POS Cafeteria
module.exports = {
  // Usa babel-jest para transformar archivos .js y .mjs
  transform: {
    '^.+\\.m?js$': 'babel-jest',
  },

  // Entorno de Node (no browser)
  testEnvironment: 'node',

  // Carpeta donde se ubican las pruebas
  testMatch: ['**/__tests__/**/*.test.js'],

  // Muestra cada prueba individual en la terminal
  verbose: true,

  // Limpia mocks automaticamente entre pruebas
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,

  // Cobertura de codigo (ejecutar con --coverage)
  collectCoverageFrom: [
    'src/modules/**/*.js',
    'src/utils/**/*.js',
    '!src/**/*.test.js',
  ],

  // Evita warnings de transformacion en node_modules
  transformIgnorePatterns: ['/node_modules/(?!(@supabase)/)'],
}
