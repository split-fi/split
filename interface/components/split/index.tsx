import React, { useCallback, useState } from "react";
import styled from "styled-components";

import { useSplitVault } from "../../hooks/contracts";
import { useFullTokens } from "../../contexts/tokens";
import { useFullTokenPrice } from "../../contexts/full-token-prices";
import { convertToBaseAmount, convertToUnitAmount } from "../../utils/number";

import { PrimaryButton } from "../button";
import { H1 } from "../typography";
import { TokenInput } from "../input";
import { Dropdown } from "../dropdown";

const SplitButton = styled(PrimaryButton)`
  cursor: pointer;
  margin-top: 20px;
  border-radius: 50%;
  width: 200px;
  height: 200px;
  align-self: center;
  font-size: 40px;
`;

const SplitContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const InputContainer = styled.div`
  max-width: 800px;
  display: grid;
  grid-template-columns: 1fr 3fr 1fr;
  align-items: baseline;
  margin: 15px 0px;
`;

const InputLabel = styled(H1)`
  padding: 15px 0px;
`;

const TokenDropdown = styled(Dropdown)`
  padding: 15px 0px;
`;

export interface SplitProps {}

export const SplitWidget: React.FC<SplitProps> = () => {
  const { splitVault } = useSplitVault();
  const tokens = useFullTokens();
  const [selectedTokenIndex, setSelectedTokenIndex] = useState(0);
  const [value, setValue] = useState<string>("");
  const selectedToken = tokens[selectedTokenIndex];
  const price = useFullTokenPrice(selectedToken.tokenAddress);
  const onSplitClick = useCallback(async () => {
    const baseAmount = convertToBaseAmount(value, selectedToken.decimals);
    const txn = await splitVault.split(baseAmount.toString(), selectedToken.tokenAddress);
  }, [splitVault]);

  if (!tokens || !tokens.length || !price) {
    // TODO(fragosti): deal with this more gracefully
    return null;
  }

  const dropdownItems = tokens.map(asset => ({
    id: asset.tokenAddress,
    displayName: asset.symbol,
  }));

  // The price from the price oracle is scaled by 18 decimal places.
  const componentTokenValue = convertToUnitAmount(price.mul(value || 0), 28)
    .toDecimalPlaces(4)
    .toString();
  return (
    <SplitContainer>
      <InputContainer>
        <InputLabel>split</InputLabel>
        <TokenInput tokenAddress={selectedToken.tokenAddress} value={value} onChange={setValue} />
        <TokenDropdown
          items={dropdownItems}
          selectedId={selectedToken.tokenAddress}
          onSelectIndex={setSelectedTokenIndex}
        />
      </InputContainer>
      <InputContainer>
        <InputLabel>to get</InputLabel>
        <InputLabel>{componentTokenValue}</InputLabel>
        <InputLabel>{selectedToken.componentTokens.capitalComponentToken.symbol}</InputLabel>
      </InputContainer>
      <InputContainer>
        <InputLabel>and</InputLabel>
        <InputLabel>{componentTokenValue}</InputLabel>
        <InputLabel>{selectedToken.componentTokens.yieldComponentToken.symbol}</InputLabel>
      </InputContainer>
      <SplitButton disabled={value === "" || value === "0"} onClick={onSplitClick}>Split</SplitButton>
    </SplitContainer>
  );
};
