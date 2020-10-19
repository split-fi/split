import React from "react";
import { useRouter } from "next/router";
import styled from "styled-components";
import { PrimaryButton } from "../button";
import { LogoSmall } from "../icons/logo";
import {
  HeaderContentWrapper,
  HeaderLeftContentWrapper,
  HeaderCenterContentWrapper,
  HeaderRightContentWrapper,
} from "./common";
import Web3Status from "../web3-status";
import { PATHS } from "../../constants";
import { NoStyledAnchor } from "../anchor";

interface HeaderProps {
  showTabs?: boolean;
}

interface TabButtonProps {
  isActive?: boolean;
}

const TabButton = styled.button<TabButtonProps>`
  text-transform: uppercase;
  font-weight: ${props => (props.isActive ? 700 : 400)};
  padding: 12px 32px;
  color: white;
  letter-spacing: 0.1rem;
  background-color: rgba(0, 0, 0, 0);
  font-size: 18px;
  border: 0px solid transparent;
  &:focus {
    outline: none;
  }
  &:hover {
    font-weight: 700;
  }
`;

const LogoWrapper = styled.div`
  cursor: pointer;
`;

export const Header: React.FC<HeaderProps> = ({ showTabs }) => {
  const router = useRouter();

  const { query } = router;

  const routerProvidedParams = Array.isArray(query.actionParams) ? query.actionParams : [null];

  const [actionId] = routerProvidedParams as [string | null | undefined];
  const onSplitIconClick = () => {
    router.push(PATHS.ROOT);
  };

  return (
    <HeaderContentWrapper>
      <HeaderLeftContentWrapper>
        <NoStyledAnchor onClick={onSplitIconClick}>
          <LogoWrapper>
            <LogoSmall />
          </LogoWrapper>
        </NoStyledAnchor>
      </HeaderLeftContentWrapper>
      {showTabs ? (
        <HeaderCenterContentWrapper>
          <TabButton isActive={actionId === "split"}>Split</TabButton>
          <TabButton isActive={actionId === "manage"}>Manage</TabButton>
          <TabButton isActive={actionId === "combine"}>Combine</TabButton>
        </HeaderCenterContentWrapper>
      ) : null}
      <HeaderRightContentWrapper>
        <Web3Status />
      </HeaderRightContentWrapper>
    </HeaderContentWrapper>
  );
};
