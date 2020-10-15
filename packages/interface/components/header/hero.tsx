import React from 'react';
import styled from 'styled-components';
import { PrimaryButton } from '../button';
import { HeaderContentWrapper, HeaderLeftContentWrapper, HeaderRightContentWrapper } from './common';

const LogoText = styled.p`
    font-size: 36px;
    font-weight: 700;
    font-style: italic;
`;

export const HeroHeader: React.FC = () => {
    return <HeaderContentWrapper>
        <HeaderLeftContentWrapper>
            <LogoText>
                Split
            </LogoText>
        </HeaderLeftContentWrapper>
        <HeaderRightContentWrapper>
            <PrimaryButton>
                Go To App
            </PrimaryButton>
        </HeaderRightContentWrapper>
    </HeaderContentWrapper>
}