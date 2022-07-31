import { ethers } from 'hardhat'
import { MyToken, PiggyBank } from '../typechain-types'

import { deployContract } from '../utils/contracts'

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
    myTokenContract.address
  )
  console.log(
    'Deployed PiggyBank contract at address: ',
    piggyBankContract.address
  )

  // Approve spending of tokens
  for (const user of users) {
    const tx = await myTokenContract
      .connect(user)
      .approve(piggyBankContract.address, ethers.utils.parseEther('100'))
    tx.wait()
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
