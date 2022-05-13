const MagicToken = artifacts.require("MagicToken");
const MagicRoom = artifacts.require("MagicRoom");

module.exports = async function (deployer, network, accounts) {
  await deployer.deploy(MagicToken, { overwrite: false, from: accounts[0] });
  await deployer.deploy(MagicRoom, MagicToken.address, { overwrite: false, from: accounts[0] });
};
