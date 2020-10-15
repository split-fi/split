import React from 'react';
import App from 'next/app';
import styled from 'styled-components';
import { Web3ReactProvider } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';
import { ThemedGlobalStyle } from '../theme';

const AppWrapper = styled.div`

`;

const getLibrary = (provider: any) => {
    const library = new Web3Provider(provider);
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
        <ThemedGlobalStyle/>
        <AppWrapper>
            <Web3ReactProvider getLibrary={getLibrary}>
                <Component
                {...modifiedPageProps}
                />
            </Web3ReactProvider>
        </AppWrapper>
      </>
    );
  }
}
