import { Contract, ContractInterface, Signer } from 'ethers'
import hre, { ethers } from 'hardhat'
import { PiggyBank, MyToken } from '../typechain-types'

import PiggyBankJson from '../artifacts/contracts/PiggyBank.sol/PiggyBank.json'
import TokenJson from '../artifacts/contracts/MyToken.sol/MyToken.json'

import {
  AddressMap,
  PIGGY_BANK_ADDRESS,
  TOKEN_ADDRESS,
} from '../constants/addresses'
import { getProvider } from './providers'
import { SupportedChainId } from '../constants/chains'

export async function deployContract<T extends Contract>(
  contractName: string,
  ...args: unknown[]
) {
  // Get contract factory
  const contractFactory = await ethers.getContractFactory(contractName)

  // Deploy contract
  const contract = (await contractFactory.deploy(...args)) as T
  await contract.deployed()

  return contract
}

export async function getContract<T extends Contract>(
  addressOrAddressMap: string | AddressMap,
  abi: ContractInterface,
  signer?: Signer
) {
  const { config, name } = hre.network
  const provider = getProvider(name)

  const address =
    typeof addressOrAddressMap === 'string'
      ? addressOrAddressMap
      : addressOrAddressMap[config.chainId || SupportedChainId.LOCAL]

  return new Contract(address, abi, signer ?? provider) as T
}

export async function getPiggyBankContract(signer?: Signer) {
  return getContract<PiggyBank>(PIGGY_BANK_ADDRESS, PiggyBankJson.abi, signer)
}

export async function getTokenContract(signer?: Signer) {
  return getContract<MyToken>(TOKEN_ADDRESS, TokenJson.abi, signer)
}
