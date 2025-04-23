const LawConsensus = artifacts.require("LawConsensus");

module.exports = function (deployer) {
  deployer.deploy(LawConsensus);
};
