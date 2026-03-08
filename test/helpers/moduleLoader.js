const path = require("path");

const clearModuleCache = (relativeModulePath) => {
  const absolutePath = path.resolve(__dirname, "..", "..", relativeModulePath);
  const resolvedPath = require.resolve(absolutePath);
  delete require.cache[resolvedPath];
};

const loadFresh = (relativeModulePath) => {
  clearModuleCache(relativeModulePath);
  const absolutePath = path.resolve(__dirname, "..", "..", relativeModulePath);
  return require(absolutePath);
};

module.exports = {
  clearModuleCache,
  loadFresh,
};
