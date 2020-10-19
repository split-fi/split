import React, { useMemo, useState, useEffect } from "react";
import { useWeb3React } from "@web3-react/core";
import { JsonRpcProvider, Web3Provider } from "@ethersproject/providers";
import { Asset, AssetType, SplitAsset } from "../types/split";
import { AVAILABLE_TOKENS } from "../data/tokens";
import { ChainId } from "../types/ethereum";

export type TokensProviderState = Asset[] | undefined;

const initialState: TokensProviderState = undefined;

const TokensContext = React.createContext<TokensProviderState>(initialState);

// TODO(dave4506) as split tokens become more diverse and dynamically added via governance, this context will need to accomodate for that
const TokensProvider: React.FC = ({ children }) => {
  const { chainId } = useWeb3React();

  const tokens = useMemo(() => {
    if (!chainId) {
      // defaults to providing mainnet? TODO
      return AVAILABLE_TOKENS[ChainId.Mainnet];
    }
    return AVAILABLE_TOKENS[chainId];
  }, [chainId]);

  return <TokensContext.Provider value={tokens}>{children}</TokensContext.Provider>;
};

const useTokens = (): TokensProviderState => {
  return React.useContext(TokensContext);
};

const useTokensByAssetType = (assetType: AssetType): Asset[] | undefined => {
  return React.useContext(TokensContext)?.filter(a => a.type === assetType);
};

const useTokensByAddressMap = (): { [address: string]: Asset } | undefined => {
  const tokens = useTokens();
  const tokensMap = tokens.reduce((a, c) => ({ ...a, [c.tokenAddress]: c }), {} as { [address: string]: Asset });
  return tokensMap;
};

const useToken = (tokenAddress: string) => {
  const tokensMap = useTokensByAddressMap();
  return tokensMap[tokenAddress];
};

const useTokenAndSplitComponents = (tokenAddress): [Asset, Asset, Asset] => {
  const tokens = useTokens();
  const underlyingToken = useToken(tokenAddress);
  const capitalComponentToken = tokens.find(
    t => (t as SplitAsset).underlyingTokenAddress === tokenAddress && t.type === "capital-split",
  );
  const yieldComponentToken = tokens.find(
    t => (t as SplitAsset).underlyingTokenAddress === tokenAddress && t.type === "yield-split",
  );

  return [underlyingToken, capitalComponentToken, yieldComponentToken];
};

export { TokensProvider, useTokens, useTokensByAssetType, useTokensByAddressMap, useToken, useTokenAndSplitComponents };
