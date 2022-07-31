import 'dotenv/config'
import { ethers } from 'hardhat'

import { getPiggyBankContract } from '../utils/contracts'
import readLine from '../utils/readline'

async function main() {
  const accounts = await ethers.getSigners()
  console.log('Using address: ', accounts[0].address)

  const piggyBankContract = await getPiggyBankContract(accounts[0])

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
