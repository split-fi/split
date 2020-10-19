const withTM = require("next-transpile-modules")(["split-contracts"]);

module.exports = Object.assign({}, withTM(), { target: "serverless" });
