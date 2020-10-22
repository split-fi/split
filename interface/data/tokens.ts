import { deployments } from "split-contracts";

import { ChainId } from "../types/ethereum";
import { Asset, FullAsset } from "../types/split";
import { CHAIN_ID_NAME } from "../constants";

// NOTE: THIS IS NOT THE WETH TOKEN, it is a metadata object for native eth
export const ETH_TOKEN: Asset = {
  tokenAddress: "0x0000000000000000000000000000000000000000",
  name: "Ether",
  symbol: "ETH",
  decimals: 18,
  type: "full",
};

const assetToFullAsset = (asset: Asset, chainId: ChainId): FullAsset => {
  const deployment = deployments[CHAIN_ID_NAME[chainId]];
  if (!deployment) {
    throw new Error(`Could not find a deployment for chainId: ${chainId}`);
  }
  const componentSet = deployment.componentSets[asset.tokenAddress];
  if (!componentSet) {
    throw new Error(`Could not find a component set for tokenAddress: ${asset.tokenAddress}`);
  }
  return {
    ...asset,
    type: "full",
    componentTokens: {
      capitalComponentToken: {
        tokenAddress: componentSet.capitalComponentTokenAddress,
        decimals: 18,
        symbol: `c${asset.symbol}`,
        name: `Capital ${asset.name}`,
        type: "capital-split",
        fullTokenAddress: asset.tokenAddress,
        underlyingAssetSymbol: asset.symbol,
      },
      yieldComponentToken: {
        tokenAddress: componentSet.yieldComponentTokenAddress,
        decimals: 18,
        symbol: `y${asset.symbol}`,
        name: `Yield ${asset.name}`,
        type: "yield-split",
        fullTokenAddress: asset.tokenAddress,
        underlyingAssetSymbol: asset.symbol,
      },
    },
  };
};

export const AVAILABLE_FULL_TOKENS: { [chainId: number]: FullAsset[] } = {
  1: [
    assetToFullAsset(
      {
        tokenAddress: "0x4ddc2d193948926d02f9b1fe9e1daa0718270ed5",
        name: "Compound Ether",
        symbol: "cETH",
        decimals: 8,
        type: "full",
        underlyingAssetSymbol: "ETH",
      },
      1,
    ),
  ],
  4: [
    assetToFullAsset(
      {
        tokenAddress: "0xebf1a11532b93a529b5bc942b4baa98647913002",
        name: "Compound Basic Attention Token",
        symbol: "cBAT",
        decimals: 8,
        type: "full",
        underlyingAssetSymbol: "BAT",
      },
      4,
    ),
    assetToFullAsset(
      {
        tokenAddress: "0x52201ff1720134bbbbb2f6bc97bf3715490ec19b",
        name: "Compound ZRX",
        symbol: "cZRX",
        decimals: 8,
        type: "full",
        underlyingAssetSymbol: "ZRX",
      },
      4,
    ),
    assetToFullAsset(
      {
        tokenAddress: "0xd6801a1dffcd0a410336ef88def4320d6df1883e",
        name: "Compound Ether",
        symbol: "cETH",
        decimals: 8,
        type: "full",
        underlyingAssetSymbol: "ETH",
      },
      4,
    ),
  ],
};
