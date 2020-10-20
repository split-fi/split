import React, { useMemo } from "react";
import { useWeb3React } from "@web3-react/core";
import { Asset, FullAsset, AssetType } from "../types/split";
import { AVAILABLE_FULL_TOKENS } from "../data/tokens";
import { ChainId } from "../types/ethereum";

export type TokensProviderState = FullAsset[] | undefined;

const initialState: TokensProviderState = undefined;

const FullTokensContext = React.createContext<TokensProviderState>(initialState);

// TODO(dave4506) as split tokens become more diverse and dynamically added via governance, this context will need to accomodate for that
const TokensProvider: React.FC = ({ children }) => {
  const { chainId } = useWeb3React();

  const tokens = useMemo(() => {
    if (!chainId) {
      // defaults to providing mainnet? TODO
      return AVAILABLE_FULL_TOKENS[ChainId.Mainnet];
    }
    return AVAILABLE_FULL_TOKENS[chainId];
  }, [chainId]);
  return <FullTokensContext.Provider value={tokens}>{children}</FullTokensContext.Provider>;
};

const useFullTokens = (): TokensProviderState => {
  return React.useContext(FullTokensContext);
};

const useTokensByAssetType = (assetType: AssetType): FullAsset[] | undefined => {
  return React.useContext(FullTokensContext)?.filter(a => a.type === assetType);
};

const useFullTokensByAddress = (): { [address: string]: FullAsset } | undefined => {
  const tokens = useFullTokens();
  const tokensMap = tokens.reduce((a, c) => ({ ...a, [c.tokenAddress]: c }), {} as { [address: string]: FullAsset });
  return tokensMap;
};

const useAllTokens = (): Asset[] => {
  const fullTokens = useFullTokens();
  const allTokens = [];
  for (const fullTokenAddress of Object.keys(fullTokens)) {
    const fullToken = fullTokens[fullTokenAddress];
    const { capitalComponentToken, yieldComponentToken } = fullToken.componentTokens;
    allTokens.push(fullToken, capitalComponentToken, yieldComponentToken);
  }
  return allTokens;
};

const useFullToken = (tokenAddress: string): FullAsset => {
  const tokensMap = useFullTokensByAddress();
  return tokensMap[tokenAddress];
};

export { TokensProvider, useAllTokens, useFullTokens, useTokensByAssetType, useFullTokensByAddress, useFullToken };
