import { deployments } from "split-contracts";
import { ChainId } from "../types/ethereum";
import { Asset, SplitAsset } from "../types/split";

export const createAssetsForTokenFromDeployments = (underlyingToken: Asset, chainId: ChainId): Asset[] => {
  const deployment = deployments[chainId];
  if (!deployment) {
    return [];
  }
  const splitComponentAddresses = deployment.componentSets[underlyingToken.tokenAddress];
  if (!splitComponentAddresses) {
    return [];
  }
  return [
    underlyingToken,
    {
      tokenAddress: splitComponentAddresses.capitalComponentTokenAddress,
      decimals: 18,
      symbol: `c${underlyingToken.name}`,
      name: `TODO ${underlyingToken.name}`,
      type: "capital-split",
      underlyingTokenAddress: underlyingToken.tokenAddress,
    } as SplitAsset,
    {
      tokenAddress: splitComponentAddresses.yieldComponentTokenAddress,
      decimals: 18,
      symbol: `y${underlyingToken.name}`,
      name: `TODO ${underlyingToken.name}`,
      type: "yield-split",
      underlyingTokenAddress: underlyingToken.tokenAddress,
    } as SplitAsset,
  ];
};
