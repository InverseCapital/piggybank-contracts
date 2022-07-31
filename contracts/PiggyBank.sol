// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

import "hardhat/console.sol";

contract PiggyBank is Ownable {
    using Counters for Counters.Counter;
    using SafeMath for uint256;

    struct Deposit {
        uint256 depositDate; // date when the deposit was made
        string name; // reason of the deposit
        uint256 withdrawalDate; // date when the deposit can be withdrawn
        uint256 amount; // amount deposited
    }

    // Rewards a user can redeem
    mapping(address => uint256) public pendingRewards;

    // Id to deposit info
    mapping(uint256 => Deposit) public deposits;

    // User to list of his deposits
    mapping(address => uint256[]) public userDeposits;

    // Counter of deposit ids
    Counters.Counter public idCounter;

    // Fee users pay to withdraw before the date (as a percentage of the withdrawn amount)
    uint8 public penaltyFee = 2;

    // Fee paid to the platform for an early withdraw (as a percentage to the penalty fee)
    uint8 public platformFee = 2;

    // Amount that the owner can redeem
    uint256 public ownerBalance;

    // Total balance deposited
    uint256 public totalBalance;

    // Token used for deposits
    IERC20 public token;

    constructor(IERC20 _tokenContract) {
        token = _tokenContract;
    }

    /**
     * Creates a new deposit
     * @param name reason of the deposit
     * @param withdrawalDate date when the deposit can be withdrawn
     * @param amount amount to deposit
     */
    function deposit(
        string calldata name,
        uint256 withdrawalDate,
        uint256 amount
    ) public {
        // Check allowance is enough
        require(
            token.allowance(msg.sender, address(this)) >= amount,
            "Insufficient allowance"
        );

        // Check withdrawal date is in the future
        uint256 depositDate = block.timestamp;
        require(
            withdrawalDate > depositDate,
            "Withdrawal date should be in the future."
        );

        // Create new deposit
        uint256 id = idCounter.current();
        idCounter.increment();
        deposits[id] = Deposit(depositDate, name, withdrawalDate, amount);
        userDeposits[msg.sender].push(id);

        // Transfer tokens to the smart contract
        token.transferFrom(msg.sender, address(this), amount);

        // Update total balance
        totalBalance = totalBalance.add(amount);
    }

    /**
     * @return the deposits of the sender
     */
    function getUserDeposits() public view returns (Deposit[] memory) {
        uint256[] memory depositIds = userDeposits[msg.sender];
        uint256 length = depositIds.length;

        Deposit[] memory allDeposits = new Deposit[](length);

        for (uint256 i = 0; i < length; i++) {
            allDeposits[i] = deposits[depositIds[i]];
        }

        return allDeposits;
    }
}
