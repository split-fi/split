export type AssetType = "full" | "yield-split" | "capital-split" | "governance-split";

export interface Asset {
  tokenAddress: string;
  symbol: string;
  name: string;
  type: AssetType;
  decimals: number;
  underlyingAssetSymbol?: string;
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
