import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { PATHS } from "../../constants";

const AppPage: React.FC = () => {
  const router = useRouter();
  // TODO(dave4506) lift this logic into a proper routing logic with next.js + the constants
  useEffect(() => {
    router.push("/app/split");
  }, [router]);
  return <></>;
};

export default React.memo(AppPage);
