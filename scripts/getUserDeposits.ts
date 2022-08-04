import 'dotenv/config'
import { ethers } from 'hardhat'

import { getPiggyBankContract } from '../utils/contracts'

async function main() {
  const accounts = await ethers.getSigners()
  console.log('Using address: ', accounts[0].address)

  const piggyBankContract = await getPiggyBankContract(accounts[0])

  const deposits = await piggyBankContract.getUserDeposits(accounts[0].address)

  console.log('Deposits: ', deposits)
  process.exit()
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
