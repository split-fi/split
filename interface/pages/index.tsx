import React from "react";
import { Footer } from "../components/footer";
import { FooterFixedWrapper } from "../components/footer/common";
import { HeaderFixedWrapper } from "../components/header/common";
import { HeroHeader } from "../components/header/hero";

const IndexPage: React.FC = () => {
  return (
    <>
      <HeroHeader />
      <Footer />
    </>
  );
};

export default React.memo(IndexPage);
