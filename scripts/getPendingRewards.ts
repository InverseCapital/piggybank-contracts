import 'dotenv/config'
import { ethers } from 'hardhat'

import { getPiggyBankContract } from '../utils/contracts'

async function main() {
  const accounts = await ethers.getSigners()
  console.log('Using address: ', accounts[1].address)

  const piggyBankContract = await getPiggyBankContract(accounts[1])

  const pendingRewards = await piggyBankContract.pendingRewards(
    accounts[1].address
  )

  console.log('Total rewards: ', ethers.utils.formatEther(pendingRewards))
  process.exit()
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
