import React, { useMemo, useState, useEffect, useCallback } from "react";
import { useImmer } from "use-immer";
import { useWeb3React } from "@web3-react/core";
import { Decimal } from "decimal.js";

import { useYieldTokenContracts } from "../hooks/contracts";

import { useBlockchain } from "./blockchain";
import { useTokensByAssetType } from "./tokens";

export interface YieldBalancesProviderState {
  [tokenAddress: string]: Decimal | undefined | null;
}

export interface YieldBalancesActionsProviderState {
  refreshYieldBalances: () => void;
}

const YieldBalancesContext = React.createContext<YieldBalancesProviderState>({});

const YieldBalancesActionContext = React.createContext<YieldBalancesActionsProviderState>({
  refreshYieldBalances: () => new Error("YieldBalancesAction Provider not set"),
});

const YieldBalancesProvider: React.FC = ({ children }) => {
  const { account, chainId } = useWeb3React();
  const { blockNum } = useBlockchain();
  const tokens = useTokensByAssetType("yield-split");
  const tokenAddresses = useMemo(() => tokens.map(t => t.tokenAddress), [tokens]);
  const [yieldBalances, setYieldBalances] = useImmer<YieldBalancesProviderState>({});
  const [refreshCounter, setRefreshCounter] = useState(0);
  const tokenContracts = useYieldTokenContracts(tokenAddresses);

  useEffect(() => {
    if (!account) {
      return;
    }
    for (let tokenContract of tokenContracts) {
      tokenContract["calculatePayoutAmount(address)"](account)
        .then(balance => {
          setYieldBalances(draft => {
            draft[tokenContract.address] = new Decimal(balance.toString());
          });
        })
        .catch(e => {
          setYieldBalances(draft => {
            draft[tokenContract.address] = null;
          });
        });
    }
  }, [account, chainId, blockNum, tokenAddresses, refreshCounter]);

  const refreshYieldBalances = useCallback(() => {
    setRefreshCounter(refreshCounter + 1);
  }, [setRefreshCounter]);

  return (
    <YieldBalancesActionContext.Provider value={{ refreshYieldBalances }}>
      <YieldBalancesContext.Provider value={yieldBalances}>{children}</YieldBalancesContext.Provider>
    </YieldBalancesActionContext.Provider>
  );
};

const useRefreshOutstandingYield = (): (() => void) => {
  return React.useContext(YieldBalancesActionContext).refreshYieldBalances;
};

const useYieldBalances = (): YieldBalancesProviderState => {
  return React.useContext(YieldBalancesContext);
};

const useYieldBalance = (tokenAddress: string): Decimal | undefined => {
  return React.useContext(YieldBalancesContext)[tokenAddress];
};

export {
  YieldBalancesProvider,
  useYieldBalances,
  useYieldBalance,
  useRefreshOutstandingYield as useRefreshYieldBalances,
};
