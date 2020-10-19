import { Deployments } from "./types";

export const deployments: Deployments = {
  mainnet: {
    splitVaultAddress: '0x8e31d1F69Cd5185527517F6fAc8A43edd24C93D7',
    priceOracleAddress: '0x09d75570c572d9D0193CAc4D4F4213a1D3c8A5bd',
    componentSets: {
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
        capitalComponentTokenAddress: "0x9D89723C7FB32a881440FD29FC4341d7aF5272D0",
        yieldComponentTokenAddress: "0x47dcc0330F6b6a5A4aD9b0Df656e61F4D1183F48",
      },
      // cZRX
      "0x52201ff1720134bbbbb2f6bc97bf3715490ec19b": {
        capitalComponentTokenAddress: "0x3E4CB6cD32187264e7cE73Af51d559e0a460adAd",
        yieldComponentTokenAddress: "0xc32F8676aE19f431dd4A3662F7e3820f6C23dBF8",
      },
      // cETH
      "0xd6801a1dffcd0a410336ef88def4320d6df1883e": {
        capitalComponentTokenAddress: "0x75271A98EE3AA43482dF3c92ea4e4cEFFab53D8f",
        yieldComponentTokenAddress: "0xa3C203CB85DcaD41C6eaa2572DC131Dc24db1bCa",
      },
    },
  },
};
