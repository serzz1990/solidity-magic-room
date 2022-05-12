pragma solidity >=0.4.22 <0.9.0;

import "./helpers.sol";
import "./ownable.sol";
import "./safemath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
//import "./magicToken.sol";

contract MagicRoom is Helpers, Ownable {
  using SafeMath for uint256;
  using SafeMath32 for uint32;
  using SafeMath16 for uint16;
  Room[] rooms;
  IERC20 MGTToken;
  Tokenomics tokenomics = Tokenomics(1, 50, 28, 20);
  uint[] chairProbability = [13, 3, 3, 3, 13, 13, 13, 13, 13, 13];
  uint balance = 0;

  event StartRoom(uint roomId, uint price);
  event FinishRoom(uint roomId, uint step, uint price, uint bank);
  event Vip(uint roomId, uint step, address chair);
  event Reward(uint roomId, uint step, address chair, uint value);
  event Winner(uint roomId, uint step, address chair, uint value);
  event ChangeChair(uint roomId, uint step, uint chairIndex, address enter, address leave, uint price, uint bank);
  event Fee(uint value);

  constructor(address MGTTokenAddress) {
    MGTToken = IERC20(MGTTokenAddress);
  }

  struct Tokenomics {
    uint fee;
    uint reward;
    uint vip;
    uint winners;
  }

  struct Room {
    uint price;
    uint bank;
    uint cycles;
    uint step;
    uint maxChairs;
    bool active;
    address[] chairs;
  }

  modifier roomFinished () {
    require(rooms.length == 0 || !rooms[rooms.length.sub(1)].active, "there is an active room");
    _;
  }

  modifier availableRoom () {
    require(rooms.length != 0 && rooms[rooms.length.sub(1)].active, "no active room");
    _;
  }

  modifier availablePrice (uint amount) {
    Room memory room = rooms[rooms.length.sub(1)];
    require(amount > room.price, string(abi.encodePacked("amount sum must be greater than ", room.price)));
    _;
  }

  function createRoom() external onlyOwner roomFinished {
    uint cycles = getRandomRange(100, 2000);
    uint price = 0;
    uint maxChairs = 10;
    address[] memory chairs = new address[](maxChairs);
    rooms.push(
      Room(price, 0, cycles, 0, maxChairs, true, chairs)
    );
    emit StartRoom(rooms.length - 1, price);
  }

  function getCurrentRoom() external view availableRoom returns (
    uint price,
    uint bank,
    uint step,
    uint maxChairs,
    bool active,
    address[] memory chairs
  ) {
    Room storage room = rooms[rooms.length.sub(1)];
    return (
      room.price,
      room.bank,
      room.step,
      room.maxChairs,
      room.active,
      room.chairs
    );
  }

  function getTokens(uint amount) private {
    MGTToken.transferFrom(msg.sender, address(this), amount);
  }

  function sendTokens(address to, uint amount) private {
    MGTToken.transfer(to, amount);
  }

  function enterToRoom(uint amount) external availableRoom availablePrice(amount) {
    getTokens(amount);
    uint roomId = rooms.length.sub(1);
    Room storage room = rooms[roomId];

    uint chairIndex = getRandomIndexInArrayWitsProbability(chairProbability);
    uint vipChair = getRandomRange(0, room.maxChairs.sub(1));
    uint rewards = amount.mul(tokenomics.reward).div(100);
    uint winners = amount.mul(tokenomics.winners).div(100);
    uint vip = amount.mul(tokenomics.vip).div(100);
    uint countRewardAddresses = 0;
    address leaveAddress = room.chairs[chairIndex];

    room.step = room.step.add(1);

    for (uint i = 0; i < room.chairs.length; i++) {
      if (room.chairs[i] != address(0)){
        countRewardAddresses = countRewardAddresses.add(1);
      }
    }

    if (room.chairs[vipChair] != address(0)) {
      sendTokens(room.chairs[vipChair], vip);
      emit Vip(roomId, room.step, room.chairs[vipChair]);
    } else {
      winners = winners.add(vip);
    }

    if (countRewardAddresses != 0) {
      uint rewardPerChair = rewards.div(countRewardAddresses);
      for (uint i = 0; i < room.chairs.length; i++) {
        if (room.chairs[i] != address(0)) {
          sendTokens(room.chairs[i], rewardPerChair);
          emit Reward(roomId, room.step, room.chairs[i], rewardPerChair);
        }
      }
    } else {
      winners.add(rewards);
    }
    room.bank = room.bank.add(winners);
    room.price = amount;
    room.chairs[chairIndex] = msg.sender;
    balance = amount.mul(tokenomics.fee).div(100);
    emit Fee(tokenomics.fee);
    emit ChangeChair(roomId, room.step, chairIndex, msg.sender, leaveAddress, room.price, room.bank);

    if (room.cycles == room.step) {
      finishRoom();
    }
  }

  function finishRoom() private {
    uint roomId = rooms.length.sub(1);
    uint countRewardAddresses = 0;
    Room storage room = rooms[roomId];

    room.active = false;

    for (uint i = 0; i < room.chairs.length; i++) {
      if (room.chairs[i] != address(0)){
        countRewardAddresses = countRewardAddresses.add(1);
      }
    }

    uint bankRewardPerChair = room.bank.div(countRewardAddresses);
    for (uint i = 0; i < room.chairs.length; i++) {
      if (room.chairs[i] != address(0)) {
        sendTokens(room.chairs[i], bankRewardPerChair);
        emit Winner(roomId, room.step, room.chairs[i], bankRewardPerChair);
      }
    }
    emit FinishRoom(roomId, room.step, room.price, room.bank);
  }

  function finish() external onlyOwner {
    finishRoom();
  }

  function withdraw() external onlyOwner {
    sendTokens(owner(), balance);
    balance = 0;
  }

  function balanceOf() external view onlyOwner returns(uint) {
    return balance;
  }
}
