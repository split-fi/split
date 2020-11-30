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
  flex-direction: row;
  align-items: center;
`;
export const TH = styled.div``;
export const TBody = styled.div``;
export const THead = styled.div``;
export const TCell = styled.div`
  padding: 12px 0;
  border-bottom: 1px solid white;
  height: 72px;
  display: flex;
  align-items: center;
`;

export const TCellContent = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
`;

export const TCellHeader = styled(P)`
  font-size: 28px;
`;

export const TCellLabel = styled(P)`
  font-size: 14px;
`;
