import 'dotenv/config'
import { ethers } from 'hardhat'

import { getTokenContract } from '../utils/contracts'
import readLine from '../utils/readline'

async function main() {
  const accounts = await ethers.getSigners()
  console.log('Using address: ', accounts[0].address)

  const tokenContract = await getTokenContract(accounts[0])

  const amount = await readLine('Insert amount: ')
  console.log(`Minting ${amount} tokens to ${accounts[0].address}...`)

  const tx = await tokenContract.mint(ethers.utils.parseEther(amount))
  await tx.wait()

  console.log('Transaction hash: ', tx.hash)
  process.exit(1)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
