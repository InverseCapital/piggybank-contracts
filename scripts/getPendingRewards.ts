import 'dotenv/config'
import { ethers } from 'hardhat'

import { getPiggyBankContract } from '../utils/contracts'

async function main() {
  const accounts = await ethers.getSigners()
  const users = accounts.slice(0, 5)

  const piggyBankContract = await getPiggyBankContract(accounts[0])

  for (const user of users) {
    const pendingRewards = await piggyBankContract.pendingRewards(user.address)
    console.log(`${user.address}:${ethers.utils.formatEther(pendingRewards)}`)
  }

  process.exit()
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
