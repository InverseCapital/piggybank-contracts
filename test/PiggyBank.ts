import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { expect } from 'chai'
import { BigNumber } from 'ethers'
import { ethers } from 'hardhat'
import { MyToken, PiggyBank } from '../typechain-types'
import { deployContract } from '../utils/contracts'

const daysToSeconds = (days: number) => days * 24 * 60 * 60 * 1000

const dateNowInSecs = () => Math.floor(new Date().getTime() / 1000)

describe('CryviaQuiz Contract', () => {
  let piggyBankContract: PiggyBank
  let tokenContract: MyToken
  let owner: SignerWithAddress
  let users: SignerWithAddress[]

  const NUMBER_OF_USERS = 5
  const DEPOSIT_ID = 0
  const DEPOSIT_NAME = 'Buying a house'
  const DEPOSIT_AMOUNT = ethers.utils.parseEther('50')
  const DEPOSIT_WITHDRAW_DATE = dateNowInSecs() + daysToSeconds(30)
  const PLATFORM_FEE = 200
  const PENALTY_FEE = 200

  before(async () => {
    const accounts = await ethers.getSigners()
    owner = accounts[0]
    users = accounts.slice(1, NUMBER_OF_USERS + 1)

    tokenContract = await deployContract<MyToken>(
      'MyToken',
      users.map((user) => user.address)
    )

    piggyBankContract = await deployContract<PiggyBank>(
      'PiggyBank',
      tokenContract.address,
      PLATFORM_FEE,
      PENALTY_FEE
    )
  })

  describe('when the contract is deployed', async () => {
    it('sets the deployer as the owner', async () => {
      const contractOwner = await piggyBankContract.owner()
      expect(contractOwner).to.eq(owner.address)
    })

    it('sets the correct token', async () => {
      const token = await piggyBankContract.token()
      expect(token).to.eq(tokenContract.address)
    })
  })

  describe('when a user makes a deposit', async () => {
    let user: SignerWithAddress
    let userBalance: BigNumber
    let contractBalance: BigNumber

    before(async () => {
      user = users[1]

      // Set balances before deposit
      userBalance = await tokenContract.balanceOf(user.address)
      contractBalance = await tokenContract.balanceOf(piggyBankContract.address)

      // Approve spending of tokens
      const approveTx = await tokenContract
        .connect(user)
        .approve(piggyBankContract.address, DEPOSIT_AMOUNT)
      await approveTx.wait()

      // Make deposit
      const tx = await piggyBankContract
        .connect(user)
        .deposit(DEPOSIT_NAME, DEPOSIT_WITHDRAW_DATE, DEPOSIT_AMOUNT)
      await tx.wait()
    })

    it('sets the correct data of the deposit', async () => {
      const deposit = await piggyBankContract.deposits(DEPOSIT_ID)

      expect(deposit.amount).to.eq(DEPOSIT_AMOUNT)
      expect(deposit.name).to.eq(DEPOSIT_NAME)
      expect(deposit.withdrawalDate).to.eq(DEPOSIT_WITHDRAW_DATE)
      expect(deposit.earlyWithdrawn).to.eq(false)
    })

    it('adds the deposit to list of user deposits', async () => {
      const userDeposits = await piggyBankContract
        .connect(user)
        .getUserDeposits()
      expect(userDeposits[0].id).to.eq(DEPOSIT_ID)
    })

    it('adds the user to list of users', async () => {
      const allUsers = await piggyBankContract.getUsers()
      expect(allUsers).to.include(user.address)
    })

    it("decreases user's token balance", async () => {
      const updatedUserBalance = await tokenContract.balanceOf(user.address)
      expect(updatedUserBalance).to.eq(userBalance.sub(DEPOSIT_AMOUNT))
    })

    it('increases PiggyBank contract token balance', async () => {
      const updatedQuizContractBalance = await tokenContract.balanceOf(
        piggyBankContract.address
      )
      expect(updatedQuizContractBalance).to.eq(
        contractBalance.add(DEPOSIT_AMOUNT)
      )
    })

    it('increases total deposit balance', async () => {
      const totalBalance = await piggyBankContract.totalBalance()
      expect(totalBalance).to.eq(DEPOSIT_AMOUNT)
    })
  })

  describe('when a user withdraws a deposit before withdrawal date', async () => {
    let user: SignerWithAddress
    let userBalance: BigNumber
    let contractBalance: BigNumber

    const WITHDRAW_AMOUNT = ethers.utils.parseEther('20')
    const penaltyFee = WITHDRAW_AMOUNT.mul(PENALTY_FEE).div(100).div(100)
    const platformFee = WITHDRAW_AMOUNT.mul(PLATFORM_FEE).div(100).div(100)

    before(async () => {
      user = users[1]

      // Set balances before deposit
      userBalance = await tokenContract.balanceOf(user.address)
      contractBalance = await tokenContract.balanceOf(piggyBankContract.address)

      // Make deposit
      const tx = await piggyBankContract
        .connect(user)
        .withdraw(DEPOSIT_ID, WITHDRAW_AMOUNT)
      await tx.wait()
    })

    it('decreases the deposit amount', async () => {
      const deposit = await piggyBankContract.deposits(DEPOSIT_ID)
      expect(deposit.amount).to.eq(DEPOSIT_AMOUNT.sub(WITHDRAW_AMOUNT))
    })

    it('marks the deposit as early withdrawn', async () => {
      const deposit = await piggyBankContract.deposits(DEPOSIT_ID)
      expect(deposit.earlyWithdrawn).to.eq(true)
    })

    it('adds the penalty to the rewards', async () => {
      const totalRewards = await piggyBankContract.totalRewards()
      expect(totalRewards).to.eq(penaltyFee)
    })

    it('adds the platform profit to owner balance', async () => {
      const ownerBalance = await piggyBankContract.ownerBalance()
      expect(ownerBalance).to.eq(platformFee)
    })

    it('increases user token balance', async () => {
      const updatedUserBalance = await tokenContract.balanceOf(user.address)

      expect(updatedUserBalance).to.eq(
        userBalance.add(WITHDRAW_AMOUNT.sub(penaltyFee).sub(platformFee))
      )
    })

    it('decreases PiggyBank contract token balance', async () => {
      const updatedContractBalance = await tokenContract.balanceOf(
        piggyBankContract.address
      )

      expect(updatedContractBalance).to.eq(
        contractBalance.sub(WITHDRAW_AMOUNT.sub(penaltyFee).sub(platformFee))
      )
    })

    it('decreases total deposit balance', async () => {
      const totalBalance = await piggyBankContract.totalBalance()
      expect(totalBalance).to.eq(DEPOSIT_AMOUNT.sub(WITHDRAW_AMOUNT))
    })
  })
})
