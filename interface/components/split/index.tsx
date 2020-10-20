import React, { useCallback, useState } from "react";
import styled from "styled-components";

import { ChainId } from "../../types/ethereum";
import { PrimaryButton } from "../button";
import { getEtherscanLink } from "../../utils/etherscan";
import { useSplitVault } from "../../hooks/useSplitVault";

import { Input } from "../input";

const SplitButton = styled(PrimaryButton)`
  cursor: pointer;
`;

export interface SplitProps {}

export const SplitWidget: React.FC<SplitProps> = () => {
  const { splitVault, active, error } = useSplitVault();
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

  return (
    <div>
      <Input max="1324523" value={value} onChange={setValue} />
      {txHash && getEtherscanLink(ChainId.Rinkeby, txHash, "transaction")}
      <SplitButton onClick={onSplitClick}>Split</SplitButton>
    </div>
  );
};
