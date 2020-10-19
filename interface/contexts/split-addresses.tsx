import React, { useMemo, useState, useEffect } from "react";
import { useWeb3React } from "@web3-react/core";
import { JsonRpcProvider, Web3Provider } from "@ethersproject/providers";
import { deployments, Deployment } from "split-contracts";
import { CHAIN_ID_NAME } from "../constants";

export type SplitProtocolAddressesProviderState = Deployment | undefined;

const initialState: SplitProtocolAddressesProviderState = undefined;

const SplitProtocolAddressesContext = React.createContext<SplitProtocolAddressesProviderState>(initialState);

// TODO(dave4506) as split tokens become more diverse and dynamically added via governance, this context will need to accomodate for that
const SplitProtocolAddressesProvider: React.FC = ({ children }) => {
  const { chainId } = useWeb3React();

  const value = useMemo(() => {
    if (!chainId) {
      return;
    }
    return deployments[CHAIN_ID_NAME[chainId]];
  }, [chainId]);

  return <SplitProtocolAddressesContext.Provider value={value}>{children}</SplitProtocolAddressesContext.Provider>;
};

const useSplitProtocolAddresses = (): SplitProtocolAddressesProviderState => {
  return React.useContext(SplitProtocolAddressesContext);
};

export { SplitProtocolAddressesProvider, useSplitProtocolAddresses };
