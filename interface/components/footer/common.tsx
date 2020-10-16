import styled from "styled-components";

export const FOOTER_HEIGHT = 90;

export const FooterSpacer = styled.div`
  height: ${FOOTER_HEIGHT}px;
  width: 100%;
`;

export const FooterContentWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: ${FOOTER_HEIGHT}px;
  padding: 0 24px;
  width: 100%;
`;

export const FooterRightContentWrapper = styled.div``;

export const FooterLeftContentWrapper = styled.div``;

export const FooterFixedWrapper = styled.div`
  position: fixed;
  bottom: 0;
  right: 0;
  left: 0;
`;
