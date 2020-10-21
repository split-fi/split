import { AbstractConnector } from "@web3-react/abstract-connector";
import { MetaMaskIcon } from "../components/icons/metamask";
import { ArrowRightIcon } from "../components/icons/arrow-right";
import { WalletConnectIcon } from "../components/icons/wallet-connect";
import { FortmaticIcon } from "../components/icons/fortmatic";

import { fortmatic, injected, walletconnect } from "../connectors";
import { AppAction } from "../types/app";
import Decimal from "decimal.js";

export const MAX_INT_256 = "115792089237316195423570985008687907853269984665640564039457584007913129639935";
export const ZERO = new Decimal(0);

export const PATHS = {
  ROOT: "/",
  SPLIT: "/split",
};

// Only for deployed contracts.
export const CHAIN_ID_NAME = {
  1: "mainnet",
  4: "rinkeby",
};

export const APP_PARAM_TO_APP_ACTION = {
  split: AppAction.SPLIT,
  manage: AppAction.MANAGE,
  combine: AppAction.COMBINE,
};

export interface WalletInfo {
  connector?: AbstractConnector;
  name: string;
  icon: React.FC;
  description: string;
  href: string | null;
  color: string;
  primary?: true;
  mobile?: true;
  mobileOnly?: true;
}

export const SUPPORTED_WALLETS: { [key: string]: WalletInfo } = {
  INJECTED: {
    connector: injected,
    name: "Injected",
    icon: () => <ArrowRightIcon />,
    description: "Injected web3 provider.",
    href: null,
    color: "#010101",
    primary: true,
  },
  METAMASK: {
    connector: injected,
    name: "MetaMask",
    icon: () => <MetaMaskIcon />,
    description: "Easy-to-use browser extension.",
    href: null,
    color: "#E8831D",
  },
  WALLET_CONNECT: {
    connector: walletconnect,
    name: "WalletConnect",
    icon: () => <WalletConnectIcon />,
    description: "Connect to Trust Wallet, Rainbow Wallet and more...",
    href: null,
    color: "#4196FC",
    mobile: true,
  },
  // WALLET_LINK: {
  //   connector: walletlink,
  //   name: 'Coinbase Wallet',
  //   iconName: 'coinbaseWalletIcon.svg',
  //   description: 'Use Coinbase Wallet app on mobile device',
  //   href: null,
  //   color: '#315CF5'
  // },
  // COINBASE_LINK: {
  //   name: 'Open in Coinbase Wallet',
  //   iconName: 'coinbaseWalletIcon.svg',
  //   description: 'Open in Coinbase Wallet app.',
  //   href: 'https://go.cb-w.com/mtUDhEZPy1',
  //   color: '#315CF5',
  //   mobile: true,
  //   mobileOnly: true
  // },
  FORTMATIC: {
    connector: fortmatic,
    name: "Fortmatic",
    icon: () => <FortmaticIcon />,
    description: "Login using Fortmatic hosted wallet",
    href: null,
    color: "#6748FF",
    mobile: true,
  },
};

export const NETWORK_URL = process.env.NEXT_PUBLIC_NETWORK_URL || "";
export const CHAIN_ID = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID ?? "1") || 1;
