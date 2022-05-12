const utils = require("./helpers/utils");
const Web3 = require("web3");
const MagicRoom = artifacts.require("MagicRoom");
const MagicToken = artifacts.require("MagicToken");

contract("MagicRoom", (accounts) => {
  let [alice, bob, cavin] = accounts;
  let tokenContractInstance;
  let contractInstance;

  beforeEach(async () => {
    tokenContractInstance = await MagicToken.new();
    contractInstance = await MagicRoom.new(
      tokenContractInstance.address
    );
  });

  context("create a new room", async () => {
    it("should be able to create a new room", async () => {
      const result = await contractInstance.createRoom();
      expect(result.receipt.status).to.equal(true);
    })
    it("should not allow two room", async () => {
      await contractInstance.createRoom();
      await utils.shouldThrow(contractInstance.createRoom());
    })
  })

  context("view fns", async () => {
    it("should return current room", async () => {
      await contractInstance.createRoom();
      const result = await contractInstance.getCurrentRoom.call();
      expect(result.bank.toNumber() === 0).to.equal(true);
      expect(result.active).to.equal(true);
    })
  })

  context("enter to room", async () => {
    it("on chair", async () => {
      await contractInstance.createRoom();
      await tokenContractInstance.transfer(bob, Web3.utils.toWei("100"));
      await tokenContractInstance.approve(contractInstance.address, Web3.utils.toWei("1000000"), { from: bob });
      await contractInstance.enterToRoom(Web3.utils.toWei("1"), { from: bob });
      const room = await contractInstance.getCurrentRoom.call();
      expect(room.chairs.includes(bob)).to.equal(true);
    })
    it("amount should go up", async () => {
      await contractInstance.createRoom();

      await tokenContractInstance.transfer(bob, Web3.utils.toWei("100"));
      await tokenContractInstance.transfer(cavin, Web3.utils.toWei("100"));

      await tokenContractInstance.approve(contractInstance.address, Web3.utils.toWei("1000000"), { from: bob });
      await tokenContractInstance.approve(contractInstance.address, Web3.utils.toWei("1000000"), { from: cavin });

      const resultBob = await contractInstance.enterToRoom(Web3.utils.toWei("1"), { from: bob });
      const resultCavin = await contractInstance.enterToRoom(Web3.utils.toWei("2"), { from: cavin });

      expect(resultBob.receipt.status).to.equal(true);
      expect(resultCavin.receipt.status).to.equal(true)
      await utils.shouldThrow(contractInstance.enterToRoom(Web3.utils.toWei("2"), { from: cavin }));
    })
    it("rewards", async () => {
      await contractInstance.createRoom();

      await tokenContractInstance.transfer(bob, Web3.utils.toWei("100"));
      await tokenContractInstance.transfer(cavin, Web3.utils.toWei("100"));

      await tokenContractInstance.approve(contractInstance.address, Web3.utils.toWei("1000000"), { from: bob });
      await tokenContractInstance.approve(contractInstance.address, Web3.utils.toWei("1000000"), { from: cavin });

      await contractInstance.enterToRoom(Web3.utils.toWei("1"), { from: bob });
      await contractInstance.enterToRoom(Web3.utils.toWei("2"), { from: cavin });

      const balanceBob = +Web3.utils.fromWei(await tokenContractInstance.balanceOf(bob));
      const balanceCavin = +Web3.utils.fromWei(await tokenContractInstance.balanceOf(cavin));

      expect(balanceBob > 99).to.equal(true);
      expect(balanceCavin === 98).to.equal(true);
    })
  })

  it("finish", async () => {
    await contractInstance.createRoom();

    await tokenContractInstance.transfer(bob, Web3.utils.toWei("100"));
    await tokenContractInstance.transfer(cavin, Web3.utils.toWei("100"));

    await tokenContractInstance.approve(contractInstance.address, Web3.utils.toWei("1000000"), { from: bob });
    await tokenContractInstance.approve(contractInstance.address, Web3.utils.toWei("1000000"), { from: cavin });

    await contractInstance.enterToRoom(Web3.utils.toWei("1"), { from: bob });
    await contractInstance.enterToRoom(Web3.utils.toWei("2"), { from: cavin });
    const balanceBob1 = Web3.utils.fromWei(await tokenContractInstance.balanceOf(bob));

    await contractInstance.finish();

    const balanceBob2 = Web3.utils.fromWei(await tokenContractInstance.balanceOf(bob));
    expect(balanceBob1 === "100").to.equal(true);
    expect(balanceBob2 === "100.72").to.equal(true);
  })

  it("withdraw", async () => {
    await contractInstance.createRoom();

    await tokenContractInstance.transfer(bob, Web3.utils.toWei("100"));
    await tokenContractInstance.transfer(cavin, Web3.utils.toWei("100"));

    await tokenContractInstance.approve(contractInstance.address, Web3.utils.toWei("1000000"), { from: bob });
    await tokenContractInstance.approve(contractInstance.address, Web3.utils.toWei("1000000"), { from: cavin });

    await contractInstance.enterToRoom(Web3.utils.toWei("1"), { from: bob });
    await contractInstance.enterToRoom(Web3.utils.toWei("2"), { from: cavin });

    const balanceBefore = Web3.utils.fromWei(await contractInstance.balanceOf.call());
    await contractInstance.withdraw();
    const balanceAfter = +Web3.utils.fromWei(await contractInstance.balanceOf.call());
    expect(balanceBefore === "0.02").to.equal(true);
    expect(balanceAfter === 0).to.equal(true);
    const balanceOf = await tokenContractInstance.balanceOf.call(alice);
    expect(Web3.utils.fromWei(balanceOf) === "999999800.02").to.equal(true);
  })

})
