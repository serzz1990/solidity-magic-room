pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MagicToken is ERC20, Ownable  {
  constructor() ERC20("MagicToken", "MGT") {
    _mint(msg.sender, 1000000000*10**18);
  }

  /**
   * Creates `amount` tokens and assigns them to owner, increasing
   * the total supply.
   */
  function mint(uint _amount) external onlyOwner {
    _mint(msg.sender, _amount);
  }

  /**
   * Destroys `amount` tokens from owner, reducing the
   * total supply.
   */
  function burn(uint _amount) external onlyOwner {
    _burn(msg.sender, _amount);
  }
}
