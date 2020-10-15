import React from 'react';
import App from 'next/app';
import styled from 'styled-components';
import { ThemedGlobalStyle } from '../../theme';

const AppWrapper = styled.div`

`;

export default class SplitApp extends App {
  render() {
    const { Component, pageProps } = this.props;

    const { err } = this.props as any;
    const modifiedPageProps = { ...pageProps, err };
    return (
      <>
        <ThemedGlobalStyle/>
        <AppWrapper>
            <Component
            {...modifiedPageProps}
            />
        </AppWrapper>
      </>
    );
  }
}
