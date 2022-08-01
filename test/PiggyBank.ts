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
      tokenContract.address
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

    const DEPOSIT_ID = 0
    const DEPOSIT_NAME = 'Buying a house'
    const DEPOSIT_AMOUNT = 50
    const DEPOSIT_WITHDRAW_DATE = dateNowInSecs() + daysToSeconds(30)

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
})