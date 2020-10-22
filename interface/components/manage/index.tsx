import React, { useCallback, useMemo, useState } from "react";
import styled from "styled-components";

import { useWeb3React } from "@web3-react/core";
import { H1 } from "../typography";
import { useAssetBalances } from "../../contexts/asset-balances";
import { AssetsTable } from "../tables/assets";

const TableH1 = styled(H1)`
  margin-bottom: 24px;
`;

const ManagePageWrapper = styled.div`
  display: grid;
  grid-template-columns: 3fr 5fr;
  grid-gap: 72px;
  width: 1024px;
`;

const ManageColumnContainer = styled.div``;

export interface ManageWidgetProps {}

export const ManageWidget: React.FC<ManageWidgetProps> = () => {
  const { active, error } = useWeb3React();
  
  if (!active || error) {
    return <div>Please connect your wallet.</div>;
  }

  return (
    <ManagePageWrapper>
      <ManageColumnContainer>
        <TableH1>capital</TableH1>
        <AssetsTable filter="capital-split" />
      </ManageColumnContainer>
      <ManageColumnContainer>
        <TableH1>yield</TableH1>
        <AssetsTable filter="yield-split" />
      </ManageColumnContainer>
    </ManagePageWrapper>
  );
};
