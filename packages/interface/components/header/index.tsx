import React from 'react';
import {useRouter} from 'next/router';
import styled from 'styled-components';
import { PrimaryButton } from '../button';
import { SplitIcon } from '../icons/split-icon';
import { HeaderContentWrapper, HeaderLeftContentWrapper, HeaderCenterContentWrapper, HeaderRightContentWrapper } from './common';

const StyledSplitIcon = styled(SplitIcon)`
    width: 36px;
    height: 36px;
`;

interface HeaderProps {
    showTabs?: boolean;
}

interface TabButtonProps {
    isActive?: boolean;
}

const TabButton = styled.button<TabButtonProps>`
    text-transform: uppercase;
    font-weight: ${props => props.isActive ? 700 : 400};
    padding: 12px 32px;
    color: white;
    letter-spacing: 0.1rem;
    background-color: rgba(0,0,0,0);
    font-size: 18px;
    border: 0px solid transparent;
    &:focus {
        outline: none;
    }
    &:hover {
        font-weight: 700;
    }
`;

export const Header: React.FC<HeaderProps> = ({ showTabs }) => {
    const router = useRouter();

    const { query } = router;


    const routerProvidedParams = Array.isArray(query.actionParams)
      ? query.actionParams
      : [null];
  
    const [actionId] = routerProvidedParams as [
      string | null | undefined,
    ];

    return <HeaderContentWrapper>
        <HeaderLeftContentWrapper>
            <StyledSplitIcon/>
        </HeaderLeftContentWrapper>
        {
            showTabs ? 
            <HeaderCenterContentWrapper>
                <TabButton isActive={actionId === 'split'}>
                    Split
                </TabButton>
                <TabButton isActive={actionId === 'manage'}>
                    Manage
                </TabButton>
                <TabButton isActive={actionId === 'recombine'}>
                    Recombine
                </TabButton>
            </HeaderCenterContentWrapper> : null
        }
        <HeaderRightContentWrapper>
            <PrimaryButton>{/** TODO(dave4506) web3ify */}
                Connect Wallet
            </PrimaryButton>
        </HeaderRightContentWrapper>
    </HeaderContentWrapper>
}