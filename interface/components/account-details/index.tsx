import React, { useCallback, useContext } from "react";
import styled, { ThemeContext } from "styled-components";
import Link from "next/link";
import { shortenAddress } from "../../utils/address";
// import Copy from './Copy'
// import Transaction from './Transaction'

import { SUPPORTED_WALLETS } from "../../constants";
import { getEtherscanLink } from "../../utils/etherscan";
import { injected, walletconnect, walletlink, fortmatic, portis } from "../../connectors";
import { WalletConnectIcon } from "../icons/wallet-connect";
import { FortmaticIcon } from "../icons/fortmatic";
import { SecondaryDarkButton } from "../button";
import { ArrowRightIcon } from "../icons/arrow-right";
import { H1, H3, P, PDark, Faded, FadedDark, LargeDisplayTextDark } from "../typography";
import { useWeb3React } from "@web3-react/core";
import { X } from "react-feather";
import { useENSLookup } from "../../hooks/useENS";
import { TxTable } from "../tables/transactions";
import { useTransactionsMap } from "../../contexts/transaction";
import { isEmpty } from "lodash";

const HeaderRow = styled.div`
  padding: 16px;
`;

interface DisplayAddressProps {
  isActive?: boolean;
}

const TxTableWrapper = styled.div`
  width: 280px;
  padding-bottom: 52px;
`;

const AccountDetailsWrapper = styled.div`
  position: relative;
`;

const AccountGroupingRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
`;

const AccountHeaderWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 36px 0 24px 0;
  width: 280px;
`;

const AccountSection = styled.div`
  padding: 0rem 1rem;
`;

const YourAccount = styled.div``;

const AccountActionsWrapper = styled.div`
  display: grid;
  width: 280px;
  grid-template-columns: 1fr;
  grid-gap: 12px;
  padding: 12px 0 36px 0;
`;

const CloseIcon = styled.div`
  position: absolute;
  right: 1rem;
  top: 1rem;
  &:hover {
    cursor: pointer;
    opacity: 0.6;
  }
`;

const WalletName = styled.div`
  width: initial;
  font-size: 14px;
  font-weight: 500;
  color: #000000;
`;

const TxTableTitle = styled(P)`
  font-size: 16px;
  font-weight: 600;
  color: black;
  padding-bottom: 8px;
`;

const TxTableSpacer = styled.div`
  height: 24px;
  width: 100%;
`;

interface AccountDetailsProps {
  toggleWalletModal: () => void;
  openOptions: () => void;
}

export default function AccountDetails({
  toggleWalletModal,
  openOptions,
}: AccountDetailsProps) {
  const { chainId, account, connector } = useWeb3React();
  const theme = useContext(ThemeContext);
  const ENSName = useENSLookup(account);
  const txMap = useTransactionsMap();

  function formatConnectorName() {
    const { ethereum } = window;
    const isMetaMask = !!(ethereum && (ethereum as any).isMetaMask);
    const name = Object.keys(SUPPORTED_WALLETS)
      .filter(
        k =>
          SUPPORTED_WALLETS[k].connector === connector && (connector !== injected || isMetaMask === (k === "METAMASK")),
      )
      .map(k => SUPPORTED_WALLETS[k].name)[0];
    return <WalletName>Connected with {name}</WalletName>;
  }

  const clearAllTransactionsCallback = useCallback(() => {}, []);

  return (
    <AccountDetailsWrapper>
      <CloseIcon onClick={toggleWalletModal}>
        <X color={"#000000"} />
      </CloseIcon>
      <HeaderRow />
      <AccountSection>
        <YourAccount>
          <AccountGroupingRow>
            <AccountHeaderWrapper id="web3-account-identifier-row">
              {ENSName ? (
                <>
                  <div>
                    <LargeDisplayTextDark>{ENSName}</LargeDisplayTextDark>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <LargeDisplayTextDark>{account && shortenAddress(account)}</LargeDisplayTextDark>
                  </div>
                </>
              )}
              {formatConnectorName()}
            </AccountHeaderWrapper>
          </AccountGroupingRow>
          <AccountGroupingRow>
            <AccountActionsWrapper>
              <SecondaryDarkButton
                onClick={() => {
                  openOptions();
                }}
              >
                Change
              </SecondaryDarkButton>
              <Link href={chainId && getEtherscanLink(chainId, account, "address")}>
                <SecondaryDarkButton>Etherscan</SecondaryDarkButton>
              </Link>
              {connector !== injected && connector !== walletlink && (
                <SecondaryDarkButton
                  onClick={() => {
                    (connector as any).close();
                  }}
                >
                  Disconnect
                </SecondaryDarkButton>
              )}
            </AccountActionsWrapper>
          </AccountGroupingRow>
          <AccountGroupingRow>
            {!isEmpty(txMap) && (
              <TxTableWrapper>
                <TxTableTitle>Transactions</TxTableTitle>
                <TxTable />
              </TxTableWrapper>
            )}
            {isEmpty(txMap) && <TxTableSpacer />}
          </AccountGroupingRow>
        </YourAccount>
      </AccountSection>
    </AccountDetailsWrapper>
  );
}
