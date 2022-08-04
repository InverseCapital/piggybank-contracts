import { ethers } from 'hardhat'
import { MyToken, PiggyBank } from '../typechain-types'

import { deployContract } from '../utils/contracts'

const PLATFORM_FEE = 200
const PENALTY_FEE = 200

async function main() {
  const accounts = await ethers.getSigners()
  console.log('Using address: ', accounts[0].address)

  const users = accounts.slice(0, 5)

  // Deploy token contract
  const myTokenContract = await deployContract<MyToken>(
    'MyToken',
    accounts.slice(0, 5).map((account) => account.address)
  )
  console.log('Deployed MyToken contract at address: ', myTokenContract.address)

  // Deploy piggyBank contract
  const piggyBankContract = await deployContract<PiggyBank>(
    'PiggyBank',
    myTokenContract.address,
    PLATFORM_FEE,
    PENALTY_FEE
  )
  console.log(
    'Deployed PiggyBank contract at address: ',
    piggyBankContract.address
  )

  for (const [index, user] of users.entries()) {
    // Approve token spending
    const approveTx = await myTokenContract
      .connect(user)
      .approve(piggyBankContract.address, ethers.utils.parseEther('100'))
    approveTx.wait()

    // Make a deposit
    const depositTx = await piggyBankContract
      .connect(user)
      .deposit(`Deposit ${index}`, 999999999999, ethers.utils.parseEther('50'))
    depositTx.wait()
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
