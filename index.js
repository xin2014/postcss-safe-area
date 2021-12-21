const browserslist = require('browserslist');
const caniuse = require('caniuse-lite');

// Apple vars
const vars = [
  'safe-area-inset-top',
  'safe-area-inset-bottom',
  'safe-area-inset-left',
  'safe-area-inset-right',
];

module.exports = () => {
  // Get browser capabilities
  const browsers = browserslist();
  const stats = caniuse.feature(caniuse.features['css-env-function']).stats;
  const capabilities = browsers.map(browser => {
    const [vendor, version] = browser.split(' ');
    return stats[vendor][version];
  });

  const useConstantFunction = capabilities.some(capability => capability === 'a #1');
  if (!useConstantFunction) {
    return {
      postcssPlugin: 'postcss-safe-area'
    };
  }

  // Detects env(..., ...)
  const expr = new RegExp(`env\\(\\s*(${vars.join('|')})\\s*,?\\s*([^)]+)?\\s*\\)`, 'g');
  return {
    postcssPlugin: 'postcss-safe-area',
    Declaration (decl) {
      // env(...) -> constant(...)
      if (useConstantFunction) {
        const fallback = decl.value.replace(expr, (match, param, defaultValue) => {
          return `constant(${param}${defaultValue ? `, ${defaultValue}` : ''})`;
        });
        if (fallback !== decl.value) {
          decl.cloneBefore({ value: fallback });
        }
      }
    }
  };
};
module.exports.postcss = true
