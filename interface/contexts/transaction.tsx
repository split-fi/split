import React, { useCallback, useEffect, useMemo } from "react";
import { useWeb3React } from "@web3-react/core";
import { Asset, FullAsset, AssetType } from "../types/split";
import { ChainId } from "../types/ethereum";
import { TransactionMetadata, TransactionObject } from "../types/app";
import { useBlockchain } from "./blockchain";
import { useImmer } from "use-immer";
import { Web3Provider } from "@ethersproject/providers";
import { useTxBannerActions } from "./banner";
import { formatTokenAmount } from "../utils/format";

const BLOCK_NUM_AGO_TILL_DISMISS = 6;

export interface TransactionActionsProviderState {
  addTransaction: (txHash: string, metadata?: TransactionMetadata) => void;
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
    if (!chainId || !blockNum) {
      return;
    }
    // TODO: maybe worth looping on banners not transactions
    for (const transaction of Object.values(transactionsMap)) {
      if (!!transaction.lastBlockNumChecked) {
        if (blockNum - transaction.lastBlockNumChecked >= BLOCK_NUM_AGO_TILL_DISMISS) {
          updateTxBanner(transaction.txHash, {
            dismissed: true,
          });
        }
      }
    }
  }, [chainId, blockNum, transactionsMap]);

  // watches for transactions and updates banners
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
              if (receipt.status === 1) {
                const { metadata } = transaction;
                if (metadata.type === "split") {
                  const { yieldComponentToken, capitalComponentToken } = metadata.fullToken.componentTokens;
                  updateTxBanner(transaction.txHash, {
                    description: `${
                      formatTokenAmount(metadata.fullTokenAmount, metadata.fullToken).minimizedWithUnits
                    } combined from ${capitalComponentToken.symbol} and ${yieldComponentToken.symbol}`,
                    type: "success",
                  });
                }
                if (metadata.type === "combine") {
                  const { yieldComponentToken, capitalComponentToken } = metadata.fullToken.componentTokens;
                  updateTxBanner(transaction.txHash, {
                    description: `${
                      formatTokenAmount(metadata.componentTokenAmount, capitalComponentToken).minimized
                    } ${capitalComponentToken.symbol} and ${yieldComponentToken.symbol} obtained from ${
                      metadata.fullToken.symbol
                    }`,
                    type: "success",
                  });
                }
                if (metadata.type === "withdraw") {
                  updateTxBanner(transaction.txHash, {
                    description: `${
                      formatTokenAmount(metadata.widthdrawTokenAmount, metadata.withdrawToken).minimizedWithUnits
                    } withdrawn`,
                    type: "success",
                  });
                }
                if (metadata.type === "approve") {
                  updateTxBanner(transaction.txHash, {
                    description: `approved ${metadata.token.symbol}`,
                    type: "success",
                  });
                }
              } else {
                updateTxBanner(transaction.txHash, {
                  description: "Transaction failed",
                  type: "error",
                });
              }
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
    (txHash: string, metadata?: TransactionMetadata) => {
      // do not add a tx if already in the map
      if (!!transactionsMap[txHash]) {
        return;
      }

      setTransactionsMap(draft => {
        draft[txHash] = {
          txHash,
          metadata,
          status: "in-progress",
          chainId,
        };
      });

      if (metadata.type === "combine") {
        const { yieldComponentToken, capitalComponentToken } = metadata.fullToken.componentTokens;
        addPendingTxBanner(
          txHash,
          `combining ${formatTokenAmount(metadata.componentTokenAmount, capitalComponentToken).minimized} ${
            capitalComponentToken.symbol
          } and ${yieldComponentToken.symbol} into ${metadata.fullToken.symbol}`,
        );
      }

      if (metadata.type === "split") {
        const { yieldComponentToken, capitalComponentToken } = metadata.fullToken.componentTokens;
        addPendingTxBanner(
          txHash,
          `splitting ${formatTokenAmount(metadata.fullTokenAmount, metadata.fullToken).minimized} ${
            metadata.fullToken.symbol
          } into ${capitalComponentToken.symbol} and ${yieldComponentToken.symbol}`,
        );
      }

      if (metadata.type === "withdraw") {
        addPendingTxBanner(
          txHash,
          `withdrawing ${formatTokenAmount(metadata.widthdrawTokenAmount, metadata.withdrawToken).minimizedWithUnits}`,
        );
      }

      if (metadata.type === "approve") {
        addPendingTxBanner(txHash, `approving ${metadata.token.symbol}`);
      }
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
