pragma solidity >=0.4.22 <0.9.0;

contract Train {
    address developerAddress;
    address designerAddress;
    address[] addresses;
    uint minPrice = 1;
    uint range = 0;
    uint8 maxPlayers = 10;

    event ChangePrice(uint minPrice);

    function enter (address player) external payable {
        require(msg.value >= minPrice);
        if (msg.value != minPrice) {
            minPrice = msg.value;
            emit ChangePrice(price);
        }
        uint reward = msg.value / addresses.length;
        addresses.push(msg.sender);
        range++;
    }
}
