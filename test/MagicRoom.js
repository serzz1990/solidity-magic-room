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
    it("should return tokenomic", async () => {
      const tokenimic = await contractInstance.getTokenimic.call();
      expect(tokenimic.winners.toNumber()).to.be.a('number');
      expect(tokenimic.vip.toNumber()).to.be.a('number');
      expect(tokenimic.reward.toNumber()).to.be.a('number');
      expect(tokenimic.fee.toNumber()).to.be.a('number');
    })
    it("should return current room", async () => {
      await contractInstance.createRoom();
      const result = await contractInstance.getCurrentRoom.call();
      expect(result.price.toNumber()).to.be.a('number');
      expect(result.bank.toNumber()).to.be.a('number');
      expect(result.step.toNumber()).to.be.a('number');
      expect(result.chairs).to.be.a('array');
      expect(result.active).to.be.a('boolean');
    })
  })

  context("enter to room", async () => {
    it("on chair", async () => {
      await contractInstance.createRoom();
      await giveTokens(bob, 100);
      await contractInstance.enterToRoom(toWei("1"), { from: bob });
      const room = await contractInstance.getCurrentRoom.call();
      expect(room.chairs.includes(bob)).to.equal(true);
    })
    it("small amount", async () => {
      await contractInstance.createRoom();
      await tokenContractInstance.transfer(bob, toWei("100"));
      await tokenContractInstance.approve(contractInstance.address, toWei("1000000"), { from: bob });
      await utils.shouldThrow(contractInstance.enterToRoom(toWei("0.0001"), { from: bob }));
    })
    it("amount should go up", async () => {
      await contractInstance.createRoom();

      await giveTokens(bob, 100);
      await giveTokens(cavin, 100);

      const resultBob = await contractInstance.enterToRoom(toWei("1"), { from: bob });
      const resultCavin = await contractInstance.enterToRoom(toWei("2"), { from: cavin });

      expect(resultBob.receipt.status).to.equal(true);
      expect(resultCavin.receipt.status).to.equal(true)
      await utils.shouldThrow(contractInstance.enterToRoom(toWei("2"), { from: cavin }));
    })
    it("rewards", async () => {
      await contractInstance.createRoom();

      await giveTokens(bob, 100);
      await giveTokens(cavin, 100);

      await contractInstance.enterToRoom(toWei("1"), { from: bob });
      await contractInstance.enterToRoom(toWei("2"), { from: cavin });

      const balanceBob = fromWei(await tokenContractInstance.balanceOf(bob));
      const balanceCavin = fromWei(await tokenContractInstance.balanceOf(cavin));

      expect(balanceBob > 99).to.equal(true);
      expect(balanceCavin === 98).to.equal(true);
    })
  })

  it("finish", async () => {
    await contractInstance.createRoom();

    await giveTokens(bob, 100);
    await giveTokens(cavin, 100);

    await contractInstance.enterToRoom(toWei("1"), { from: bob });
    await contractInstance.enterToRoom(toWei("2"), { from: cavin });
    const balanceCavin1 = fromWei(await tokenContractInstance.balanceOf(cavin));

    await contractInstance.finish();
    const room = await contractInstance.getCurrentRoom.call();
    const occupied = room.chairs.filter(a => a !== '0x0000000000000000000000000000000000000000').length;
    const balanceCavin2 = fromWei(await tokenContractInstance.balanceOf(cavin));

    expect(room.active).to.equal(false);
    expect(balanceCavin1 === 98).to.equal(true);
    expect(balanceCavin2 === balanceCavin1 + fromWei(room.bank) / occupied).to.equal(true);
  })

  it("withdraw", async () => {
    await contractInstance.createRoom();
    const tokenimic = await contractInstance.getTokenimic.call();

    await giveTokens(bob, 100);
    await giveTokens(cavin, 100);

    await contractInstance.enterToRoom(toWei("1"), { from: bob });
    await contractInstance.enterToRoom(toWei("2"), { from: cavin });
    const fee = 3 * tokenimic.fee.toNumber() / 100;

    const balanceBefore = fromWei(await contractInstance.balanceOf.call());
    await contractInstance.withdraw(alice);
    const balanceAfter = fromWei(await contractInstance.balanceOf.call());
    expect(balanceBefore === fee).to.equal(true);
    expect(balanceAfter === 0).to.equal(true);
    const balanceOf = fromWei(await tokenContractInstance.balanceOf.call(alice));
    expect(balanceOf === 999999800 + fee).to.equal(true);
  })

  function toWei (value) {
    return Web3.utils.toWei(value.toString());
  }

  function fromWei (value) {
    return +Web3.utils.fromWei(value);
  }

  async function giveTokens (to, amount) {
    await tokenContractInstance.transfer(to, toWei(amount));
    await tokenContractInstance.approve(contractInstance.address, toWei(amount), { from: to });
  }
})

