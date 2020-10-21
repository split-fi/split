import React, { useMemo, useState, useEffect, useCallback } from "react";
import { useWeb3React } from "@web3-react/core";
import { Decimal } from "decimal.js";
import { useBlockchain } from "./blockchain";
import { useImmer } from "use-immer";
import { useTokenContracts } from "../hooks/contracts";
import { useAllTokens } from "./tokens";
import { useSplitProtocolAddresses } from "./split-addresses";

export interface AssetAllowancesProviderState {
  [tokenAddress: string]: Decimal | undefined | null;
}

export interface AssetAllowancesActionsProviderState {
  refreshAllowances: () => void;
}

const AssetAllowancesContext = React.createContext<AssetAllowancesProviderState>({});

const AssetAllowancesActionContext = React.createContext<AssetAllowancesActionsProviderState>({
  refreshAllowances: () => new Error("AssetAllowancesAction Provider not set"),
});

const AssetAllowancesProvider: React.FC = ({ children }) => {
  const { account, chainId, library } = useWeb3React();
  const { blockNum } = useBlockchain();
  const protocolAddresses = useSplitProtocolAddresses();
  const tokens = useAllTokens();
  const tokenAddresses = useMemo(() => tokens.map(t => t.tokenAddress), [tokens]);
  const tokenContracts = useTokenContracts(tokenAddresses);
  const [assetAllowances, setAssetAllowances] = useImmer<AssetAllowancesProviderState>({});
  const [refreshCounter, setRefreshCounter] = useState(0);

  useEffect(() => {
    if (!account) {
      return;
    }
    for (let tokenContract of tokenContracts) {
      tokenContract
        .allowance(account, protocolAddresses.splitVaultAddress)
        .then(bal => {
          setAssetAllowances(draft => {
            draft[tokenContract.address] = new Decimal(bal.toString());
          });
        })
        .catch(_ => {
          setAssetAllowances(draft => {
            draft[tokenContract.address] = null;
          });
        });
    }
  }, [account, chainId, blockNum, tokenAddresses, refreshCounter]);

  const refreshAllowances = useCallback(() => {
    setRefreshCounter(refreshCounter + 1);
  }, [setRefreshCounter]);

  return (
    <AssetAllowancesActionContext.Provider value={{ refreshAllowances }}>
      <AssetAllowancesContext.Provider value={assetAllowances}>{children}</AssetAllowancesContext.Provider>
    </AssetAllowancesActionContext.Provider>
  );
};

const useRefreshAllowances = (): (() => void) => {
  return React.useContext(AssetAllowancesActionContext).refreshAllowances;
};

const useAssetAllowances = (): AssetAllowancesProviderState => {
  return React.useContext(AssetAllowancesContext);
};

const useAssetAllowance = (tokenAddress: string): Decimal | undefined => {
  return React.useContext(AssetAllowancesContext)[tokenAddress];
};

export { AssetAllowancesProvider, useAssetAllowances, useAssetAllowance, useRefreshAllowances };
