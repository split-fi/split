import React, { useMemo, useState, useEffect, useCallback } from "react";
import { useWeb3React } from "@web3-react/core";
import { JsonRpcProvider, Web3Provider } from "@ethersproject/providers";
import { Decimal } from "decimal.js";
import { useChainWatcher } from "./chain-watcher";
import { useImmer } from "use-immer";
import { useTokenContracts } from "../hooks/contracts";
import { useAllTokens } from "./tokens";

export interface AssetBalancesProviderState {
  eth: Decimal | undefined | null;
  [tokenAddress: string]: Decimal | undefined | null;
}

const initialState: AssetBalancesProviderState = {
  eth: undefined,
};

export interface AssetBalancesActionsProviderState {
  refreshBalances: () => void;
}

const AssetBalancesContext = React.createContext<AssetBalancesProviderState>(initialState);

const AssetBalancesActionContext = React.createContext<AssetBalancesActionsProviderState>({
  refreshBalances: () => new Error("AssetBalancesActions Provider not set"),
});

const AssetBalancesProvider: React.FC = ({ children }) => {
  const { account, chainId, library } = useWeb3React();
  const { blockNumber } = useChainWatcher();
  const tokens = useAllTokens();
  const tokenAddresses = useMemo(() => tokens.map(t => t.tokenAddress), [tokens]);
  const tokenContracts = useTokenContracts(tokenAddresses);
  const [assetBalances, setAssetBalances] = useImmer<AssetBalancesProviderState>(initialState);
  const [refreshCounter, setRefreshCounter] = useState(0);

  useEffect(() => {
    if (!account) {
      return;
    }
    (library as Web3Provider)
      .getBalance(account)
      .then(bal => {
        setAssetBalances(draft => ({
          ...draft,
          eth: new Decimal(bal.toString()),
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
          setAssetBalances(draft => {
            draft[tokenContract.address] = new Decimal(bal.toString());
          });
        })
        .catch(_ => {
          setAssetBalances(draft => {
            draft[tokenContract.address] = null;
          });
        });
    }
  }, [account, chainId, blockNumber, tokenAddresses, refreshCounter]);

  const refreshBalances = useCallback(() => {
    setRefreshCounter(refreshCounter + 1);
  }, [setRefreshCounter]);

  return (
    <AssetBalancesActionContext.Provider value={{ refreshBalances }}>
      <AssetBalancesContext.Provider value={assetBalances}>{children}</AssetBalancesContext.Provider>
    </AssetBalancesActionContext.Provider>
  );
};

const useAssetBalances = (): AssetBalancesProviderState => {
  return React.useContext(AssetBalancesContext);
};

const useAssetBalance = (tokenAddress: string): Decimal => {
  return React.useContext(AssetBalancesContext)[tokenAddress] || new Decimal(0);
};

const useEthBalance = (): Decimal | undefined => {
  return React.useContext(AssetBalancesContext).eth;
};

export { AssetBalancesProvider, useAssetBalances, useAssetBalance, useEthBalance };
