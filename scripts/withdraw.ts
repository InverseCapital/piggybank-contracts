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

  const id = await readLine('Insert id of deposit: ')
  const amount = await readLine('Insert amount: ')
  console.log(`Withdrawing...`)

  const tx = await piggyBankContract.withdraw(
    id,
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
