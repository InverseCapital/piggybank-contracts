import 'dotenv/config'
import { ethers } from 'hardhat'

import { getPiggyBankContract } from '../utils/contracts'
import readLine from '../utils/readline'

async function main() {
  const accountIndex = await readLine('Insert account index to use: ')
  const index = parseInt(accountIndex)

  const accounts = await ethers.getSigners()
  console.log('Using address: ', accounts[index].address)

  const piggyBankContract = await getPiggyBankContract(accounts[index])

  console.log(`Claiming rewards...`)

  const tx = await piggyBankContract.claimRewards()
  await tx.wait()

  console.log('Transaction hash: ', tx.hash)
  process.exit()
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
