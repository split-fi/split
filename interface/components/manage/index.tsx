import React, { useCallback, useMemo, useState } from "react";
import styled from "styled-components";

import { ChainId } from "../../types/ethereum";
import { PrimaryButton } from "../button";
import { getEtherscanLink } from "../../utils/etherscan";
import { useWeb3React } from "@web3-react/core";
import { H1 } from "../typography";
import { PageWrapper } from "../content";
import { useAllTokens, useTokensByAssetType } from "../../contexts/tokens";
import { useAssetBalances } from "../../contexts/asset-balances";
import { AssetsTable, AssetWithMarketInfo } from "../tables/assets";
import { ZERO } from "../../constants";

export interface ManageWidgetProps {}

export const ManageWidget: React.FC<ManageWidgetProps> = () => {
  const { active, error } = useWeb3React();
  const allTokens = useAllTokens();
  const capitalTokens = useTokensByAssetType("capital-split");
  const yieldTokens = useTokensByAssetType("yield-split");
  const tokenBalances = useAssetBalances();

  const capitalTokensWithMarketInfo: AssetWithMarketInfo[] = useMemo(() => {
    return capitalTokens.map(t => {
      return {
        ...t,
        tokenAmount: tokenBalances[t.tokenAddress] ?? ZERO,
        redeemableTokenAmount: ZERO,
        redeemableAsset: t,
      };
    });
  }, [tokenBalances, capitalTokens]);

  const yieldTokensWithMarketInfo: AssetWithMarketInfo[] = useMemo(() => {
    return yieldTokens.map(t => {
      return {
        ...t,
        tokenAmount: tokenBalances[t.tokenAddress] ?? ZERO,
        redeemableTokenAmount: ZERO,
        redeemableAsset: t,
      };
    });
  }, [tokenBalances, yieldTokens]);

  if (!active || error) {
    return <div>Please connect your wallet.</div>;
  }

  return (
    <ManagePageWrapper>
      <ManageColumnContainer>
        <StyledH1>Capital</StyledH1>
        <AssetsTable tokens={capitalTokensWithMarketInfo} />
      </ManageColumnContainer>
      <ManageColumnContainer>
        <StyledH1>Yield</StyledH1>
        <AssetsTable tokens={yieldTokensWithMarketInfo} />
      </ManageColumnContainer>
      <ManageContentSpacer />
      <ManageContentSpacer />
    </ManagePageWrapper>
  );
};

const ManageContentSpacer = styled.div`
  height: 20vh;
  width: 100%;
`;

const StyledH1 = styled(H1)`
  margin-bottom: 24px;
`;

const ManagePageWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 1.4fr;
  grid-gap: 72px;
`;

const ManageColumnContainer = styled.div``;
