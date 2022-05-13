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
})
