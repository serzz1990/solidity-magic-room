const utils = require("./helpers/utils");
const MagicToken = artifacts.require("MagicToken");
const Web3 = require("web3");

contract("MagicToken", (accounts) => {
  let [alice, bob, cavin] = accounts;
  let contractInstance;
  let totalSupply;

  beforeEach(async () => {
    contractInstance = await MagicToken.new();
    totalSupply = Web3.utils.fromWei(await contractInstance.totalSupply.call());
  });

  it("mint", async () => {
    await contractInstance.mint(Web3.utils.toWei("50"));
    const currentTotalSupply = Web3.utils.fromWei(await contractInstance.totalSupply.call());
    expect(+totalSupply + 50 === +currentTotalSupply).to.equal(true);
  })

  it("mint only owner", async () => {
    await utils.shouldThrow(contractInstance.mint(Web3.utils.toWei("1000000000"), { from: bob }));
    const currentTotalSupply = Web3.utils.fromWei(await contractInstance.totalSupply.call());
  })

  it("transfer", async () => {
    await contractInstance.transfer(bob, Web3.utils.toWei("200"), { from: alice });
    await contractInstance.transfer(cavin, Web3.utils.toWei("100"), { from: bob });
    const balance = Web3.utils.fromWei(await contractInstance.balanceOf.call(cavin));
    expect(balance === "100").to.equal(true);
  })

})
