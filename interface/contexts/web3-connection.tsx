import React, { useState, useEffect } from "react";
import { useWeb3React } from "@web3-react/core";

import { useEagerConnect, useInactiveListener } from "../hooks/wallet";

export interface Web3ConnectionContext {}

const Web3ConnectionContext = React.createContext<Web3ConnectionContext>({});

const Web3ConnectionProvider: React.FC = ({ children }) => {
  const { active, error } = useWeb3React();

  // try to eagerly connect to an injected provider, if it exists and has granted access already
  const triedEager = useEagerConnect();
  console.log("context", active, triedEager, error);

  // when there's no account connected, react to logins (broadly speaking) on the injected provider, if it exists
  useInactiveListener(!triedEager);

  if (!triedEager) {
    return null;
  }

  return <Web3ConnectionContext.Provider value={{}}>{children}</Web3ConnectionContext.Provider>;
};

export { Web3ConnectionProvider };
