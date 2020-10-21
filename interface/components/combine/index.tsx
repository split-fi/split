import React, { useCallback, useState } from "react";
import styled from "styled-components";

import { ChainId } from "../../types/ethereum";
import { PrimaryButton } from "../button";
import { getEtherscanLink } from "../../utils/etherscan";
import { useWeb3React } from "@web3-react/core";

export interface CombineWidgetProps {}

export const CombineWidget: React.FC<CombineWidgetProps> = () => {
  const { active, error } = useWeb3React();

  if (!active || error) {
    return <div>Please connect your wallet.</div>;
  }

  return <div>Combine Widget</div>;
};
