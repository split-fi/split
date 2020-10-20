import React, { useCallback } from "react";
import styled, { css } from "styled-components";

import { colors } from "../theme";

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
  max?: string;
  errorMessage?: string;
  className?: string;
  maxLength?: number;
  isDisabled?: boolean;
}

export const Input: React.FC<InputProps> = props => {
  const { value, onChange, max, errorMessage, className, isDisabled, maxLength = 10 } = props;
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
    <InputContainer isDisabled={isDisabled} className={className}>
      <SplitInput
        disabled={isDisabled}
        isError={isError}
        min="0"
        max={max}
        type="number"
        value={value}
        onChange={e => innerOnChange(e.target.value, value)}
      />
      {!isError && max && <Message>{max} max</Message>}
      {isError && <Message isError={true}>{errorMessage}</Message>}
    </InputContainer>
  );
};
