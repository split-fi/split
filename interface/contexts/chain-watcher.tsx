import React, { useMemo, useState, useEffect } from "react";
import { useWeb3React } from "@web3-react/core";
import { JsonRpcProvider, Web3Provider } from "@ethersproject/providers";
import { NETWORK_URL } from "../constants";

export interface ChainWatcherProviderState {
  blockNumber: number | undefined | null;
}

const initialState: ChainWatcherProviderState = {
  blockNumber: undefined,
};

const ChainWatcherContext = React.createContext<ChainWatcherProviderState>(initialState);

const ChainWatcherProvider: React.FC = ({ children }) => {
  const { chainId } = useWeb3React();

  const [blockNumber, setBlockNumber] = useState<undefined | null | number>();

  useEffect(() => {
    if (chainId === undefined) {
      return;
    }

    const provider = new JsonRpcProvider(NETWORK_URL);

    let stale = false;

    // set initial value
    provider.getBlockNumber().then((blockNum: number) => {
      if (!stale) {
        setBlockNumber(blockNum);
      }
    });

    provider.on("block", (blockNum: number) => {
      if (stale) {
      }
      setBlockNumber(blockNum);
    });

    // remove listener when the component is unmounted
    return () => {
      provider.removeAllListeners("block");
      setBlockNumber(undefined);
      stale = true;
    };
  }, [chainId]);

  const value = useMemo(() => {
    return {
      blockNumber,
    };
  }, [blockNumber]);

  return <ChainWatcherContext.Provider value={value}>{children}</ChainWatcherContext.Provider>;
};

const useChainWatcher = (): ChainWatcherProviderState => {
  return React.useContext(ChainWatcherContext);
};

export { ChainWatcherProvider, useChainWatcher };
