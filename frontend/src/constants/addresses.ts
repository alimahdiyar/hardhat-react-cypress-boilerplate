import {SupportedChainId} from './chains'

interface AddressMap {
  [chainId: number]: string
}

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

export const GreeterAddress: AddressMap = {
  [SupportedChainId.RINKEBY]: '0xB8d81C171f8e255fD28C2011C58dc4b91DF9cF2e',
}