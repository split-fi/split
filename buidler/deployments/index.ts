import { Deployments } from "./types";

export const deployments: Deployments = {
  mainnet: {
    splitVaultAddress: "0x8e31d1F69Cd5185527517F6fAc8A43edd24C93D7",
    priceOracleAddress: "0x09d75570c572d9D0193CAc4D4F4213a1D3c8A5bd",
    componentSets: {
      // cETH
      "0x4ddc2d193948926d02f9b1fe9e1daa0718270ed5": {
        capitalComponentTokenAddress: "0x704bD80bDdAB309fBA02736bD898Bc6a69588C63",
        yieldComponentTokenAddress: "0x3d9Ba05f737b9e84e90a163216E586FBBD5e48Ff",
      },
    },
  },
  rinkeby: {
    splitVaultAddress: "0x17B9f2f7DE226eC18E77FEDB2c741d1B0D851bdA",
    priceOracleAddress: "0x9D8693092361ECCCdD30Ea2875a6054DF80D2472",
    componentSets: {
      // cBAT
      "0xebf1a11532b93a529b5bc942b4baa98647913002": {
        capitalComponentTokenAddress: "0xB5A363330c2442D3E90cE633a8C39C444D03F90E",
        yieldComponentTokenAddress: "0x69EF69397E9390f8dC690BE0AF01d9b9C38DeEB8",
      },
      // cZRX
      "0x52201ff1720134bbbbb2f6bc97bf3715490ec19b": {
        capitalComponentTokenAddress: "0x14375f2c717432a8692c13d7bea2534723d4ECC4",
        yieldComponentTokenAddress: "0xaEFa8E3b59333227633CbF7c9a5dF6a24F1f6a05",
      },
      // cETH
      "0xd6801a1dffcd0a410336ef88def4320d6df1883e": {
        capitalComponentTokenAddress: "0x75271A98EE3AA43482dF3c92ea4e4cEFFab53D8f",
        yieldComponentTokenAddress: "0xa3C203CB85DcaD41C6eaa2572DC131Dc24db1bCa",
      },
      // cUSDC
      "0x5b281a6dda0b271e91ae35de655ad301c976edb1": {
        capitalComponentTokenAddress: "0x71d2beCA71a141adAeb7B5AD62680BAeB22e2e42",
        yieldComponentTokenAddress: "0x7220eD76f750554f4384600BC4C66fe808502F3b",
      },
    },
  },
};
