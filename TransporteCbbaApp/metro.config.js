const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// 1. Forzamos el soporte de módulos web modernos
config.resolver.sourceExts.push('mjs');

// 2. Desactivamos Hermes específicamente para la plataforma Web si Metro se marea
if (config.transformer) {
  config.transformer.getTransformOptions = async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: true,
      engine: 'jsc', // Fuerza el motor clásico bimodal compatible con navegadores
    },
  });
}

module.exports = config;