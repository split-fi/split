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
  const [txHash, setTxHash] = useState<string>("");
  const [value, setValue] = useState<string>("");
  const rinkebyCETH = "0xd6801a1dffcd0a410336ef88def4320d6df1883e";
  const onSplitClick = useCallback(async () => {
    const tx = await splitVault.split("4040020000", rinkebyCETH);
    setTxHash(tx.hash);
  }, [splitVault]);

  if (!active || error) {
    // TODO(fragosti): how do we deal with these.
    return <div>An error occured</div>;
  }

  // const dropdownItems = tokens.map(asset => ({
  //   id: asset.symbol,

  // }));

  return (
    <SplitContainer>
      <InputContainer>
        <InputLabel>split</InputLabel>
        <Input max="1324523" value={value} onChange={setValue} />
        <TokenDropdown />
      </InputContainer>
      <InputContainer>
        <InputLabel>to get</InputLabel>
        <InputLabel>{value}</InputLabel>
        <InputLabel>ccETH</InputLabel>
      </InputContainer>
      <InputContainer>
        <InputLabel>and</InputLabel>
        <InputLabel>{value}</InputLabel>
        <InputLabel>ycETH</InputLabel>
      </InputContainer>
      <SplitButton onClick={onSplitClick}>Split</SplitButton>
    </SplitContainer>
  );
};
