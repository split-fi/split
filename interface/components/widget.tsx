import styled from "styled-components";

import { PrimaryButton } from "./button";

export const ConfirmButton = styled(PrimaryButton)`
  cursor: pointer;
  margin-top: 50px;
  border-radius: 50%;
  width: 200px;
  height: 200px;
  align-self: center;
  font-size: 40px;
`;

export const InputContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 3fr 1fr;
  align-items: baseline;
  gap: 50px 12px;
  width: 800px;
`;
