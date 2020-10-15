require("dotenv").config();
import { usePlugin, BuidlerConfig } from "@nomiclabs/buidler/config";

import "./tasks";

usePlugin("@nomiclabs/buidler-waffle");
usePlugin("buidler-typechain");
usePlugin("@nomiclabs/buidler-etherscan");

const config = {
  solc: {
    version: "0.6.8",
  },
  typechain: {
    outDir: "typechain",
    target: "ethers-v5",
  },
  networks: {},
  etherscan: {},
};

const { ETH_RPC_URL_RINKEBY, PRIVATE_KEY_RINKEBY, ETHERSCAN_API_KEY } = process.env;

if (ETH_RPC_URL_RINKEBY && PRIVATE_KEY_RINKEBY) {
  (config.networks as any).rinkeby = {
    url: ETH_RPC_URL_RINKEBY,
    accounts: [PRIVATE_KEY_RINKEBY],
  };
}

if (ETHERSCAN_API_KEY) {
  (config.etherscan as any).apiKey = ETHERSCAN_API_KEY;
}

export default config as BuidlerConfig;
