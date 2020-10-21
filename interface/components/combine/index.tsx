import React, { useCallback, useState } from "react";
import styled from "styled-components";

import { useSplitVault } from "../../hooks/contracts";
import { useFullTokens } from "../../contexts/tokens";
import { useFullTokenPrice } from "../../contexts/full-token-prices";
import { useSplitProtocolAddresses } from "../../contexts/split-addresses";

import { convertToBaseAmount, fullTokenAmountToComponentTokenAmount } from "../../utils/number";

import { ConfirmButton, InputContainer, InputLabel, TokenDropdown } from "../widget";
import { TokenInput } from "../input";

const CombineButton = styled(ConfirmButton)`
  font-size: 32px;
`;

const CombineContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

export interface CombineWidgetProps {}

export const CombineWidget: React.FC<CombineWidgetProps> = () => {
  const { splitVault } = useSplitVault();
  const tokens = useFullTokens();
  const [selectedTokenIndex, setSelectedTokenIndex] = useState(0);
  const [value, setValue] = useState<string>("");
  const selectedToken = tokens[selectedTokenIndex];
  const price = useFullTokenPrice(selectedToken.tokenAddress);
  const deployment = useSplitProtocolAddresses();
  const baseAmount = convertToBaseAmount(value || "0", selectedToken.componentTokens.yieldComponentToken.decimals);

  const onCombineClick = useCallback(async () => {
    // No allowance needed for combining
    await splitVault.combine(baseAmount.toString(), selectedToken.tokenAddress);
  }, [value, splitVault, selectedToken, deployment]);

  if (!tokens || !tokens.length || !price) {
    return <div>Please connect your wallet.</div>;
  }

  const dropdownItems = tokens.map(asset => ({
    id: asset.tokenAddress,
    displayName: asset.symbol,
  }));

  const fullTokenValue = fullTokenAmountToComponentTokenAmount(baseAmount, price).toDecimalPlaces(4).toString();
  return (
    <CombineContainer>
      <InputContainer>
        <InputLabel>combine</InputLabel>
        <TokenInput
          tokenAddress={selectedToken.componentTokens.capitalComponentToken.tokenAddress}
          value={value}
          onChange={setValue}
        />
        <InputLabel>{selectedToken.componentTokens.capitalComponentToken.symbol}</InputLabel>
      </InputContainer>
      <InputContainer>
        <InputLabel>and</InputLabel>
        <TokenInput
          tokenAddress={selectedToken.componentTokens.yieldComponentToken.tokenAddress}
          value={value}
          onChange={setValue}
        />
        <InputLabel>{selectedToken.componentTokens.yieldComponentToken.symbol}</InputLabel>
      </InputContainer>
      <InputContainer>
        <InputLabel>to get</InputLabel>
        <InputLabel>{fullTokenValue}</InputLabel>
        <TokenDropdown
          items={dropdownItems}
          selectedId={selectedToken.tokenAddress}
          onSelectIndex={setSelectedTokenIndex}
        />
      </InputContainer>
      <CombineButton disabled={value === "" || value === "0"} onClick={onCombineClick}>
        Combine
      </CombineButton>
    </CombineContainer>
  );
};
