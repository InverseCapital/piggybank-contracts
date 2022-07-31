import 'dotenv/config'
import { ethers } from 'hardhat'

import { getPiggyBankContract } from '../utils/contracts'
import readLine from '../utils/readline'

async function main() {
  const accounts = await ethers.getSigners()
  console.log('Using address: ', accounts[1].address)

  const piggyBankContract = await getPiggyBankContract(accounts[1])

  const name = await readLine('Insert name of deposit: ')
  const withdrawalDate = await readLine('Insert withdrawal date: ')
  const amount = await readLine('Insert amount: ')
  console.log(`Creating deposit...`)

  const tx = await piggyBankContract.deposit(
    name,
    withdrawalDate,
    ethers.utils.parseEther(amount)
  )
  await tx.wait()

  console.log('Transaction hash: ', tx.hash)
  process.exit()
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
