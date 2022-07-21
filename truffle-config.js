require("dotenv").config();
const HDWalletProvider = require("truffle-hdwallet-provider");
const mnemonic = process.env.MNEMONIC;
module.exports = {
  compilers: {
    solc: {
      version: "^0.6.0",
    },
  },
  contracts_build_directory: "./src/contracts",
  test_directory: "./tests/truffle",
  plugins: ["solidity-coverage"],
  // Uncommenting the defaults below
  // provides for an easier quick-start with Ganache.
  // You can also follow this format for other networks;
  // see <http://truffleframework.com/docs/advanced/configuration>
  // for more details on how to specify configuration options!
  //
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*",
    },
    rinkeby: {
      provider: function() {
        return new HDWalletProvider(
          mnemonic,
          "https://rinkeby.infura.io/v3/" + process.env.INFURA_TOKEN
        );
      },
      network_id: 4,
      gas: 4500000,
      gasPrice: 10000000000,
    },
    gitlab: {
      host: "trufflesuite-ganache-cli",
      port: 8545,
      network_id: "*", // Match any network id
    },
    //  test: {
    //    host: "127.0.0.1",
    //    port: 7545,
    //    network_id: "*"
    //  }
  },
  //
};
