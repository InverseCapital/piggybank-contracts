import 'dotenv/config'
import { ethers } from 'hardhat'

import { getTokenContract } from '../utils/contracts'

async function main() {
  const accounts = await ethers.getSigners()
  console.log('Using address: ', accounts[0].address)

  const tokenContract = await getTokenContract(accounts[0])

  const balance = await tokenContract.balanceOf(accounts[0].address)

  console.log('Token balance: ', ethers.utils.formatEther(balance))
  process.exit()
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
