import React, { useCallback, useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import findKey from "lodash/findKey";
import { useRouter } from "next/router";
import { Footer } from "../components/footer";
import { SplitWidget } from "../components/split";
import { Header } from "../components/header";
import { APP_PARAM_TO_APP_ACTION, PATHS } from "../constants";
import { HEADER_HEIGHT } from "../components/header/common";
import { FOOTER_HEIGHT } from "../components/footer/common";
import { AppAction } from "../types/app";
import { ManageWidget } from "../components/manage";
import { CombineWidget } from "../components/combine";

const MARGIN_TOP = 120;

const LayoutContainer = styled.main`
  max-width: 1024px;
  margin: 0 auto;
  height: calc(100vh - ${HEADER_HEIGHT + FOOTER_HEIGHT + MARGIN_TOP}px);
  display: flex;
  align-items: start;
  justify-content: center;
  margin-top: ${MARGIN_TOP}px;
`;

const AppActionsPage: React.FC = () => {
  const router = useRouter();

  const { query } = router;

  const routerProvidedParams = Array.isArray(query.actionParams) ? query.actionParams : [null];

  const [appActionFromParams] = routerProvidedParams as [string | null | undefined];

  const [currentAppAction, setAppAction] = useState("split" as AppAction);

  const setAppActionAndShallowPush = useCallback(
    (appAction: AppAction) => {
      setAppAction(appAction);
      const appActionParam = findKey(APP_PARAM_TO_APP_ACTION, a => a === appAction);
      router.push(appActionParam, undefined, { shallow: true });
    },
    [router, setAppAction],
  );

  // TODO(dave4506) lift this logic into a proper routing logic with next.js + the constants
  useEffect(() => {
    if (!appActionFromParams) {
      return;
    }

    if (!!APP_PARAM_TO_APP_ACTION[appActionFromParams]) {
      setAppAction(APP_PARAM_TO_APP_ACTION[appActionFromParams]);
    } else {
      setAppActionAndShallowPush(AppAction.SPLIT);
    }
  }, [router, appActionFromParams]);

  const content = useMemo(() => {
    if (currentAppAction === AppAction.SPLIT) {
      return <SplitWidget />;
    }
    if (currentAppAction === AppAction.MANAGE) {
      return <ManageWidget />;
    }
    if (currentAppAction === AppAction.COMBINE) {
      return <CombineWidget />;
    }
    return null;
  }, [currentAppAction]);

  return (
    <>
      <Header showTabs={true} currentAppAction={currentAppAction} onTabClick={setAppActionAndShallowPush} />
      <LayoutContainer>{content}</LayoutContainer>
      <Footer />
    </>
  );
};

export default React.memo(AppActionsPage);
