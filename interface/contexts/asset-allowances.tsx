import React, { useMemo, useState, useEffect } from "react";
import { useWeb3React } from "@web3-react/core";
import { BigNumber } from "ethers";
import { useChainWatcher } from "./chain-watcher";
import { useImmer } from "use-immer";
import { useTokenContracts } from "../hooks/contracts";
import { useTokens } from "./tokens";
import { useSplitProtocolAddresses } from "./split-addresses";

export interface AssetAllowancesProviderState {
  [tokenAddress: string]: BigNumber | undefined | null;
}

const initialState: AssetAllowancesProviderState = {
  eth: undefined,
};

const AssetAllowancesContext = React.createContext<AssetAllowancesProviderState>(initialState);

const AssetAllowancesProvider: React.FC = ({ children }) => {
  const { account, chainId, library } = useWeb3React();
  const { blockNumber } = useChainWatcher();
  const protocolAddresses = useSplitProtocolAddresses();
  const tokens = useTokens();
  const tokenAddresses = useMemo(() => tokens.map(t => t.tokenAddress), [tokens]);
  const tokenContracts = useTokenContracts(tokenAddresses);
  const [assetAllowances, setAssetAllowances] = useImmer<AssetAllowancesProviderState>(initialState);

  useEffect(() => {
    if (!account) {
      return;
    }
    for (let tokenContract of tokenContracts) {
      tokenContract
        .allowance(account, protocolAddresses.splitVaultAddress) // TODO is this correct?
        .then(bal => {
          setAssetAllowances(draft => ({
            ...draft,
            [tokenContract.address]: bal,
          }));
        })
        .catch(_ => {
          setAssetAllowances(draft => ({
            ...draft,
            [tokenContract.address]: null,
          }));
        });
    }
  }, [account, chainId, blockNumber, tokenAddresses]);

  return <AssetAllowancesContext.Provider value={assetAllowances}>{children}</AssetAllowancesContext.Provider>;
};

const useAssetAllowances = (): AssetAllowancesProviderState => {
  return React.useContext(AssetAllowancesContext);
};

const useAssetAllowance = (tokenAddress: string | undefined): BigNumber | undefined => {
  return React.useContext(AssetAllowancesContext)[tokenAddress && ""];
};

export { AssetAllowancesProvider, useAssetAllowances, useAssetAllowance };
