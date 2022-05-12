const Helpers = artifacts.require("Helpers");

contract("Helpers", (accounts) => {
  let [alice, bob] = accounts;
  let contractInstance;

  beforeEach(async () => {
    contractInstance = await Helpers.new();
  });

  xit("should be in range", async () => {
    const range = [12, 22];
    const result = await contractInstance.getRandomRange.call(range[0], range[1]);
    const value = result.toNumber();
    expect(value >= range[0] && value <= range[1]).to.equal(true);
  })

  xit("should not allow two zombies", async () => {
    const probability = [20, 30, 10];
    // const result1 = await contractInstance.getRandomRange.call(10, 20);
    // const result2 = await contractInstance.getRandomRange.call(10, 20);
    // const result3 = await contractInstance.getRandomRange.call(10, 20);
    // const result4 = await contractInstance.getRandomRange.call(10, 20);
    // const result5 = await contractInstance.getRandomRange.call(10, 20);
    // const result1 = await contractInstance.getRandomIndexInArrayWitsProbability.call(probability);
    // const result2 = await contractInstance.getRandomIndexInArrayWitsProbability.call(probability);
    // const result3 = await contractInstance.getRandomIndexInArrayWitsProbability.call(probability);
    // const result4 = await contractInstance.getRandomIndexInArrayWitsProbability.call(probability);
    // const result5 = await contractInstance.getRandomIndexInArrayWitsProbability.call(probability);
    // const value = result.toNumber();
    // console.log(
    //   result1.toNumber(),
    //   result2.toNumber(),
    //   result3.toNumber(),
    //   result4.toNumber(),
    //   result5.toNumber()
    // );
  })

  // context("with the single-step transfer scenario", async () => {
  //   it("should transfer a zombie", async () => {
  //     const result = await contractInstance.createRandomZombie(zombieNames[0], {from: alice});
  //     const zombieId = result.logs[0].args.zombieId.toNumber();
  //     await contractInstance.transferFrom(alice, bob, zombieId, {from: alice});
  //     const newOwner = await contractInstance.ownerOf(zombieId);
  //     expect(newOwner).to.equal(bob);
  //   })
  // })

  // context("with the two-step transfer scenario", async () => {
  //   it("should approve and then transfer a zombie when the approved address calls transferForm", async () => {
  //     const result = await contractInstance.createRandomZombie(zombieNames[0], {from: alice});
  //     const zombieId = result.logs[0].args.zombieId.toNumber();
  //     await contractInstance.approve(bob, zombieId, {from: alice});
  //     await contractInstance.transferFrom(alice, bob, zombieId, {from: bob});
  //     const newOwner = await contractInstance.ownerOf(zombieId);
  //     expect(newOwner).to.equal(bob);
  //   })
  //   it("should approve and then transfer a zombie when the owner calls transferForm", async () => {
  //     const result = await contractInstance.createRandomZombie(zombieNames[0], {from: alice});
  //     const zombieId = result.logs[0].args.zombieId.toNumber();
  //     await contractInstance.approve(bob, zombieId, {from: alice});
  //     await contractInstance.transferFrom(alice, bob, zombieId, {from: alice});
  //     const newOwner = await contractInstance.ownerOf(zombieId);
  //     expect(newOwner).to.equal(bob);
  //   })
  // })
  //
  // it("zombies should be able to attack another zombie", async () => {
  //   let result;
  //   result = await contractInstance.createRandomZombie(zombieNames[0], {from: alice});
  //   const firstZombieId = result.logs[0].args.zombieId.toNumber();
  //   result = await contractInstance.createRandomZombie(zombieNames[1], {from: bob});
  //   const secondZombieId = result.logs[0].args.zombieId.toNumber();
  //   await time.increase(time.duration.days(1));
  //   await contractInstance.attack(firstZombieId, secondZombieId, {from: alice});
  //   expect(result.receipt.status).to.equal(true);
  // })
})
