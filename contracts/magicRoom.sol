pragma solidity ^0.8.0;

import "./helpers.sol";
import "./events.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract MagicRoom is Helpers, Ownable, Events {
  Room[] rooms;
  IERC20 token;
  Tokenomics tokenomics = Tokenomics(1, 50, 28, 20);

  uint[] chairProbability = [13, 3, 3, 3, 13, 13, 13, 13, 13, 13];
  uint balance = 0;

  constructor(address _tokenAddress) {
    token = IERC20(_tokenAddress);
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
    bool active;
    address[] chairs;
  }

  modifier roomFinished () {
    require(rooms.length == 0 || !rooms[rooms.length - 1].active, "there is an active room");
    _;
  }

  modifier availableRoom () {
    require(rooms.length != 0 && rooms[rooms.length - 1].active, "no active room");
    _;
  }

  modifier availableAmount (uint _amount) {
    Room memory room = rooms[rooms.length - 1];
    uint min = room.price + 1 * 10 ** 18;
    require(_amount >= min, string(abi.encodePacked("amount must be greater than or equal to ", min)));
    _;
  }

  function createRoom() external onlyOwner roomFinished {
    uint cycles = getRandomRange(100, 2000);
    uint price = 0;
    address[] memory chairs = new address[](10);
    rooms.push(
      Room(price, 0, cycles, 0, true, chairs)
    );
    emit StartRoom(rooms.length - 1, price);
  }

  function getTokenimic() external view returns (uint fee, uint reward, uint vip, uint winners ) {
    return (tokenomics.fee, tokenomics.reward, tokenomics.vip, tokenomics.winners);
  }

  function getCurrentRoom() external view returns (
    uint price,
    uint bank,
    uint step,
    bool active,
    address[] memory chairs
  ) {
    Room storage room = rooms[rooms.length - 1];
    return (
      room.price,
      room.bank,
      room.step,
      room.active,
      room.chairs
    );
  }

  function _getTokens(uint _amount) private {
    token.transferFrom(msg.sender, address(this), _amount);
  }

  function _sendTokens(address _to, uint _amount) private {
    token.transfer(_to, _amount);
  }

  function enterToRoom(uint _amount) external availableRoom availableAmount(_amount) {
    _getTokens(_amount);
    uint roomId = rooms.length - 1;
    Room storage room = rooms[roomId];

    uint chairIndex = getRandomIndexInArrayWitsProbability(chairProbability);
    uint vipChair = getRandomRange(0, room.chairs.length - 1);
    uint rewards = _amount * tokenomics.reward / 100;
    uint winners = _amount * tokenomics.winners / 100;
    uint vip = _amount * tokenomics.vip / 100;
    uint fee = _amount * tokenomics.fee / 100;
    uint rewardAddressCount = getValidAddressCount(room.chairs);
    address leaveAddress = room.chairs[chairIndex];

    room.step++;

    if (room.chairs[vipChair] != address(0)) {
      _sendTokens(room.chairs[vipChair], vip);
      emit Vip(roomId, room.step, room.chairs[vipChair]);
    } else {
      winners = winners + vip;
    }

    if (rewardAddressCount != 0) {
      uint rewardPerChair = rewards / rewardAddressCount;
      for (uint i = 0; i < room.chairs.length; i++) {
        if (room.chairs[i] != address(0)) {
          _sendTokens(room.chairs[i], rewardPerChair);
          emit Reward(roomId, room.step, room.chairs[i], rewardPerChair);
        }
      }
    } else {
      winners = winners + rewards;
    }

    room.bank = room.bank + winners;
    room.price = _amount;
    room.chairs[chairIndex] = msg.sender;
    balance = balance + fee;
    emit ChangeChair(roomId, room.step, chairIndex, msg.sender, leaveAddress, room.price, room.bank);

    if (room.cycles == room.step) {
      _finishRoom();
    }
  }

  function _finishRoom() private {
    uint roomId = rooms.length - 1;
    Room storage room = rooms[roomId];
    uint rewardAddressCount = getValidAddressCount(room.chairs);
    uint bankRewardPerChair = room.bank / rewardAddressCount;

    for (uint i = 0; i < room.chairs.length; i++) {
      if (room.chairs[i] != address(0)) {
        _sendTokens(room.chairs[i], bankRewardPerChair);
        emit Winner(roomId, room.step, room.chairs[i], bankRewardPerChair);
      }
    }

    room.active = false;
    emit FinishRoom(roomId, room.step, room.price, room.bank);
  }

  function finish() external onlyOwner availableRoom {
    _finishRoom();
  }

  function withdraw(address _to) external onlyOwner {
    _sendTokens(_to, balance);
    balance = 0;
  }

  function balanceOf() external view onlyOwner returns(uint) {
    return balance;
  }
}
