require("@nomiclabs/hardhat-waffle");
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
  defaultNetwork: "avalanche_test",
  // defaultNetwork: "local",
  networks: {
    local: {
      url: "http://localhost:7545",
      chainId: 1337,
      accounts: ['0caecdae0a94ad4ed4e7b529d22ce515f8e0cd8d74fac3e56850d763642985f1']
    },
    avalanche_test: {
      chainId: 43113,
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
      }
    ]
  },
};
