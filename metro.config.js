const { getDefaultConfig } = require('expo/metro-config');
const exclusionList = require('metro-config/src/defaults/exclusionList');

module.exports = (() => {
  const config = getDefaultConfig(__dirname);
  
  // Block unnecessary directories and files
  config.resolver.blockList = exclusionList([
    /dist\/.*/,
    /build\/.*/,
    /\.next\/.*/,
    /coverage\/.*/,
    /ios\/.*/,
    /android\/.*/,
    /node_modules\/.*\/node_modules\/.*/,
    /\.git\/.*/,
    /\.expo\/.*/,
    /\.vscode\/.*/,
    /\.idea\/.*/,
    /\.DS_Store/,
    /\.env.*/,
    /\.log/,
    /\.lock/,
  ]);

  // Optimize file watching
  config.watchFolders = [__dirname];
  config.resolver.platforms = ['ios', 'android', 'native', 'web'];
  
  // Reduce memory usage
  config.maxWorkers = 2;
  config.transformer.minifierConfig = {
    mangle: {
      keep_fnames: true,
    },
    output: {
      ascii_only: true,
      quote_style: 3,
      wrap_iife: true,
    },
    sourceMap: {
      includeSources: false,
    },
    toplevel: false,
    compress: {
      reduce_funcs: false,
    },
  };

  return config;
})();
