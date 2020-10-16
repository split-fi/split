import React, { useState, useEffect } from "react";
import { useWeb3React } from "@web3-react/core";
import styled from "styled-components";

import { network } from "../connectors";
import { useEagerConnect, useInactiveListener } from "../hooks/wallet";

export interface Web3ConnectionContext {}

const Web3ConnectionContext = React.createContext<Web3ConnectionContext>({});

const Web3ConnectionProvider: React.FC = ({ children }) => {
  const { active } = useWeb3React();
  const { active: networkActive, error: networkError, activate: activateNetwork } = useWeb3React();

  // try to eagerly connect to an injected provider, if it exists and has granted access already
  const triedEager = useEagerConnect();

  // after eagerly trying injected, if the network connect ever isn't active or in an error state, activate itd
  useEffect(() => {
    if (triedEager && !networkActive && !networkError && !active) {
      activateNetwork(network);
    }
  }, [triedEager, networkActive, networkError, activateNetwork, active]);

  // when there's no account connected, react to logins (broadly speaking) on the injected provider, if it exists
  useInactiveListener(!triedEager);

  return <Web3ConnectionContext.Provider value={{}}>{children}</Web3ConnectionContext.Provider>;
};

export { Web3ConnectionProvider };
