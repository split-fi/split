import { useRouter } from "next/router";
import React from "react";
import styled from "styled-components";
import { PATHS } from "../../constants";
import { PrimaryButton } from "../button";
import { HeaderContentWrapper, HeaderLeftContentWrapper, HeaderRightContentWrapper } from "./common";

const LogoText = styled.p`
  font-size: 36px;
  font-weight: 700;
  font-style: italic;
`;

export const HeroHeader: React.FC = () => {
  const router = useRouter();
  const onGoToAppClick = () => {
    router.push(PATHS.APP);
  };
  return (
    <HeaderContentWrapper>
      <HeaderLeftContentWrapper>
        <LogoText>Split</LogoText>
      </HeaderLeftContentWrapper>
      <HeaderRightContentWrapper>
        <PrimaryButton onClick={onGoToAppClick}>Go To App</PrimaryButton>
      </HeaderRightContentWrapper>
    </HeaderContentWrapper>
  );
};
