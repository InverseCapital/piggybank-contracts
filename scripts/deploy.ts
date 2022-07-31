import { ethers } from 'hardhat'
import { MyToken, PiggyBank } from '../typechain-types'

import { deployContract } from '../utils/contracts'

async function main() {
  const accounts = await ethers.getSigners()

  console.log('Using address: ', accounts[0].address)

  // Deploy token contract
  const myTokenContract = await deployContract<MyToken>(
    'MyToken',
    accounts.slice(0, 5).map((account) => account.address)
  )
  console.log('Deployed MyToken contract at address: ', myTokenContract.address)

  // Deploy piggyBank contract
  const piggyBankContract = await deployContract<PiggyBank>(
    'PiggyBank',
    myTokenContract.address
  )
  console.log(
    'Deployed PiggyBank contract at address: ',
    piggyBankContract.address
  )
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
