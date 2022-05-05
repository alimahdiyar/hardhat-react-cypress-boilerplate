// ***********************************************
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

import {Eip1193Bridge} from '@ethersproject/experimental/lib/eip1193-bridge'
import {JsonRpcProvider} from '@ethersproject/providers'
import {Wallet} from '@ethersproject/wallet'
import {formatChainId} from '../../src/utils/account'
import {SupportedChainId} from '../../src/constants/chains'
import GreeterArtifact from '../../../artifacts/contracts/Greeter.sol/Greeter.json'
import {ethers} from 'ethers'
import {TEST_ADDRESS_NEVER_USE, TEST_PRIVATE_KEY} from '../utils/data'
import {GreeterAddress} from "../../src/constants/addresses";

const {abi: GreeterAbi} = GreeterArtifact

const InputDataDecoder = require('ethereum-input-data-decoder')

function decodeEthCall(abi, input) {
    const decoder = new InputDataDecoder(abi)
    return decoder.decodeData(input)
}

function encodeEthResult(abi, funcName, result) {
    const iface = new ethers.utils.Interface(abi)
    return iface.encodeFunctionResult(funcName, result)
}

const FAKE_BLOCK_HASH = '0xeed54f1dd0adad878c624694038ac3c70631ec800b150b9caf9eedd4aea3df95'
const FAKE_TRANSACTION_HASH = {
    [SupportedChainId.RINKEBY]: '0x8c417b4770b68fed1dd27c6aa3c5a399910f6d8f20630b3a588ab8141d5bff43',
}

function isTheSameAddress(address1, address2) {
    return address1.toLowerCase() === address2.toLowerCase()
}

export class CustomizedBridge extends Eip1193Bridge {
    chainId = SupportedChainId.RINKEBY

    async sendAsync(...args) {
        console.debug('sendAsync called', ...args)
        return this.send(...args)
    }

    greet(_decodedInput, setResult) {
        const returnData = ["Hello!"]
        return encodeEthResult(GreeterAbi, 'greet', returnData)
    }

    setGreeting(decodedInput) {
        const [_greeting] = decodedInput
        return FAKE_TRANSACTION_HASH[this.chainId]
    }

    getSendArgs(args) {
        console.debug('send called', ...args)
        const isCallbackForm = typeof args[0] === 'object' && typeof args[1] === 'function'
        let callback
        let method
        let params
        if (isCallbackForm) {
            callback = args[1]
            method = args[0].method
            params = args[0].params
        } else {
            method = args[0]
            params = args[1]
        }
        return {
            isCallbackForm,
            callback,
            method,
            params,
        }
    }

    async send(...args) {
        const {isCallbackForm, callback, method, params} = this.getSendArgs(args)

        let result = null
        let resultIsSet = false

        function setResult(r) {
            result = r
            resultIsSet = true
        }

        if (method === 'eth_requestAccounts' || method === 'eth_accounts') {
            if (isCallbackForm) {
                callback({result: [TEST_ADDRESS_NEVER_USE]})
            } else {
                return Promise.resolve([TEST_ADDRESS_NEVER_USE])
            }
        }
        if (method === 'eth_chainId') {
            if (isCallbackForm) {
                callback(null, {result: formatChainId(String(this.chainId))})
            } else {
                return Promise.resolve(formatChainId(String(this.chainId)))
            }
        }
        if (method === 'eth_estimateGas') {
            const result = '0xba7f'
            if (isCallbackForm) {
                callback(null, {result})
            } else {
                return Promise.resolve(result)
            }
        }

        if (method === 'eth_call' || method === 'eth_sendTransaction') {
            console.log(params)
            if (isTheSameAddress(params[0].to, GreeterAddress[this.chainId])) {
                const decoded = decodeEthCall(GreeterAbi, params[0].data)
                const result = this[decoded.method](decoded.inputs)
                setResult(result)
            }
        }

        if (resultIsSet) {
            if (isCallbackForm) {
                callback(null, {result})
            } else {
                return result
            }
        }
        try {
            const result = await super.send(method, params)
            if (isCallbackForm) {
                callback(null, {result})
            } else {
                return result
            }
        } catch (error) {
            console.log({isCallbackForm, callback, method, params})

            if (isCallbackForm) {
                callback(error, null)
            } else {
                throw error
            }
        }
    }
}

export const provider = new JsonRpcProvider('https://rinkeby.infura.io/v3/4bf032f2d38a4ed6bb975b80d6340847', 4)
export const signer = new Wallet(TEST_PRIVATE_KEY, provider)
