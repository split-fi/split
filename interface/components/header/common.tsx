import styled from "styled-components";

export const HEADER_HEIGHT = 90;

export const HeaderSpacer = styled.div`
  height: ${HEADER_HEIGHT}px;
  width: 100%;
`;

export const HeaderContentWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: ${HEADER_HEIGHT}px;
  padding: 0 24px;
  width: 100%;
  position: relative;
`;

export const HeaderRightContentWrapper = styled.div`
  position: relative;
  z-index: 1000;
`;

export const HeaderLeftContentWrapper = styled.div`
  position: relative;
  z-index: 1000;
`;

export const HeaderCenterContentWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: ${HEADER_HEIGHT}px;
  z-index: 999;
`;

export const HeaderFixedWrapper = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
`;
