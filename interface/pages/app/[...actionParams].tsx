import React, { useEffect } from "react";
import styled from "styled-components";
import { useRouter } from "next/router";
import { Footer } from "../../components/footer";
import { Split } from "../../components/split";
import { Header } from "../../components/header";
import { PATHS } from "../../constants";

const LayoutContainer = styled.main`
  max-width: 1024px;
  margin: 0 auto;
  height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
`;

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

    if (actionId === "split" || actionId === "manage" || actionId === "combine") {
      return;
    }

    router.push(PATHS.APP_SPLIT);
  }, [router, actionId]);

  let content = null;
  if (actionId === "split") {
    content = <Split />;
  }

  return (
    <>
      <Header showTabs={true} />
      <LayoutContainer>
        <Split />
      </LayoutContainer>
      <Footer />
    </>
  );
};

export default React.memo(AppActionsPage);
