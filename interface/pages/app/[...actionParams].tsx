import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { Footer } from "../../components/footer";
import { FooterFixedWrapper } from "../../components/footer/common";
import { HeaderFixedWrapper } from "../../components/header/common";
import { Header } from "../../components/header";
import { PATHS } from "../../constants";

const AppActionsPage: React.FC = () => {
  const router = useRouter();

  const { query } = router;

  const routerProvidedParams = Array.isArray(query.actionParams) ? query.actionParams : [null];

  const [actionId] = routerProvidedParams as [string | null | undefined];

  // TODO(dave4506) lift this logic into a proper routing logic with next.js + the constants
  useEffect(() => {
    if (!actionId) {
      return;
    }

    if (actionId === "split" || actionId === "manage" || actionId === "recombine") {
      return;
    }

    router.push(PATHS.APP_SPLIT);
  }, [router, actionId]);

  return (
    <>
      <HeaderFixedWrapper>
        <Header showTabs={true} />
      </HeaderFixedWrapper>
      <FooterFixedWrapper>
        <Footer />
      </FooterFixedWrapper>
    </>
  );
};

export default React.memo(AppActionsPage);
