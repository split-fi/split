import React from "react";
import styled from "styled-components";
import { useRouter } from "next/router";

import { CapitalToken, GovernanceToken, YieldToken } from "../components/icons/tokens";
import { H1, H3 } from "../components/typography";
import { Footer } from "../components/footer";
import { HeroHeader } from "../components/header/hero";
import { PrimaryButton } from "../components/button";
import { PATHS } from "../constants";

const HeroContainer = styled.section`
  padding: 140px;
  display: flex;
  flex-direction: column;
`;

const HeroH1 = styled(H1)`
  text-align: left;
  max-width: 800px;
  margin-bottom: 50px;
`;

const CTAButton = styled(PrimaryButton)`
  max-width: 250px;
`;

const Section = styled.section`
  padding: 80px 40px;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-around;
  align-items: center;
`;

const SectionH3 = styled(H3)`
  max-width: 600px;
`;

const IndexPage: React.FC = () => {
  const router = useRouter();
  const onGoToAppClick = () => {
    router.push(PATHS.SPLIT);
  };
  return (
    <>
      <HeroHeader />
      <HeroContainer>
        <HeroH1>
          Split Protocol facilitates the disaggregation of existing ERC20 tokens into various components representing
          different, valuable properties of the asset.
        </HeroH1>
        <CTAButton onClick={onGoToAppClick}>Go to app</CTAButton>
      </HeroContainer>
      <Section>
        <YieldToken height="250" />
        <SectionH3>
          <strong>yieldXYZ:</strong> can be minted from any income generating token (from cDAI to UNI LP tokens) with
          the holder able to redeem accumulated income or receive it automatically if it is sold
        </SectionH3>
      </Section>
      <Section>
        <SectionH3>
          <strong>governanceXYZ:</strong> governance component of tokens with this functionality which can be used
          through. Split’s platform to stripping the equity component from the full debt security
        </SectionH3>
        <GovernanceToken height="250" />
      </Section>
      <Section>
        <CapitalToken height="250" />
        <SectionH3>
          <strong>capitalXYZ:</strong> capital component is a simple token never minted individually
        </SectionH3>
      </Section>
      <Footer />
    </>
  );
};

export default React.memo(IndexPage);
