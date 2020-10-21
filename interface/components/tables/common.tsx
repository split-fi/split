import styled from "styled-components";
import { P } from "../typography";

export const TableContainer = styled.div`
  width: 100%;
`;
export const HeaderTR = styled.div`
  border-bottom: 1px solid white;
`;
export const TR = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;
export const TH = styled.div``;
export const TBody = styled.div``;
export const THead = styled.div``;
export const TCell = styled.div`
  padding: 12px 0;
  border-bottom: 1px solid white;
  flex-grow: 1;
  height: 72px;
  display: flex;
  align-items: center;
`;

export const TCellHeader = styled(P)`
  font-size: 28px;
`;

export const TCellLabel = styled(P)`
  font-size: 14px;
`;
