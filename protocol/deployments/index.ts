import { Deployments } from "./types";

export const deployments: Deployments = {
  mainnet: {
    compAddress: "0xc00e94Cb662C3520282E6f5717214004A7f26888",
    usdcAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    // TODO: Deploy
    splitPoolFactoryAddress: "",
    balancerPoolFactoryAddress: "0x9424B1412450D0f8Fc2255FAf6046b98213B76Bd",
    balancerSmartPoolFactoryAddress: "0xed52D8E202401645eDAD1c0AA21e872498ce47D0",
    splitVaultAddress: "0x8e31d1F69Cd5185527517F6fAc8A43edd24C93D7",
    priceOracleAddress: "0x09d75570c572d9D0193CAc4D4F4213a1D3c8A5bd",
    componentSets: {
      // cETH
      "0x4ddc2d193948926d02f9b1fe9e1daa0718270ed5": {
        capitalComponentTokenAddress: "0x704bD80bDdAB309fBA02736bD898Bc6a69588C63",
        yieldComponentTokenAddress: "0x3d9Ba05f737b9e84e90a163216E586FBBD5e48Ff",
      },
      // cBAT
      "0x6c8c6b02e7b2be14d4fa6022dfd6d75921d90e4e": {
        capitalComponentTokenAddress: "0x15bD9367dA17D534870D958843a1d828B5Ba2414",
        yieldComponentTokenAddress: "0xE8B8d22B96eda2aCf98C71085375600B20bF822f",
      },
      // cUNI
      "0x35a18000230da775cac24873d00ff85bccded550": {
        capitalComponentTokenAddress: "0xEacAA5fbE3C364fcAcEd6cD14CEd4E54703cE5D4",
        yieldComponentTokenAddress: "0x6b12838a3128F590887e956638e212Dd1306c3EA",
      },
    },
    splitPools: {},
    libraries: {
      BalancerSafeMath: "0xCfE28868F6E0A24b7333D22D8943279e76aC2cdc",
      RightsManager: "0x0F811b1AF2B6B447B008eFF31eCceeE5A0b1d842",
      SmartPoolManager: "0xA3F9145CB0B50D907930840BB2dcfF4146df8Ab4",
    },
  },
  rinkeby: {
    // HACK: there is no COMP on Rinkeby, so using WETH instead.
    compAddress: "0xc778417e063141139fce010982780140aa0cd5ab",
    usdcAddress: "0x4DBCdF9B62e891a7cec5A2568C3F4FAF9E8Abe2b",
    splitPoolFactoryAddress: "0x208426c2B281aC34f7005A03f638F43C6489505e",
    balancerPoolFactoryAddress: "0x9C84391B443ea3a48788079a5f98e2EaD55c9309",
    balancerSmartPoolFactoryAddress: "0xA3F9145CB0B50D907930840BB2dcfF4146df8Ab4",
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
    splitPools: {
      // cETH
      "0xd6801a1dffcd0a410336ef88def4320d6df1883e": {
        poolAddress: "0x5CDE85734A2A07D3Eb59c8005D9035cf3C94b337",
      },
    },
    libraries: {
      BalancerSafeMath: "0x0F811b1AF2B6B447B008eFF31eCceeE5A0b1d842",
      RightsManager: "0x4aCB6685da2B5FcB29b1614E71825CE67464440b",
      SmartPoolManager: "0xb3a3f6826281525dd57f7BA837235E4Fa71C6248",
    },
  },
  // TODO: deploy to kovan
};
