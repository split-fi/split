import React, { useCallback, useState } from "react";
import styled from "styled-components";

import { ChainId } from "../../types/ethereum";
import { PrimaryButton } from "../button";
import { getEtherscanLink } from "../../utils/etherscan";
import { useSplitVault } from "../../hooks/useSplitVault";
import { useFullTokens } from "../../contexts/tokens";

import { H1 } from "../typography";
import { Input } from "../input";
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
  margin: 15px 0px;
`;

const InputLabel = styled(H1)`
  padding: 10px;
`;

const TokenDropdown = styled(Dropdown)`
  padding: 10px;
`;

export interface SplitProps {}

export const SplitWidget: React.FC<SplitProps> = () => {
  const { splitVault, active, error } = useSplitVault();
  const tokens = useFullTokens();
  const [selectedTokenIndex, setSelectedTokenIndex] = useState(0);
  const [value, setValue] = useState<string>("");

  if (!tokens || !tokens.length) {
    return null;
  }

  const selectedToken = tokens[selectedTokenIndex];
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
        <Input max="1324523" value={value} onChange={setValue} />
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
