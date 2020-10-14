import { Deployments } from "./types";

export const deployments: Deployments = {
  rinkeby: {
    splitVaultAddress: "0x8e31d1F69Cd5185527517F6fAc8A43edd24C93D7",
    priceOracleAddress: "0x7c2C195CD6D34B8F845992d380aADB2730bB9C6F",
    componentSets: {
      "0xebf1a11532b93a529b5bc942b4baa98647913002": {
        // cBAT
        capitalComponentTokenAddress: "0x09d75570c572d9D0193CAc4D4F4213a1D3c8A5bd",
        yieldComponentTokenAddress: "0x704bD80bDdAB309fBA02736bD898Bc6a69588C63",
      },
      "0x52201ff1720134bbbbb2f6bc97bf3715490ec19b": {
        // cZRX
        capitalComponentTokenAddress: "0x3d9Ba05f737b9e84e90a163216E586FBBD5e48Ff",
        yieldComponentTokenAddress: "0xF835c2995680811e0681D38dbDbaf1937Da3bD6A",
      },
      '0xd6801a1dffcd0a410336ef88def4320d6df1883e': {
        // cETH
        capitalComponentTokenAddress: "0x833eb3945F25BE47Fd7E6FD13305d9F40238C467",
        yieldComponentTokenAddress: "0xB4F9D6015D7466Ae1FCc9729dFb3E04A1FEbe199",
      },
    },
  },
};
