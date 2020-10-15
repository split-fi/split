import React from 'react';
import { Footer } from '../../components/footer';
import { FooterFixedWrapper } from '../../components/footer/common';
import { HeaderFixedWrapper } from '../../components/header/common';
import { Header } from '../../components/header';

const AppPage : React.FC = () => {
    return <>
        <HeaderFixedWrapper>
            <Header/>
        </HeaderFixedWrapper>
        <FooterFixedWrapper>
            <Footer/>
        </FooterFixedWrapper>
    </>
}

export default React.memo(AppPage);