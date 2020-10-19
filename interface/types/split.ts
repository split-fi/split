export type AssetType = "underlying" | "yield-split" | "capital-split" | "governance-split";

export interface Asset {
  tokenAddress: string;
  symbol: string;
  name: string;
  type: AssetType;
  decimals: number;
}

export interface SplitAsset extends Asset {
  underlyingTokenAddress: string;
  type: Exclude<AssetType, "underlying">;
}
