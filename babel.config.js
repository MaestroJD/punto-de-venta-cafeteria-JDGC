// Configuracion de Babel para que Jest pueda procesar ES modules (import/export)
module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: { node: 'current' },
        // Convierte ES modules a CommonJS en tiempo de prueba
        modules: 'commonjs',
      },
    ],
  ],
}
