import React, { useMemo, useState, useEffect } from "react";
import { useWeb3React } from "@web3-react/core";
import { JsonRpcProvider, Web3Provider } from "@ethersproject/providers";
import { BigNumber } from "ethers";
import { useChainWatcher } from "./chain-watcher";
import { useImmer } from "use-immer";
import { useTokenContracts } from "../hooks/contracts";
import { useTokens } from "./tokens";

export interface AssetBalancesProviderState {
  eth: BigNumber | undefined | null;
  [tokenAddress: string]: BigNumber | undefined | null;
}

const initialState: AssetBalancesProviderState = {
  eth: undefined,
};

const AssetBalancesContext = React.createContext<AssetBalancesProviderState>(initialState);

const AssetBalancesProvider: React.FC = ({ children }) => {
  const { account, chainId, library } = useWeb3React();
  const { blockNumber } = useChainWatcher();
  const tokens = useTokens();
  const tokenAddresses = useMemo(() => tokens.map(t => t.tokenAddress), [tokens]);
  const tokenContracts = useTokenContracts(tokenAddresses);
  const [assetBalances, setAssetBalances] = useImmer<AssetBalancesProviderState>(initialState);

  useEffect(() => {
    if (!account) {
      return;
    }
    (library as Web3Provider)
      .getBalance(account)
      .then(bal => {
        setAssetBalances(draft => ({
          ...draft,
          eth: bal,
        }));
      })
      .catch(_ => {
        setAssetBalances(draft => ({
          ...draft,
          eth: null,
        }));
      });
    for (let tokenContract of tokenContracts) {
      tokenContract
        .balanceOf(account)
        .then(bal => {
          setAssetBalances(draft => ({
            ...draft,
            [tokenContract.address]: bal,
          }));
        })
        .catch(_ => {
          setAssetBalances(draft => ({
            ...draft,
            [tokenContract.address]: null,
          }));
        });
    }
  }, [account, chainId, blockNumber, tokenAddresses]);

  return <AssetBalancesContext.Provider value={assetBalances}>{children}</AssetBalancesContext.Provider>;
};

const useAssetBalances = (): AssetBalancesProviderState => {
  return React.useContext(AssetBalancesContext);
};

const useAssetBalance = (tokenAddress: string | undefined): BigNumber | undefined => {
  return React.useContext(AssetBalancesContext)[tokenAddress && ""];
};

export { AssetBalancesProvider, useAssetBalances, useAssetBalance };
