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
        uint256 id;
        uint256 depositDate; // date when the deposit was made
        uint256 withdrawalDate; // date when the deposit can be withdrawn
        uint256 amount; // amount deposited
        string name; // reason of the deposit
        bool earlyWithdrawn; // whether the deposit has been (partially) withdrawn before due date
    }

    // Rewards a user can redeem
    mapping(address => uint256) public pendingRewards;

    // Users who have a deposit
    address[] public users;

    // Total amount of rewards
    uint256 public totalRewards;

    uint256 public rewardsDeadline;

    uint256 public rewardsSpan = 5 minutes;

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

    modifier onlyDepositOwner(uint id) {
        bool found = false;
        for (uint256 i = 0; i < userDeposits[msg.sender].length; i++) {
            if (id == userDeposits[msg.sender][i]) found = true;
        }
        require(found, "Caller is not the owner of the deposit.");
        _;
    }

    constructor(IERC20 _tokenContract) {
        token = _tokenContract;
        rewardsDeadline = block.timestamp.add(rewardsSpan);
    }

    function getUsers() public view returns (address[] memory) {
        return users;
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
        deposits[id] = Deposit(
            id,
            depositDate,
            withdrawalDate,
            amount,
            name,
            false
        );

        // If is first deposit, add user to list of users
        if (userDeposits[msg.sender].length == 0) {
            users.push(msg.sender);
        }

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

    /**
     * Withdraws a given amount from a deposit
     * @param id id of the deposit
     * @param amount amount to withdraw
     */
    function withdraw(uint256 id, uint amount) public onlyDepositOwner(id) {
        require(amount <= deposits[id].amount, "No enough funds.");

        uint withdrawalAmount = amount;
        deposits[id].amount = deposits[id].amount.sub(amount);

        // If it's early withdraw
        if (block.timestamp <= deposits[id].withdrawalDate) {
            // Subtract penalty fee from withdrawal amount
            uint256 penalty = (amount * penaltyFee) / 100;
            withdrawalAmount = withdrawalAmount.sub(penalty);

            deposits[id].earlyWithdrawn = true;

            // Update total rewards
            totalRewards = totalRewards.add(penalty);
        }

        // Transfer tokens to user
        token.transfer(msg.sender, withdrawalAmount);

        // Update total balance
        totalBalance = totalBalance.sub(amount);
    }

    function withdrawAll(uint256 id) public onlyDepositOwner(id) {
        withdraw(id, deposits[id].amount);
    }

    function getUserValidDeposit(address user) public view returns (uint256) {
        uint256[] memory depositIds = userDeposits[user];
        uint256 length = depositIds.length;

        uint256 sum = 0;

        for (uint256 i = 0; i < length; i++) {
            Deposit memory d = deposits[depositIds[i]];

            if (!d.earlyWithdrawn) {
                sum = sum.add(d.amount);
            }
        }

        return sum;
    }

    function udpateRewardBalances() public {
        require(
            block.timestamp >= rewardsDeadline,
            "Rewards cannot be set yet, deadline not reached"
        );

        for (uint256 i = 0; i < users.length; i++) {
            uint256 validDeposit = getUserValidDeposit(users[i]);

            uint256 rewards = (validDeposit * totalRewards) / totalBalance;
            pendingRewards[users[i]] = pendingRewards[users[i]].add(rewards);
        }

        totalRewards = 0;
        rewardsDeadline = block.timestamp.add(rewardsSpan);
    }

    function claimRewards() public {
        require(pendingRewards[msg.sender] > 0, "No rewards to redeem");

        token.transfer(msg.sender, pendingRewards[msg.sender]);
        pendingRewards[msg.sender] = 0;
    }
}
