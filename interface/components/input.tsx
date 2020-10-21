import React, { useCallback } from "react";
import Decimal from "decimal.js";
import styled, { css } from "styled-components";

import { colors } from "../theme";
import { useAssetAllowance } from "../contexts/asset-allowances";
import { useAssetBalance } from "../contexts/asset-balances";
import { useToken } from "../contexts/tokens";
import { convertToUnitAmount } from "../utils/number";

const SplitInput = styled.input<{ isError?: boolean }>`
  background: transparent;
  border: none;
  border-bottom: 2px solid white;
  outline: none;
  box-shadow: none;
  color: white;
  font-size: 40px;
  padding: 10px 0px;
  min-width: 250px;
  ${props =>
    props.isError &&
    css`
      color: ${colors.red};
      border-bottom: 2px solid ${colors.red} !important;
    `}
  &&:focus {
    font-style: italic;
    border-bottom: 3px solid white;
  }
`;

const InputContainer = styled.div<{ isDisabled: boolean }>`
  display: flex;
  flex-direction: column;
  ${props => (props.isDisabled ? "opacity: 0.6;" : "")}
`;

const Message = styled.label<{ isError?: boolean }>`
  margin: 10px 0px;
  font-weight: bold;
  ${props =>
    props.isError &&
    css`
      color: ${colors.red} !important;
    `}
`;

export interface InputProps {
  value: string;
  onChange: (value: string) => void;
  message?: string;
  errorMessage?: string;
  className?: string;
  maxLength?: number;
  isDisabled?: boolean;
}

export const Input: React.FC<InputProps> = props => {
  const { value, onChange, message, errorMessage, className, isDisabled, maxLength = 10 } = props;
  const innerOnChange = useCallback(
    (newValue: string, oldValue: string) => {
      if (newValue.length > maxLength) {
        onChange(oldValue);
        return;
      }
      onChange(newValue);
    },
    [onChange, maxLength],
  );
  const isError = !!errorMessage;
  return (
    <InputContainer isDisabled={isDisabled}>
      <SplitInput
        disabled={isDisabled}
        isError={isError}
        className={className}
        min="0"
        type="number"
        value={value}
        onChange={e => innerOnChange(e.target.value, value)}
      />
      {!isError && message && <Message>{message}</Message>}
      {isError && <Message isError={true}>{errorMessage}</Message>}
    </InputContainer>
  );
};

export interface TokenInputProps {
  tokenAddress: string;
  value: string;
  onChange: (value: string) => void;
}

export const TokenInput: React.FC<TokenInputProps> = ({ tokenAddress, value, onChange }) => {
  const tokenBalance = useAssetBalance(tokenAddress);
  const token = useToken(tokenAddress);
  let errorMsg = "";
  const unitTokenBalance = convertToUnitAmount(tokenBalance, token.decimals);
  const decimalValue = new Decimal(value || "0");
  if (unitTokenBalance.lessThan(decimalValue)) {
    errorMsg = `you don't have enough ${token.symbol}`;
  }
  const maxString = unitTokenBalance.toString();
  return (
    <Input value={value} onChange={onChange} maxLength={15} message={`${maxString} max`} errorMessage={errorMsg} />
  );
};
