import { AbstractConnector } from "@web3-react/abstract-connector";
import { UnsupportedChainIdError, useWeb3React } from "@web3-react/core";
import { darken, lighten } from "polished";
import React, { useMemo } from "react";
// import { Activity } from 'react-feather'
import styled, { css } from "styled-components";
import { WalletConnectIcon } from "./icons/wallet-connect";
import { FortmaticIcon } from "./icons/fortmatic";
import { fortmatic, injected, portis, walletconnect, walletlink } from "../connectors";
import { NetworkContextName } from "../hooks/wallet";
// import useENSName from '../../hooks/useENSName'
import { shortenAddress } from "../utils/address";
import { PrimaryButton } from "./button";
import { useModalStateActions } from "../contexts/modal";
import { AppModal } from "../types/app";

// import Identicon from '../Identicon'
// import Loader from '../Loader'

// import { RowBetween } from '../Row'

const IconWrapper = styled.div<{ size?: number }>`
  ${({ theme }) => theme.flexColumnNoWrap};
  align-items: center;
  justify-content: center;
  & > * {
    height: ${({ size }) => (size ? size + "px" : "32px")};
    width: ${({ size }) => (size ? size + "px" : "32px")};
  }
`;

const Web3StatusGeneric = styled(PrimaryButton)`
  cursor: pointer;
`;

const Web3StatusError = styled(Web3StatusGeneric)`
  background-color: ${({ theme }) => theme.red1};
  border: 1px solid ${({ theme }) => theme.red1};
  color: ${({ theme }) => theme.white};
  font-weight: 500;
  :hover,
  :focus {
  }
`;

const Web3StatusConnect = styled(Web3StatusGeneric)``;

const Web3StatusConnected = styled(Web3StatusGeneric)<{ pending?: boolean }>`
  background-color: ${({ pending, theme }) => (pending ? theme.primary1 : theme.bg2)};
  border: 1px solid ${({ pending, theme }) => (pending ? theme.primary1 : theme.bg3)};
  color: ${({ pending, theme }) => (pending ? theme.white : theme.text1)};
  font-weight: 500;
  :hover,
  :focus {
    :focus {
    }
  }
`;

const Text = styled.p`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 16px;
  font-weight: 500;
`;

// const NetworkIcon = styled(Activity)`
//   margin-left: 0.25rem;
//   margin-right: 0.5rem;
//   width: 16px;
//   height: 16px;
// `

// we want the latest one to come first, so return negative if a is after b
// function newTransactionsFirst(a: TransactionDetails, b: TransactionDetails) {
//   return b.addedTime - a.addedTime
// }

// eslint-disable-next-line react/prop-types
function StatusIcon({ connector }: { connector: AbstractConnector }) {
  if (connector === injected) {
    return <></>; // TODO
  } else if (connector === walletconnect) {
    return (
      <IconWrapper size={16}>
        <WalletConnectIcon />
      </IconWrapper>
    );
  } else if (connector === fortmatic) {
    return (
      <IconWrapper size={16}>
        <FortmaticIcon />
      </IconWrapper>
    );
  }
  return null;
}

function Web3StatusInner() {
  const { account, connector, error } = useWeb3React();

  // const { ENSName } = useENSName(account ?? undefined)

  // const allTransactions = useAllTransactions()

  // const sortedRecentTransactions = useMemo(() => {
  //   const txs = Object.values(allTransactions)
  //   return txs.filter(isTransactionRecent).sort(newTransactionsFirst)
  // }, [allTransactions])

  // const pending = sortedRecentTransactions.filter(tx => !tx.receipt).map(tx => tx.hash)

  // const hasPendingTransactions = !!pending.length
  const { openModal } = useModalStateActions(AppModal.WALLET);

  console.log("connector", connector);
  if (account) {
    return (
      <Web3StatusConnected id="web3-status-connected" onClick={openModal} pending={false}>
        {/* {hasPendingTransactions ? (
          <RowBetween>
            <Text>{pending?.length} Pending</Text> <Loader stroke="white" />
          </RowBetween>
        ) : (
          <>
            <Text>{ENSName || shortenAddress(account)}</Text>
          </>
        )} */}
        <>{shortenAddress(account)}</>
        {connector && <StatusIcon connector={connector} />}
      </Web3StatusConnected>
    );
  } else if (error) {
    return (
      <Web3StatusError onClick={openModal}>
        {/* <NetworkIcon /> */}
        <Text>{error instanceof UnsupportedChainIdError ? "Wrong Network" : "Error"}</Text>
      </Web3StatusError>
    );
  } else {
    return (
      <Web3StatusConnect id="connect-wallet" onClick={openModal}>
        Connect Wallet
      </Web3StatusConnect>
    );
  }
}

export default function Web3Status() {
  const { active, account } = useWeb3React();
  // const contextNetwork = useWeb3React()

  // const { ENSName } = useENSName(account ?? undefined)

  // const allTransactions = useAllTransactions()

  // const sortedRecentTransactions = useMemo(() => {
  //   const txs = Object.values(allTransactions)
  //   return txs.filter(isTransactionRecent).sort(newTransactionsFirst)
  // }, [allTransactions])

  // const pending = sortedRecentTransactions.filter(tx => !tx.receipt).map(tx => tx.hash)
  // const confirmed = sortedRecentTransactions.filter(tx => tx.receipt).map(tx => tx.hash)

  console.log("active", active, account);

  if (!active) {
    return null;
  }

  return (
    <>
      <Web3StatusInner />
    </>
  );
}
