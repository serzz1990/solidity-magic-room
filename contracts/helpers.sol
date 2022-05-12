pragma solidity >=0.4.22 <0.9.0;

import "./safemath.sol";

contract Helpers {

  using SafeMath for uint256;
  using SafeMath32 for uint32;
  using SafeMath16 for uint16;

  uint randNonce = 0;

  function getRandomRange(uint _min, uint _max) public returns(uint) {
    randNonce = randNonce.add(1);
    return (uint(keccak256(abi.encodePacked(block.timestamp, msg.sender, randNonce))) % _max.sub(_min).add(1)).add(_min);
  }

  function getRandomIndexInArrayWitsProbability(uint[] memory _probability) public returns(uint) {
    uint accumulate = 0;
    uint accumulate2 = 0;
    uint value;
    uint result = 0;

    for (uint i = 0; i < _probability.length; i++) {
      accumulate = accumulate.add(_probability[i]);
    }

    value = getRandomRange(1, accumulate);

    for (uint i = 0; i < _probability.length; i++) {
      if (value > accumulate2 && value <= accumulate2.add(_probability[i])) {
        result = i;
      }
      accumulate2 = accumulate2.add(_probability[i]);
    }
    return result;
  }

}
