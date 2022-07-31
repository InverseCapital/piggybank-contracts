import 'dotenv/config'
import { ethers } from 'hardhat'

import { getPiggyBankContract } from '../utils/contracts'

async function main() {
  const accounts = await ethers.getSigners()
  console.log('Using address: ', accounts[0].address)

  const piggyBankContract = await getPiggyBankContract(accounts[0])

  const deposit = await piggyBankContract.getUserValidDeposit(
    accounts[0].address
  )

  console.log('Valid deposit: ', ethers.utils.formatEther(deposit))
  process.exit()
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
