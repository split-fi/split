import { ChainId } from "../types/ethereum";
import { Asset } from "../types/split";
import { createAssetsForTokenFromDeployments } from "../utils/tokens";

export const AVAILABLE_TOKENS: { [chainId: number]: Asset[] } = {
  1: [
    ...createAssetsForTokenFromDeployments(
      {
        tokenAddress: "0x4ddc2d193948926d02f9b1fe9e1daa0718270ed5",
        name: "Compound Ether",
        symbol: "cETH",
        decimals: 18,
        type: "underlying",
      },
      1,
    ),
  ],
  4: [
    ...createAssetsForTokenFromDeployments(
      {
        tokenAddress: "0xebf1a11532b93a529b5bc942b4baa98647913002",
        name: "Compound Basic Attention Token",
        symbol: "cBAT",
        decimals: 18,
        type: "underlying",
      },
      1,
    ),
    ...createAssetsForTokenFromDeployments(
      {
        tokenAddress: "0x52201ff1720134bbbbb2f6bc97bf3715490ec19b",
        name: "Compound ZRX",
        symbol: "cZRX",
        decimals: 18,
        type: "underlying",
      },
      1,
    ),
    ...createAssetsForTokenFromDeployments(
      {
        tokenAddress: "0xd6801a1dffcd0a410336ef88def4320d6df1883e",
        name: "Compound Ether",
        symbol: "cETH",
        decimals: 18,
        type: "underlying",
      },
      1,
    ),
  ],
};
