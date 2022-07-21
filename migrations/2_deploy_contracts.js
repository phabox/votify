const Election = artifacts.require("./Election.sol");
const ElectionFactory = artifacts.require("./ElectionFactory.sol");
const VoteToken = artifacts.require("./VoteToken.sol");

module.exports = async function(deployer, network, accounts) {
  const userAddress = accounts[3];
  await deployer.deploy(VoteToken);
  await deployer.deploy(Election);
  return deployer.deploy(ElectionFactory, Election.address, VoteToken.address);
};
