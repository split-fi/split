import React, { useCallback, useContext } from "react";
import styled, { ThemeContext } from "styled-components";
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
import { H1, H3, P, PDark, Faded, FadedDark } from "../typography";
import { useWeb3React } from "@web3-react/core";
import { X } from "react-feather";

const HeaderRow = styled.div`
  padding: 1rem 1rem;
`;

const StyledHeaderTitle = styled(H3)`
  color: #0e2991;
  text-transform: uppercase;
  font-weight: 700;
  font-size: 16px;
  letter-spacing: 0.05rem;
`;

const DisplayAddress = styled(H1)`
  color: black;
`;

const UpperSection = styled.div`
  position: relative;

  h5 {
    margin: 0;
    margin-bottom: 0.5rem;
    font-size: 1rem;
    font-weight: 400;
  }

  h5:last-child {
    margin-bottom: 0px;
  }

  h4 {
    margin-top: 0;
    font-weight: 500;
  }
`;

const InfoCard = styled.div`
  padding: 1rem;
  border: 2px solid rgba(0, 0, 0, 0.05);
  position: relative;
  display: grid;
  grid-row-gap: 12px;
  margin-bottom: 20px;
`;

const AccountGroupingRow = styled.div`
  ${({ theme }) => theme.flexRowNoWrap};
  justify-content: space-between;
  align-items: center;
  font-weight: 400;
  color: ${({ theme }) => theme.text1};

  div {
    ${({ theme }) => theme.flexRowNoWrap}
    align-items: center;
  }
`;

const AccountSection = styled.div`
  padding: 0rem 1rem;
`;

const YourAccount = styled.div``;

const LowerSection = styled.div`
  padding: 24px 16px;
  overflow: auto;
  background-color: rgba(0, 0, 0, 0.05);
  h5 {
    margin: 0;
    font-weight: 400;
    color: ${({ theme }) => theme.text3};
  }
`;

const AccountControl = styled.div`
  display: flex;
  justify-content: space-between;
  min-width: 0;
  width: 100%;

  font-weight: 500;
  font-size: 1.25rem;

  a:hover {
    text-decoration: underline;
  }

  p {
    min-width: 0;
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

const AccountActionsWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 1rem;
`;

// const AddressLink = styled(ExternalLink)<{ hasENS: boolean; isENS: boolean }>`
//   font-size: 0.825rem;
//   color: ${({ theme }) => theme.text3};
//   margin-left: 1rem;
//   font-size: 0.825rem;
//   display: flex;
//   :hover {
//     color: ${({ theme }) => theme.text2};
//   }
// `

const CloseIcon = styled.div`
  position: absolute;
  right: 1rem;
  top: 14px;
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

const IconWrapper = styled.div<{ size?: number }>`
  ${({ theme }) => theme.flexColumnNoWrap};
  align-items: center;
  justify-content: center;
  margin-right: 8px;
  & > img,
  span {
    height: ${({ size }) => (size ? size + "px" : "32px")};
    width: ${({ size }) => (size ? size + "px" : "32px")};
  }
`;

const TransactionListWrapper = styled.div`
  ${({ theme }) => theme.flexColumnNoWrap};
`;

// const WalletAction = styled(ButtonSecondary)`
//   width: fit-content;
//   font-weight: 400;
//   margin-left: 8px;
//   font-size: 0.825rem;
//   padding: 4px 6px;
//   :hover {
//     cursor: pointer;
//     text-decoration: underline;
//   }
// `

// const MainWalletAction = styled(WalletAction)`
//   color: ${({ theme }) => theme.primary1};
// `

// function renderTransactions(transactions: string[]) {
//   return (
//     <TransactionListWrapper>
//       {transactions.map((hash, i) => {
//         return <Transaction key={i} hash={hash} />
//       })}
//     </TransactionListWrapper>
//   )
// }

interface AccountDetailsProps {
  toggleWalletModal: () => void;
  pendingTransactions: string[];
  confirmedTransactions: string[];
  ENSName?: string;
  openOptions: () => void;
}

export default function AccountDetails({
  toggleWalletModal,
  pendingTransactions,
  confirmedTransactions,
  ENSName,
  openOptions,
}: AccountDetailsProps) {
  const { chainId, account, connector } = useWeb3React();
  const theme = useContext(ThemeContext);

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

  function getStatusIcon() {
    if (connector === injected) {
      return (
        <IconWrapper size={16}>
          <ArrowRightIcon />
        </IconWrapper>
      );
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

  const clearAllTransactionsCallback = useCallback(() => {}, []);

  return (
    <>
      <UpperSection>
        <CloseIcon onClick={toggleWalletModal}>
          <X color={"#000000"} />
        </CloseIcon>
        <HeaderRow>
          <StyledHeaderTitle>Account</StyledHeaderTitle>
        </HeaderRow>
        <AccountSection>
          <YourAccount>
            <InfoCard>
              <AccountGroupingRow id="web3-account-identifier-row">
                <AccountControl>
                  {ENSName ? (
                    <>
                      <div>
                        {getStatusIcon()}
                        <p> {ENSName}</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <DisplayAddress> {account && shortenAddress(account)}</DisplayAddress>
                      </div>
                    </>
                  )}
                </AccountControl>
                {formatConnectorName()}
              </AccountGroupingRow>
              <AccountGroupingRow>
                <AccountActionsWrapper>
                  {connector !== injected && connector !== walletlink && (
                    <SecondaryDarkButton
                      onClick={() => {
                        (connector as any).close();
                      }}
                    >
                      Disconnect
                    </SecondaryDarkButton>
                  )}
                  <SecondaryDarkButton
                    onClick={() => {
                      openOptions();
                    }}
                  >
                    Change
                  </SecondaryDarkButton>
                </AccountActionsWrapper>
              </AccountGroupingRow>
              {/* <AccountGroupingRow>
                {ENSName ? (
                  <>
                    <AccountControl>
                      <div>
                        {account && (
                          <Copy toCopy={account}>
                            <span style={{ marginLeft: '4px' }}>Copy Address</span>
                          </Copy>
                        )}
                        {chainId && account && (
                          <AddressLink
                            hasENS={!!ENSName}
                            isENS={true}
                            href={chainId && getEtherscanLink(chainId, ENSName, 'address')}
                          >
                            <LinkIcon size={16} />
                            <span style={{ marginLeft: '4px' }}>View on Etherscan</span>
                          </AddressLink>
                        )}
                      </div>
                    </AccountControl>
                  </>
                ) : (
                  <>
                    <AccountControl>
                      <div>
                        {account && (
                          <Copy toCopy={account}>
                            <span style={{ marginLeft: '4px' }}>Copy Address</span>
                          </Copy>
                        )}
                        {chainId && account && (
                          <AddressLink
                            hasENS={!!ENSName}
                            isENS={false}
                            href={getEtherscanLink(chainId, account, 'address')}
                          >
                            <LinkIcon size={16} />
                            <span style={{ marginLeft: '4px' }}>View on Etherscan</span>
                          </AddressLink>
                        )}
                      </div>
                    </AccountControl>
                  </>
                )}
                        </AccountGroupingRow> */}
            </InfoCard>
          </YourAccount>
        </AccountSection>
      </UpperSection>
      {!!pendingTransactions.length || !!confirmedTransactions.length ? (
        <LowerSection>
          {/* <AutoRow mb={'1rem'} style={{ justifyContent: 'space-between' }}>
            <TYPE.body>Recent Transactions</TYPE.body>
            <LinkStyledButton onClick={clearAllTransactionsCallback}>(clear all)</LinkStyledButton>
          </AutoRow>
          {renderTransactions(pendingTransactions)}
          {renderTransactions(confirmedTransactions)} */}
        </LowerSection>
      ) : (
        <LowerSection>
          <PDark>
            <FadedDark>Your transactions will appear here...</FadedDark>
          </PDark>
        </LowerSection>
      )}
    </>
  );
}
