import { ethers, getDefaultProvider } from 'ethers'

const networkUrls: Record<string, string> = {
  mumbai: process.env.MUMBAI_URL || '',
}

export function getProvider(network = 'mumbai') {
  switch (network) {
    case 'mumbai':
      return new ethers.providers.JsonRpcProvider(networkUrls[network])
    default:
      return getDefaultProvider()
  }
}
