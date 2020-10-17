import React, { useState, useEffect } from "react";
import { useWeb3React } from "@web3-react/core";

import { useEagerConnect, useInactiveListener } from "../hooks/wallet";

export interface Web3ConnectionContext {
  triedEagerConnect: boolean;
}

const Web3ConnectionContext = React.createContext<Web3ConnectionContext>({
  triedEagerConnect: false,
});

const Web3ConnectionProvider: React.FC = ({ children }) => {
  const { active, error } = useWeb3React();

  const [triedEagerConnect, setTriedEagerConnect] = useState<
    boolean
  >(false);

  // try to eagerly connect to an injected provider, if it exists and has granted access already
  const triedEager = useEagerConnect();

  useEffect(() => {
    if (triedEager) {
      setTriedEagerConnect(triedEager);
    }
  }, [triedEager]);

  console.log("context", active, triedEager, triedEagerConnect);

  // when there's no account connected, react to logins (broadly speaking) on the injected provider, if it exists
  useInactiveListener(!triedEager);

  return <Web3ConnectionContext.Provider value={{ triedEagerConnect }}>{children}</Web3ConnectionContext.Provider>;
};

const useWeb3Connection = () => {
  return React.useContext(Web3ConnectionContext);
}

export { Web3ConnectionProvider, useWeb3Connection };
