import styled from "styled-components";

import { H1 } from "./typography";
import { PrimaryButton } from "./button";
import { Dropdown } from "./dropdown";

export const ConfirmButton = styled(PrimaryButton)`
  cursor: pointer;
  margin-top: 20px;
  border-radius: 50%;
  width: 200px;
  height: 200px;
  align-self: center;
  font-size: 40px;
`;

export const InputContainer = styled.div`
  max-width: 800px;
  display: grid;
  grid-template-columns: 1fr 3fr 1fr;
  align-items: baseline;
  margin: 15px 0px;
`;

export const InputLabel = styled(H1)`
  padding: 15px 0px;
`;

export const TokenDropdown = styled(Dropdown)`
  padding: 15px 0px;
`;
