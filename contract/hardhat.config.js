require('hardhat-abi-exporter')
require('dotenv').config()
require("@nomicfoundation/hardhat-ethers");
require("@nomiclabs/hardhat-etherscan");
require("@nomicfoundation/hardhat-chai-matchers");

const { DEPLOYER_PRIVATE_KEY, USER_PRIVATE_KEY, CHAIN_NAME ,RPC_ENDPOINT} = process.env
 
/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  defaultNetwork: CHAIN_NAME,
  networks: {
    local: {
      url: RPC_ENDPOINT,
      accounts: [DEPLOYER_PRIVATE_KEY,USER_PRIVATE_KEY],
    },
    bsc_test: {
      url: 'https://bsc-testnet-rpc.publicnode.com',
      accounts: [DEPLOYER_PRIVATE_KEY,USER_PRIVATE_KEY],
    },
    goerli: {
      url: "https://rpc.ankr.com/eth_goerli",
      accounts: [DEPLOYER_PRIVATE_KEY,USER_PRIVATE_KEY],
    },
    sepolia: {
      url: "https://rpc.ankr.com/eth_sepolia",
      accounts: [DEPLOYER_PRIVATE_KEY,USER_PRIVATE_KEY],
    },
    balst_test: {
      url: RPC_ENDPOINT,
      accounts: [DEPLOYER_PRIVATE_KEY,USER_PRIVATE_KEY],
    },
  },
  solidity: {
    compilers: [
      {
        version: '0.8.19',
        settings: {
          viaIR: true,  // 
          optimizer: {
            enabled: true,
            runs: 999999,
          },
        },
      },
      {
        version: '0.4.11',
        settings: {
          optimizer: {
            enabled: true,
            runs: 999999,
          },
        },
      },
      {
        version: '0.8.24',
        settings: {
          viaIR: true,  // 
          optimizer: {
            enabled: true,
            runs: 999999,
          },
        },
      },
      {
        version: '0.7.6',
        settings: {
          optimizer: {
            enabled: true,
            runs: 999999,
          },
        },
      },


    ],
  },
  abiExporter: {
    path: `./package/abi`,
    clear: true,
    flat: true,
    only: ["FunctionsConsumer"],
    spacing: 2,
    format: 'json',
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  }
}
