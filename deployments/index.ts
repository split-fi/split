import { Deployments } from "./types";

export const deployments: Deployments = {
  rinkeby: {
    splitVaultAddress: "0x8e31d1F69Cd5185527517F6fAc8A43edd24C93D7",
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
        capitalComponentTokenAddress: "0x0D3ca0684A04C0dc9761eEEFEa7494c9a1492B09",
        yieldComponentTokenAddress: "0x3176B226A9c657856624e5A0E9C638F9ce13C778",
      },
    },
  },
};
