import React, { useMemo, useState, useEffect } from "react";
import { useWeb3React } from "@web3-react/core";
import { JsonRpcProvider, Web3Provider } from "@ethersproject/providers";
import { NETWORK_URL } from "../constants";

export interface BlockchainProviderState {
  blockNum: number | undefined | null;
}

const initialState: BlockchainProviderState = {
  blockNum: undefined,
};

const BlockchainContext = React.createContext<BlockchainProviderState>(initialState);

const BlockchainProvider: React.FC = ({ children }) => {
  const { chainId } = useWeb3React();

  const [blockNum, setblockNum] = useState<undefined | null | number>();

  useEffect(() => {
    if (chainId === undefined) {
      return;
    }

    const provider = new JsonRpcProvider(NETWORK_URL);

    let stale = false;

    // set initial value
    provider.getBlockNumber().then((blockNum: number) => {
      if (!stale) {
        setblockNum(blockNum);
      }
    });

    provider.on("block", (blockNum: number) => {
      if (stale) {
      }
      setblockNum(blockNum);
    });

    // remove listener when the component is unmounted
    return () => {
      provider.removeAllListeners("block");
      setblockNum(undefined);
      stale = true;
    };
  }, [chainId]);

  const value = useMemo(() => {
    return {
      blockNum,
    };
  }, [blockNum]);

  return <BlockchainContext.Provider value={value}>{children}</BlockchainContext.Provider>;
};

const useBlockchain = (): BlockchainProviderState => {
  return React.useContext(BlockchainContext);
};

export { BlockchainProvider, useBlockchain };
