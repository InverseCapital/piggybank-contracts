import 'dotenv/config'
import { ethers } from 'hardhat'

import { getPiggyBankContract, getTokenContract } from '../utils/contracts'

async function main() {
  const accounts = await ethers.getSigners()
  console.log('Using address: ', accounts[0].address)

  const tokenContract = await getTokenContract(accounts[0])

  const piggyBankContract = await getPiggyBankContract(accounts[0])
  const allowance = await tokenContract.allowance(
    accounts[0].address,
    piggyBankContract.address
  )

  console.log('Allowance: ', ethers.utils.formatEther(allowance))
  process.exit()
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
