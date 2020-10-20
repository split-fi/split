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
import { APP_PARAM_TO_APP_ACTION, PATHS } from "../../constants";
import { NoStyledAnchor } from "../anchor";
import { AppAction } from "../../types/app";

interface HeaderProps {
  showTabs?: boolean;
  currentAppAction: AppAction;
  onTabClick: (appAction: AppAction) => void;
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

const APP_ACTION_TO_TAB_TITLE = {
  [AppAction.SPLIT]: "Split",
  [AppAction.MANAGE]: "Manage",
  [AppAction.COMBINE]: "Combine",
};

export const Header: React.FC<HeaderProps> = ({ showTabs, currentAppAction, onTabClick }) => {
  const router = useRouter();

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
          {Object.values(AppAction).map((appAction: AppAction) => {
            return (
              <TabButton isActive={appAction === currentAppAction} onClick={onTabClick.bind(this, appAction)}>
                {APP_ACTION_TO_TAB_TITLE[appAction]}
              </TabButton>
            );
          })}
        </HeaderCenterContentWrapper>
      ) : null}
      <HeaderRightContentWrapper>
        <Web3Status />
      </HeaderRightContentWrapper>
    </HeaderContentWrapper>
  );
};
