import React, { useMemo, useState, useEffect, useCallback } from "react";
import { useImmer } from "use-immer";
import { useWeb3React } from "@web3-react/core";
import { Decimal } from "decimal.js";

import { useCTokenPriceOracle } from "../hooks/contracts";

import { useChainWatcher } from "./chain-watcher";
import { useFullTokens } from "./tokens";

export interface FullTokenPricesProviderState {
  [tokenAddress: string]: Decimal | undefined | null;
}

export interface FullTokenPricesActionsProviderState {
  refreshPrices: () => void;
}

const FullTokenPricesContext = React.createContext<FullTokenPricesProviderState>({});

const FullTokenPricesActionContext = React.createContext<FullTokenPricesActionsProviderState>({
  refreshPrices: () => new Error("FullTokenPricesAction Provider not set"),
});

const FullTokenPricesProvider: React.FC = ({ children }) => {
  const { account, chainId } = useWeb3React();
  const { blockNumber } = useChainWatcher();
  const tokens = useFullTokens();
  const tokenAddresses = useMemo(() => tokens.map(t => t.tokenAddress), [tokens]);
  const [fullTokenPrices, setFullTokenPrices] = useImmer<FullTokenPricesProviderState>({});
  const [refreshCounter, setRefreshCounter] = useState(0);
  const { priceOracle } = useCTokenPriceOracle();

  useEffect(() => {
    for (let tokenAddress of tokenAddresses) {
      priceOracle
        .getPrice(tokenAddress)
        .then(price => {
          setFullTokenPrices(draft => {
            draft[tokenAddress] = new Decimal(price.toString());
          });
        })
        .catch(e => {
          setFullTokenPrices(draft => {
            draft[tokenAddress] = null;
          });
        });
    }
  }, [account, chainId, blockNumber, tokenAddresses, priceOracle, refreshCounter]);

  const refreshPrices = useCallback(() => {
    setRefreshCounter(refreshCounter + 1);
  }, [setRefreshCounter]);

  return (
    <FullTokenPricesActionContext.Provider value={{ refreshPrices }}>
      <FullTokenPricesContext.Provider value={fullTokenPrices}>{children}</FullTokenPricesContext.Provider>
    </FullTokenPricesActionContext.Provider>
  );
};

const useRefreshPrices = (): (() => void) => {
  return React.useContext(FullTokenPricesActionContext).refreshPrices;
};

const useFullTokenPrices = (): FullTokenPricesProviderState => {
  return React.useContext(FullTokenPricesContext);
};

const useFullTokenPrice = (tokenAddress: string): Decimal | undefined => {
  return React.useContext(FullTokenPricesContext)[tokenAddress];
};

export { FullTokenPricesProvider, useFullTokenPrices, useFullTokenPrice, useRefreshPrices };
