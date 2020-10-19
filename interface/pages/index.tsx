import React from "react";
import { Footer } from "../components/footer";
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
