import 'dotenv/config'
import { ethers } from 'hardhat'

import { getPiggyBankContract } from '../utils/contracts'

async function main() {
  const accounts = await ethers.getSigners()
  console.log('Using address: ', accounts[0].address)

  const piggyBankContract = await getPiggyBankContract(accounts[0])

  const totalRewards = await piggyBankContract.totalRewards()

  console.log('Total rewards: ', ethers.utils.formatEther(totalRewards))
  process.exit()
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
