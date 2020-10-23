import { useRouter } from "next/router";
import React from "react";
import styled from "styled-components";

import { PATHS } from "../../constants";
import { PrimaryButton } from "../button";
import { LogoFull } from "../icons/logo";

import { HeaderContentWrapper, HeaderLeftContentWrapper, HeaderRightContentWrapper } from "./common";

const LogoWrapper = styled.div`
  cursor: pointer;
`;

export const HeroHeader: React.FC = () => {
  const router = useRouter();
  const onGoToAppClick = () => {
    router.push(PATHS.SPLIT);
  };
  const goToHome = () => {
    router.push(PATHS.ROOT);
  };
  return (
    <HeaderContentWrapper>
      <HeaderLeftContentWrapper>
        <LogoWrapper onClick={goToHome}>
          <LogoFull width="94" />
        </LogoWrapper>
      </HeaderLeftContentWrapper>
      <HeaderRightContentWrapper>
        <PrimaryButton onClick={onGoToAppClick}>Go to app</PrimaryButton>
      </HeaderRightContentWrapper>
    </HeaderContentWrapper>
  );
};
