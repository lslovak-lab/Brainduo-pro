module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', {
        jsxImportSource: 'nativewind',
        // Force hermes-v0 profile so Babel transpiles private class fields
        // before hermesc sees them (hermesc in this RN build lacks that support).
        unstable_transformProfile: 'hermes-v0',
      }],
      'nativewind/babel',
    ],
  };
};
