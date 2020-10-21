import React, { useCallback, useEffect, useMemo } from "react";
import { useWeb3React } from "@web3-react/core";
import { Asset, FullAsset, AssetType } from "../types/split";
import { ChainId } from "../types/ethereum";
import { TransactionMetadata, TransactionObject } from "../types/app";
import { useBlockchain } from "./blockchain";
import { useImmer } from "use-immer";
import { Web3Provider } from "@ethersproject/providers";
import { useTxBannerActions } from "./banner";

export interface TransactionActionsProviderState {
  addTransaction: (sender: string, txHash: string, metadata?: TransactionMetadata) => void;
}

interface TransactionMap {
  [txHash: string]: TransactionObject;
}

export type TransactionProviderState = TransactionMap;

const TransactionContext = React.createContext<TransactionProviderState>({});
const TransactionActionsContext = React.createContext<TransactionActionsProviderState>({
  addTransaction: () => new Error("TransactionProvider not set."),
});

const TransactionProvider: React.FC = ({ children }) => {
  const { chainId, library } = useWeb3React<Web3Provider>();
  const { blockNum } = useBlockchain();
  const [transactionsMap, setTransactionsMap] = useImmer<TransactionMap>({});
  const { addPendingTxBanner, updateTxBanner } = useTxBannerActions();

  useEffect(() => {
    if (!chainId || !blockNum || !library) {
      return;
    }

    for (const transaction of Object.values(transactionsMap)) {
      if (transaction.status === "in-progress") {
        library
          .getTransactionReceipt(transaction.txHash)
          .then(receipt => {
            if (receipt) {
              setTransactionsMap(draft => {
                draft[transaction.txHash].lastBlockNumChecked = blockNum;
                draft[transaction.txHash].receipt = receipt;
                draft[transaction.txHash].status = receipt.status === 1 ? "success" : "failed";
              });
              updateTxBanner(transaction.txHash, {
                description: "", // TODO(dave4506): descriptions for each kind of possible tx
                type: receipt.status === 1 ? "success" : "error",
              });
            } else {
              setTransactionsMap(draft => {
                draft[transaction.txHash].lastBlockNumChecked = blockNum;
              });
            }
          })
          .catch(error => {
            console.error(`failed to check transaction hash: ${transaction.txHash}`, error);
          });
      }
    }
  }, [chainId, blockNum, setTransactionsMap, transactionsMap]);

  const addTransaction = useCallback(
    (sender: string, txHash: string, metadata?: TransactionMetadata) => {
      // do not add a tx if already in the map
      if (!!transactionsMap[txHash]) {
        return;
      }

      setTransactionsMap(draft => {
        draft[txHash] = {
          senderAddress: sender,
          txHash,
          metadata,
          status: "in-progress",
          chainId,
        };
      });

      // TODO(dave4506): based on varying tx, different descriptions/metadata is provided to banner
      addPendingTxBanner(txHash, "");
    },
    [transactionsMap, setTransactionsMap, chainId],
  );

  return (
    <TransactionContext.Provider value={transactionsMap}>
      <TransactionActionsContext.Provider value={{ addTransaction }}>{children}</TransactionActionsContext.Provider>
    </TransactionContext.Provider>
  );
};

const useTransactionActions = () => {
  return React.useContext(TransactionActionsContext);
};

const useTransactionsMap = () => {
  return React.useContext(TransactionContext);
};

const useTransaction = (txHash: string | undefined) => {
  return React.useContext(TransactionContext)[txHash];
};

export { TransactionProvider, useTransaction, useTransactionsMap, useTransactionActions };
