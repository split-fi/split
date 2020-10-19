import React from "react";
import styled from "styled-components";
import { PrimaryButton } from "../button";

const SplitButton = styled(PrimaryButton)`
  cursor: pointer;
`;

export interface SplitProps {}

export const Split: React.FC<SplitProps> = () => {
  return <SplitButton onClick={console.log}>Split</SplitButton>;
};
