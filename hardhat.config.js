require("@nomiclabs/hardhat-waffle");
require("@typechain/hardhat");
const keyConfig = require('./config/config.json');

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  // defaultNetwork: "avalanche_test",
  defaultNetwork: "local",
  networks: {
    hardhat: {
      // url: "http://localhost:8545",
      chainId: 31337,
      // gasPrice: 2000000000,
      gas: 6000000,
      forking: {
        enabled: true,
        url: `https://mainnet.infura.io/v3/${keyConfig.infura_key}`,
      }
    },
    local: {
      url: "http://localhost:7545",
      chainId: 1337,
      gasPrice: 2000000000,
      gas: 6000000,
      accounts: [keyConfig.ganache]
    },
    ropsten: {
      url: `https://eth-mainnet.alchemyapi.io/v2/${keyConfig.alchemy_key}`,
      chainId: 3,
      gasPrice: 2000000000,
      gas: 2100000,
      accounts: [keyConfig.eth_key]
    },
    avalanche_test: {
      chainId: 43113,
      gasPrice: 225000000000,
      gas: 2100000,
      url: 'https://api.avax-test.network/ext/bc/C/rpc',
      accounts: [keyConfig.eth_key]
    },
    // ropsten: {
    //
    // },
    // mainnet: {
    // 
    // }
  },
  solidity: {
    compilers: [
      {
        version: "0.7.5",
        settings: {
          metadata: {
            bytecodeHash: "none",
          },
          optimizer: {
            enabled: true,
            runs: 800,
          },
        },
      },
      {
        version: "0.6.12",
      },
      {
        version: "0.6.6"
      },
      {
        version: "0.5.16"
      },
      {
        version: "0.4.18"
      }
    ],
    settings: {
      outputSelection: {
          "*": {
              "*": ["storageLayout"],
          },
      },
      optimizer: {
        enabled: true,
        runs: 200
      }
    },
  },
  typechain: {
    outDir: "typechain",
    target: "ethers-v5",
  },
};
