pragma solidity ^0.8.0;

abstract contract Events {
  event StartRoom(uint roomId, uint price);
  event FinishRoom(uint roomId, uint step, uint price, uint bank);
  event Vip(uint roomId, uint step, address chair);
  event Reward(uint roomId, uint step, address chair, uint value);
  event Winner(uint roomId, uint step, address chair, uint value);
  event ChangeChair(uint roomId, uint step, uint chairIndex, address enter, address leave, uint price, uint bank);
}
