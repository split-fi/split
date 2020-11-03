import React from "react";
import styled from "styled-components";

import { P } from "../typography";
import { Discord, Github, Twitter } from "../icons/social";
import { FooterContentWrapper, FooterLeftContentWrapper, FooterRightContentWrapper } from "./common";

const LinksWrapper = styled.div`
  display: grid;
  grid-gap: 40px;
  grid-template-columns: repeat(3, 1fr);
`;

export const Footer: React.FC = () => {
  return (
    <FooterContentWrapper>
      <FooterLeftContentWrapper>
        <P>© SPLIT 2020 UNAUDITED BETA – Mainnet, Rinkeby</P>
      </FooterLeftContentWrapper>
      <FooterRightContentWrapper>
        <LinksWrapper>
          <a href="https://twitter.com/splitprotocol" target="_blank">
            <Twitter />
          </a>
          <a href="https://github.com/split-fi/split" target="_blank">
            <Github />
          </a>
          <a href="https://discord.gg/Z5sgBxd9" target="_blank">
            <Discord />
          </a>
        </LinksWrapper>
      </FooterRightContentWrapper>
    </FooterContentWrapper>
  );
};
