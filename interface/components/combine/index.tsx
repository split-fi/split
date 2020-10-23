import React, { useCallback, useState } from "react";
import styled from "styled-components";

import { useSplitVault } from "../../hooks/contracts";
import { useFullTokens } from "../../contexts/tokens";
import { useFullTokenPrice } from "../../contexts/full-token-prices";
import { useSplitProtocolAddresses } from "../../contexts/split-addresses";

import {
  componentTokenAmountToFullTokenAmount,
  convertToBaseAmount,
  fullTokenAmountToComponentTokenAmount,
} from "../../utils/number";

import { H1 } from "../typography";
import { Dropdown } from "../dropdown";
import { ConfirmButton, InputContainer } from "../widget";
import { TokenInput } from "../input";
import { useTransactionActions } from "../../contexts/transaction";

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
  const { addTransaction } = useTransactionActions();
  const [value, setValue] = useState<string>("");
  const selectedToken = tokens[selectedTokenIndex];
  const price = useFullTokenPrice(selectedToken.tokenAddress);
  const deployment = useSplitProtocolAddresses();
  const baseAmount = convertToBaseAmount(value || "0", selectedToken.componentTokens.yieldComponentToken.decimals);

  const onCombineClick = useCallback(async () => {
    // No allowance needed for combining
    const tx = await splitVault.combine(baseAmount.toString(), selectedToken.tokenAddress);
    addTransaction(tx.hash, {
      fullToken: selectedToken,
      componentTokenAmount: baseAmount,
      type: "combine",
    });
    // TODO: clear input on success????
    setValue("");
  }, [value, splitVault, selectedToken, deployment]);

  if (!tokens || !tokens.length || !price) {
    return <div>Please connect your wallet.</div>;
  }

  const dropdownItems = tokens.map(asset => ({
    id: asset.tokenAddress,
    displayName: asset.symbol,
  }));

  const fullTokenValue = componentTokenAmountToFullTokenAmount(
    baseAmount,
    price,
    selectedToken.userlyingAssetMetaData.decimals,
  )
    .toDecimalPlaces(4)
    .toString();
  return (
    <CombineContainer>
      <InputContainer>
        <H1>combine</H1>
        <TokenInput
          tokenAddress={selectedToken.componentTokens.capitalComponentToken.tokenAddress}
          value={value}
          onChange={setValue}
        />
        <H1>{selectedToken.componentTokens.capitalComponentToken.symbol}</H1>
        <H1>and</H1>
        <TokenInput
          tokenAddress={selectedToken.componentTokens.yieldComponentToken.tokenAddress}
          value={value}
          onChange={setValue}
        />
        <H1>{selectedToken.componentTokens.yieldComponentToken.symbol}</H1>
        <H1>to get</H1>
        <H1>{fullTokenValue}</H1>
        <Dropdown items={dropdownItems} selectedId={selectedToken.tokenAddress} onSelectIndex={setSelectedTokenIndex} />
      </InputContainer>
      <CombineButton disabled={value === "" || value === "0"} onClick={onCombineClick}>
        Combine
      </CombineButton>
    </CombineContainer>
  );
};
