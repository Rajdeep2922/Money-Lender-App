module.exports = {
  process(sourceText) {
    return {
      code: sourceText.replace(/\/\/ Named exports for ES Modules[\s\S]*$/m, ''),
    };
  },
};
