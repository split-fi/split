import React, { useCallback, useState } from "react";
import styled from "styled-components";

import { useSplitVault } from "../../hooks/contracts";
import { useFullTokens } from "../../contexts/tokens";
import { useAssetAllowance } from "../../contexts/asset-allowances";
import { useTokenContract } from "../../hooks/contracts";
import { useFullTokenPrice } from "../../contexts/full-token-prices";
import { useSplitProtocolAddresses } from "../../contexts/split-addresses";
import { MAX_INT_256 } from "../../constants";

import { componentTokenAmountToFullTokenAmount, convertToBaseAmount } from "../../utils/number";

import { TokenInput } from "../input";
import { H1 } from "../typography";
import { Dropdown } from "../dropdown";
import { ConfirmButton, InputContainer } from "../widget";

const SplitContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

export interface SplitProps {}

export const SplitWidget: React.FC<SplitProps> = () => {
  const { splitVault } = useSplitVault();
  const tokens = useFullTokens();
  const [selectedTokenIndex, setSelectedTokenIndex] = useState(0);
  const [value, setValue] = useState<string>("");
  const selectedToken = tokens[selectedTokenIndex];
  const price = useFullTokenPrice(selectedToken.tokenAddress);
  const allowance = useAssetAllowance(selectedToken.tokenAddress);
  const tokenContract = useTokenContract(selectedToken.tokenAddress);
  const deployment = useSplitProtocolAddresses();
  const baseAmount = convertToBaseAmount(value || "0", selectedToken.decimals);

  const onSplitClick = useCallback(async () => {
    if (allowance.lessThan(baseAmount)) {
      await tokenContract.approve(deployment.splitVaultAddress, MAX_INT_256);
    }
    await splitVault.split(baseAmount.toString(), selectedToken.tokenAddress);
  }, [value, splitVault, selectedToken, deployment]);

  if (!tokens || !tokens.length || !price) {
    return <div>Please connect your wallet.</div>;
  }

  const dropdownItems = tokens.map(asset => ({
    id: asset.tokenAddress,
    displayName: asset.symbol,
  }));

  // The price from the price oracle is scaled by 18 decimal places.
  const componentTokenValue = componentTokenAmountToFullTokenAmount(baseAmount, price).toDecimalPlaces(4).toString();
  return (
    <SplitContainer>
      <InputContainer>
        <H1>split</H1>
        <TokenInput tokenAddress={selectedToken.tokenAddress} value={value} onChange={setValue} />
        <Dropdown items={dropdownItems} selectedId={selectedToken.tokenAddress} onSelectIndex={setSelectedTokenIndex} />
        <H1>to get</H1>
        <H1>{componentTokenValue}</H1>
        <H1>{selectedToken.componentTokens.capitalComponentToken.symbol}</H1>
        <H1>and</H1>
        <H1>{componentTokenValue}</H1>
        <H1>{selectedToken.componentTokens.yieldComponentToken.symbol}</H1>
      </InputContainer>
      <ConfirmButton disabled={value === "" || value === "0"} onClick={onSplitClick}>
        Split
      </ConfirmButton>
    </SplitContainer>
  );
};
