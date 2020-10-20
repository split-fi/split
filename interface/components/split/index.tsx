import React, { useCallback, useState } from "react";
import styled from "styled-components";

import { ChainId } from "../../types/ethereum";
import { PrimaryButton } from "../button";
import { getEtherscanLink } from "../../utils/etherscan";
import { useSplitVault } from "../../hooks/useSplitVault";
import { useFullTokens } from "../../contexts/tokens";
import { useAssetAllowance } from "../../contexts/asset-allowances";
import { useAssetBalance } from "../../contexts/asset-balances";
import { convertToUnitAmount } from "../../utils/number";

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
  padding: 15px;
`;

const TokenDropdown = styled(Dropdown)`
  padding: 15px;
`;

export interface SplitProps {}

export const SplitWidget: React.FC<SplitProps> = () => {
  const { splitVault, active, error } = useSplitVault();
  const tokens = useFullTokens();
  const [selectedTokenIndex, setSelectedTokenIndex] = useState(0);
  const [value, setValue] = useState<string>("");
  const selectedToken = tokens[selectedTokenIndex];

  if (!tokens || !tokens.length) {
    return null;
  }

  const onSplitClick = useCallback(async () => {
    const tx = await splitVault.split("4040020000", selectedToken.tokenAddress);
  }, [splitVault]);

  if (!active || error) {
    // TODO(fragosti): how do we deal with these.
    return <div>An error occured</div>;
  }

  const dropdownItems = tokens.map(asset => ({
    id: asset.tokenAddress,
    displayName: asset.symbol,
  }));
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
        <InputLabel>{value}</InputLabel>
        <InputLabel>{selectedToken.componentTokens.capitalComponentToken.symbol}</InputLabel>
      </InputContainer>
      <InputContainer>
        <InputLabel>and</InputLabel>
        <InputLabel>{value}</InputLabel>
        <InputLabel>{selectedToken.componentTokens.yieldComponentToken.symbol}</InputLabel>
      </InputContainer>
      <SplitButton onClick={onSplitClick}>Split</SplitButton>
    </SplitContainer>
  );
};
