// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "hardhat/console.sol";

contract MyToken is ERC20 {
    uint256 constant maxMint = 100 * (10**18);

    constructor(address[] memory _users) ERC20("PiggyCash", "PGC") {
        for (uint256 i = 0; i < _users.length; i++) {
            // Give 100 tokens to every user to make tests
            console.log("Minting 100 tokens to address ", _users[i]);
            _mint(_users[i], maxMint);
        }
    }

    /// @dev mints a given amount of tokens to the sender
    function mint(uint256 amount) public {
        require(amount <= maxMint);
        _mint(_msgSender(), amount);
    }
}
