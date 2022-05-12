pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MagicToken is ERC20, Ownable  {
  constructor() ERC20("MagicToken", "MGT") {
    _mint(msg.sender, 1000000000*10**18);
  }

  function mint(uint amount) external onlyOwner {
    _mint(msg.sender, amount);
  }

  function burn(uint amount) external onlyOwner {
    _burn(msg.sender, amount);
  }
}
