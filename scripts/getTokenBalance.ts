import 'dotenv/config'
import { ethers } from 'hardhat'

import { getTokenContract } from '../utils/contracts'

async function main() {
  const accounts = await ethers.getSigners()
  console.log('Using address: ', accounts[0].address)

  const users = accounts.slice(0, 5)

  const tokenContract = await getTokenContract(accounts[0])

  for (const user of users) {
    const balance = await tokenContract.balanceOf(user.address)
    console.log(`${user.address}:${ethers.utils.formatEther(balance)}`)
  }

  process.exit()
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
