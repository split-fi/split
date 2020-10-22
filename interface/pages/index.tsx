import React, { useState, useEffect } from "react";
import { useLottie } from "lottie-react";
import styled from "styled-components";
import { useRouter } from "next/router";

import { CapitalToken, GovernanceToken, YieldToken } from "../components/icons/tokens";
import { H1, H3 } from "../components/typography";
import { Footer } from "../components/footer";
import { HeroHeader } from "../components/header/hero";
import { PrimaryButton } from "../components/button";
import { PATHS } from "../constants";
import splitMergeAnimation from "../data/split_merge.json";

const HeroContainer = styled.section`
  display: flex;
  padding-left: 120px;
  padding-bottom: 100px;
  padding-top: 100px;
  flex-direction: column;
`;

const HeroH1 = styled(H1)`
  text-align: left;
  max-width: 600px;
  margin-bottom: 50px;
`;

const CTAButton = styled(PrimaryButton)`
  max-width: 250px;
`;

const AnimationContainer = styled.div`
  width: 600px;
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

let speed = -1;
const IndexPage: React.FC = () => {
  const router = useRouter();
  const { View, setSpeed, play } = useLottie({
    animationData: splitMergeAnimation,
    autoplay: false,
    loop: false,
    onComplete: () => {
      speed = speed * -1;
      setSpeed(speed);
      play();
    },
  });
  useEffect(() => {
    play();
  }, []);
  const onGoToAppClick = () => {
    router.push(PATHS.SPLIT);
  };
  return (
    <>
      <HeroHeader />
      <Section>
        <HeroContainer>
          <HeroH1>
            Split Protocol facilitates the disaggregation of existing ERC20 tokens into various components representing
            different, valuable properties of the asset.
          </HeroH1>
          <CTAButton onClick={onGoToAppClick}>Go to app</CTAButton>
        </HeroContainer>
        <AnimationContainer>{View}</AnimationContainer>
      </Section>
      <Section>
        <YieldToken height="250" />
        <SectionH3>
          <strong>yieldXYZ</strong> can be minted from any income-generating token – from cDAI to YFI to UNI LP tokens –
          with the holder able to redeem accumulated income or receive it automatically if transferred
        </SectionH3>
      </Section>
      <Section>
        <SectionH3>
          <strong>governanceXYZ</strong> can be minted from any token with attached governance rights—such as COMP, KNC
          or YFI—providing the holder with full voting rights for potentially only a fraction of the full token price
        </SectionH3>
        <GovernanceToken height="250" />
      </Section>
      <Section>
        <CapitalToken height="250" />
        <SectionH3>
          <strong>capitalXYZ</strong> is minted from every Split Protocol deconstruction providing growth-focused
          exposure
        </SectionH3>
      </Section>
      <Footer />
    </>
  );
};

export default React.memo(IndexPage);
