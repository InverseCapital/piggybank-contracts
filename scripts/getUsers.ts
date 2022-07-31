import 'dotenv/config'
import { ethers } from 'hardhat'

import { getPiggyBankContract } from '../utils/contracts'

async function main() {
  const accounts = await ethers.getSigners()
  console.log('Using address: ', accounts[0].address)

  const piggyBankContract = await getPiggyBankContract(accounts[0])

  const users = await piggyBankContract.getUsers()

  console.log('Users: ', users)
  process.exit()
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
