import 'dotenv/config'
import { ethers } from 'hardhat'

import { getPiggyBankContract, getTokenContract } from '../utils/contracts'
import readLine from '../utils/readline'

async function main() {
  const accounts = await ethers.getSigners()
  console.log('Using address: ', accounts[0].address)

  const piggyBankContract = await getPiggyBankContract(accounts[0])
  const tokenContract = await getTokenContract(accounts[0])

  const amount = await readLine('Insert amount: ')

  const tx = await tokenContract.approve(
    piggyBankContract.address,
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
