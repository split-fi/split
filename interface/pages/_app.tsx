import React from "react";
import App from "next/app";
import styled from "styled-components";
import { Web3ReactProvider } from "@web3-react/core";
import { ethers } from "ethers";
import { ThemedGlobalStyle } from "../theme";
import { AppModalProvider } from "../contexts/modal";
import { Web3ConnectionProvider } from "../contexts/web3-connection";
import { Modals } from "../components/modals";
import { ChainWatcherProvider } from "../contexts/chain-watcher";
import { AssetBalancesProvider } from "../contexts/asset-balances";
import { FullTokenPricesProvider } from "../contexts/full-token-prices";
import { SplitProtocolAddressesProvider } from "../contexts/split-addresses";
import { TokensProvider } from "../contexts/tokens";
import { AssetAllowancesProvider } from "../contexts/asset-allowances";

const AppWrapper = styled.div``;

const getLibrary = (provider: any) => {
  const library = new ethers.providers.Web3Provider(provider);
  library.pollingInterval = 15000;
  return library;
};

export default class SplitApp extends App {
  render() {
    const { Component, pageProps } = this.props;

    const { err } = this.props as any;
    const modifiedPageProps = { ...pageProps, err };
    return (
      <>
        <ThemedGlobalStyle />
        <AppWrapper>
          <AppModalProvider>
            <Web3ReactProvider getLibrary={getLibrary}>
              <Web3ConnectionProvider>
                <ChainWatcherProvider>
                  <SplitProtocolAddressesProvider>
                    <TokensProvider>
                      <AssetBalancesProvider>
                        <AssetAllowancesProvider>
                          <FullTokenPricesProvider>
                            <Modals />
                            <Component {...modifiedPageProps} />
                          </FullTokenPricesProvider>
                        </AssetAllowancesProvider>
                      </AssetBalancesProvider>
                    </TokensProvider>
                  </SplitProtocolAddressesProvider>
                </ChainWatcherProvider>
              </Web3ConnectionProvider>
            </Web3ReactProvider>
          </AppModalProvider>
        </AppWrapper>
      </>
    );
  }
}
