import { AbstractConnector } from "@web3-react/abstract-connector";
import { UnsupportedChainIdError, useWeb3React } from "@web3-react/core";
import { WalletConnectConnector } from "@web3-react/walletconnect-connector";
import React, { useEffect, useState } from "react";
import { isMobile } from "react-device-detect";
// TODO(dave4506) add google analytics
// import ReactGA from 'react-ga'
import styled from "styled-components";
import { usePrevious, useMountedState } from "react-use";
import { MetaMaskIcon } from "../../icons/metamask";
import { fortmatic, injected, portis } from "../../../connectors";
import { OVERLAY_READY } from "../../../connectors/Fortmatic";
import { SUPPORTED_WALLETS } from "../../../constants";
import AccountDetails from "../../account-details";

import { Modal } from "../common";
import Option from "./Option";
import PendingView from "./PendingView";
import { useModalState, useModalStateActions } from "../../../contexts/modal";
import { AppModal } from "../../../types/app";
import { ArrowLeft, ArrowUpLeft, X } from "react-feather";
import { H1, H3, H3Dark, LargeDisplayTextDark, P, PDark } from "../../typography";

const BackIcon = styled.div`
  cursor: pointer;
  position: absolute;
  left: 1rem;
  top: 1rem;
  &:hover {
    cursor: pointer;
    opacity: 0.6;
  }
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

const ModalContentWrapper = styled.div`
  ${({ theme }) => theme.flexColumnNoWrap}
  margin: 0;
  padding: 0;
  width: 100%;
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  padding: 1rem 1rem;
`;

const GroupingRow = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
`;

const ErrorContentWrapper = styled.div`
  width: 280px;
  padding: 48px 0;
`;

const ConnectWalletContentWrapper = styled.div`
  width: 280px;
  padding: 48px 0 24px 0;
`;

const ContentWrapper = styled.div`
  position: relative;
`;

const OptionGrid = styled.div`
  display: grid;
  grid-gap: 1rem;
  width: 280px;
  padding-bottom: 64px;
`;

const WALLET_VIEWS = {
  OPTIONS: "options",
  OPTIONS_SECONDARY: "options_secondary",
  ACCOUNT: "account",
  PENDING: "pending",
};

export default function WalletModal() {
  // important that these are destructed from the account-specific web3-react context
  const { active, account, connector, activate, error } = useWeb3React();

  const [walletView, setWalletView] = useState(WALLET_VIEWS.ACCOUNT);

  const [pendingWallet, setPendingWallet] = useState<AbstractConnector | undefined>();

  const [pendingError, setPendingError] = useState<boolean>();

  const walletModalOpen = useModalState(AppModal.WALLET);

  const { closeModal } = useModalStateActions(AppModal.WALLET);

  const previousAccount = usePrevious(account);

  // close on connection, when logged out before
  useEffect(() => {
    if (account && !previousAccount && walletModalOpen) {
      closeModal();
    }
  }, [account, previousAccount, closeModal, walletModalOpen]);

  // always reset to account view
  useEffect(() => {
    if (walletModalOpen) {
      setPendingError(false);
      setWalletView(WALLET_VIEWS.ACCOUNT);
    }
  }, [walletModalOpen]);

  // close modal when a connection is successful
  const activePrevious = usePrevious(active);
  const connectorPrevious = usePrevious(connector);
  useEffect(() => {
    if (walletModalOpen && ((active && !activePrevious) || (connector && connector !== connectorPrevious && !error))) {
      setWalletView(WALLET_VIEWS.ACCOUNT);
    }
  }, [setWalletView, active, error, connector, walletModalOpen, activePrevious, connectorPrevious]);

  const tryActivation = async (connector: AbstractConnector | undefined) => {
    let name = "";
    Object.keys(SUPPORTED_WALLETS).map(key => {
      if (connector === SUPPORTED_WALLETS[key].connector) {
        return (name = SUPPORTED_WALLETS[key].name);
      }
      return true;
    });
    // log selected wallet
    // ReactGA.event({
    //   category: 'Wallet',
    //   action: 'Change Wallet',
    //   label: name
    // })
    setPendingWallet(connector); // set wallet for pending view
    setWalletView(WALLET_VIEWS.PENDING);

    // if the connector is walletconnect and the user has already tried to connect, manually reset the connector
    if (connector instanceof WalletConnectConnector && connector.walletConnectProvider?.wc?.uri) {
      connector.walletConnectProvider = undefined;
    }

    connector &&
      activate(connector, undefined, true).catch(error => {
        if (error instanceof UnsupportedChainIdError) {
          activate(connector); // a little janky...can't use setError because the connector isn't set
        } else {
          setPendingError(true);
        }
      });
  };

  // close wallet modal if fortmatic modal is active
  useEffect(() => {
    fortmatic.on(OVERLAY_READY, () => {
      closeModal();
    });

    return () => {
      fortmatic.removeAllListeners();
    };
  }, [closeModal]);

  // get wallets user can switch too, depending on device/browser
  function getOptions() {
    const isMetamask = window.ethereum && (window.ethereum as any).isMetaMask;
    return Object.keys(SUPPORTED_WALLETS).map(key => {
      const option = SUPPORTED_WALLETS[key];
      // check for mobile options
      if (isMobile) {
        //disable portis on mobile for now
        if (option.connector === portis) {
          return null;
        }

        if (!window.ethereum && option.mobile) {
          return (
            <Option
              onClick={() => {
                option.connector !== connector && !option.href && tryActivation(option.connector);
              }}
              id={`connect-${key}`}
              key={key}
              active={option.connector && option.connector === connector}
              color={option.color}
              link={option.href}
              header={option.name}
              subheader={null}
              icon={option.icon}
            />
          );
        }
        return null;
      }

      // overwrite injected when needed
      if (option.connector === injected) {
        // don't show injected if there's no injected provider
        if (!window.ethereum) {
          if (option.name === "MetaMask") {
            return (
              <Option
                id={`connect-${key}`}
                key={key}
                color={"#E8831D"}
                header={"Install Metamask"}
                subheader={null}
                link={"https://metamask.io/"}
                icon={MetaMaskIcon}
              />
            );
          } else {
            return null; //dont want to return install twice
          }
        }
        // don't return metamask if injected provider isn't metamask
        else if (option.name === "MetaMask" && !isMetamask) {
          return null;
        }
        // likewise for generic
        else if (option.name === "Injected" && isMetamask) {
          return null;
        }
      }

      // return rest of options
      return (
        !isMobile &&
        !option.mobileOnly && (
          <Option
            id={`connect-${key}`}
            onClick={() => {
              option.connector === connector
                ? setWalletView(WALLET_VIEWS.ACCOUNT)
                : !option.href && tryActivation(option.connector);
            }}
            key={key}
            active={option.connector === connector}
            color={option.color}
            link={option.href}
            header={option.name}
            subheader={null} //use option.descriptio to bring back multi-line
            icon={option.icon}
          />
        )
      );
    });
  }

  function getModalContent() {
    const isMounted = useMountedState();
    if (error) {
      return (
        <ContentWrapper>
          <CloseIcon onClick={closeModal}>
            <X color={"#000000"} />
          </CloseIcon>
          <GroupingRow>
            <ErrorContentWrapper>
              <LargeDisplayTextDark style={{ textAlign: "center" }}>{"Oops!"}</LargeDisplayTextDark>
              <PDark style={{ textAlign: "center" }}>
                {error instanceof UnsupportedChainIdError
                  ? "Please connect to the appropriate Ethereum network."
                  : "Error connecting. Try refreshing."}
              </PDark>
            </ErrorContentWrapper>
          </GroupingRow>
        </ContentWrapper>
      );
    }
    if (account && walletView === WALLET_VIEWS.ACCOUNT) {
      return (
        <AccountDetails
          toggleWalletModal={closeModal}
          openOptions={() => setWalletView(WALLET_VIEWS.OPTIONS)}
        />
      );
    }
    if (true) {
      return <ContentWrapper>
        {walletView !== WALLET_VIEWS.ACCOUNT && (
          <BackIcon
            onClick={() => {
              setPendingError(false);
              setWalletView(WALLET_VIEWS.ACCOUNT);
            }}
          >
            <ArrowLeft color="#000000" size={22} />
          </BackIcon>
        )}
        <CloseIcon onClick={closeModal}>
          <X color="#000000" />
        </CloseIcon>
        <GroupingRow>
          <div style={{padding: '54px 0'}}>
            <LargeDisplayTextDark style={{ textAlign: "center" }}>{"Initializing..."}</LargeDisplayTextDark>
          </div>
        </GroupingRow>
        <GroupingRow>
        </GroupingRow>
      </ContentWrapper>;
    }
    return (
      <ContentWrapper>
        {walletView !== WALLET_VIEWS.ACCOUNT && (
          <BackIcon
            onClick={() => {
              setPendingError(false);
              setWalletView(WALLET_VIEWS.ACCOUNT);
            }}
          >
            <ArrowLeft color="#000000" size={22} />
          </BackIcon>
        )}
        <CloseIcon onClick={closeModal}>
          <X color="#000000" />
        </CloseIcon>
        <GroupingRow>
          <ConnectWalletContentWrapper>
            <LargeDisplayTextDark style={{ textAlign: "center" }}>{"Connect to a wallet"}</LargeDisplayTextDark>
          </ConnectWalletContentWrapper>
        </GroupingRow>
        <GroupingRow>{isMounted() && <OptionGrid>{getOptions()}</OptionGrid>}</GroupingRow>
      </ContentWrapper>
    );
  }

  return (
    <Modal isOpen={walletModalOpen} onDismiss={closeModal} minHeight={false} maxHeight={90}>
      <ModalContentWrapper>{getModalContent()}</ModalContentWrapper>
    </Modal>
  );
}
