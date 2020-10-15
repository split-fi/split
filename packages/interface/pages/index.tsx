import React from 'react';
import { Footer } from '../components/footer';
import { FooterFixedWrapper } from '../components/footer/common';
import { HeaderFixedWrapper } from '../components/header/common';
import { HeroHeader } from '../components/header/hero';

const IndexPage : React.FC = () => {
    return <>
        <HeaderFixedWrapper>
            <HeroHeader />
        </HeaderFixedWrapper>
        <FooterFixedWrapper>
            <Footer/>
        </FooterFixedWrapper>
    </>
}

export default React.memo(IndexPage);