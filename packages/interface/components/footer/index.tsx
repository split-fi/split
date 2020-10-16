import React from "react";
import styled from "styled-components";
import { PrimaryAnchor } from "../anchor";
import { PrimaryButton } from "../button";
import { P } from "../typography";
import { FooterContentWrapper, FooterLeftContentWrapper, FooterRightContentWrapper } from "./common";

const LinksWrapper = styled.div`
  display: grid;
  grid-gap: 40px;
  grid-template-columns: repeat(4, 1fr);
`;

export const Footer: React.FC = () => {
  return (
    <FooterContentWrapper>
      <FooterLeftContentWrapper>
        <P>@SPLIT 2020 / This is in beta put in money at your own risk</P>
      </FooterLeftContentWrapper>
      <FooterRightContentWrapper>
        <LinksWrapper>
          <PrimaryAnchor>Discord</PrimaryAnchor>
          <PrimaryAnchor>Twitter</PrimaryAnchor>
          <PrimaryAnchor>Github</PrimaryAnchor>
          <PrimaryAnchor>CONTACT</PrimaryAnchor>
        </LinksWrapper>
      </FooterRightContentWrapper>
    </FooterContentWrapper>
  );
};
