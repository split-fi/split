export type AssetType = "full" | "yield-split" | "capital-split" | "governance-split";

export interface AssetMetaData {
  symbol: string;
  name: string;
  decimals: number;
}

export interface Asset extends AssetMetaData {
  tokenAddress: string;
  type: AssetType;
  userlyingAssetMetaData: AssetMetaData;
}

export interface ComponentTokens {
  yieldComponentToken: ComponentToken;
  capitalComponentToken: ComponentToken;
}

export interface FullAsset extends Asset {
  type: Exclude<AssetType, "yield-split" | "capital-split" | "governance-split">;
  componentTokens: ComponentTokens;
}

export interface ComponentToken extends Asset {
  fullTokenAddress: string;
  type: Exclude<AssetType, "full">;
}
