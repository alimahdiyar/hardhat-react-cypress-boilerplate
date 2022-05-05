// todo: figure out how env vars actually work in CI
// const TEST_PRIVATE_KEY = Cypress.env('INTEGRATION_TEST_PRIVATE_KEY')
import {Wallet} from '@ethersproject/wallet'
import {SupportedChainId} from "../../src/constants/chains";
import {truncateAddress} from "../../src/utils/account";

export const TEST_PRIVATE_KEY = '0xe580410d7c37d26c6ad1a837bbae46bc27f9066a466fb3a66e770523b4666d19'
export const TEST_PRIVATE_KEY_2 = '0x79a326abd4d35c206ed5365ff067ae2ab3bebc64865a7eb0b1c1ceedf037647b'

// address of the above key
export const TEST_ADDRESS_NEVER_USE = new Wallet(TEST_PRIVATE_KEY).address
export const TEST_ADDRESS_NEVER_USE_2 = new Wallet(TEST_PRIVATE_KEY_2).address

export const TEST_ADDRESS_NEVER_USE_SHORTENED = truncateAddress(TEST_ADDRESS_NEVER_USE)!

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

export const FAKE_TRANSACTION_HASH = {
  [SupportedChainId.RINKEBY]: '0xf365ba7bc192943767d8372f196db10b8de3096f5f6494a3f196d01518e79472',
}