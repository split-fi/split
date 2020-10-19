import { ethers } from "ethers";
import { ChainId } from "../types/ethereum";
import { useWeb3React } from "@web3-react/core";
import { Web3ReactContextInterface } from "@web3-react/core/dist/types";
import { useEffect, useState } from "react";
import { isMobile } from "react-device-detect";
import { injected } from "../connectors";
import { useMountedState } from "react-use";
import { useMounted } from "./useMounted";

export const NetworkContextName = "NETWORK";

// type Web3Provider = ethers.providers.Web3Provider;
// export function useActiveWeb3React(): Web3ReactContextInterface<Web3Provider> & { chainId?: ChainId } {
//   const context = useWeb3ReactCore<Web3Provider>();
//   const contextNetwork = useWeb3ReactCore<Web3Provider>();
//   return context.active ? context : contextNetwork;
// }

export function useEagerConnect() {
  const { activate, active } = useWeb3React(); // specifically using useWeb3ReactCore because of what this hook does
  const [tried, setTried] = useState(false);
  const isMounted = useMounted();

  useEffect(() => {
    if (!isMounted) {
      return;
    }

    const attemptActivate = async () => {
      const isAuthorized = await injected.isAuthorized();
      if (isAuthorized) {
        await activate(injected, undefined, true);
        setTried(true);
      } else {
        if (isMobile && window.ethereum) {
          activate(injected, undefined, true).catch(() => {
            setTried(true);
          });
        } else {
          setTried(true);
        }
      }
    };
    attemptActivate();
  }, [activate, isMounted, tried]); // intentionally only running on mount (make sure it's only mounted once :))

  // if the connection worked, wait until we get confirmation of that to flip the flag
  useEffect(() => {
    if (!tried && active) {
      setTried(true);
    }
  }, [tried, active]);

  return tried;
}

/**
 * Use for network and injected - logs user in
 * and out after checking what network theyre on
 */
export function useInactiveListener(suppress = false) {
  const { active, error, activate } = useWeb3React(); // specifically using useWeb3React because of what this hook does

  useEffect(() => {
    const ethereum = window.ethereum;

    if (ethereum && ethereum.on && !active && !error && !suppress) {
      const handleChainChanged = () => {
        // eat errors
        activate(injected, undefined, true).catch(error => {
          console.error("Failed to activate after chain changed", error);
        });
      };

      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          // eat errors
          activate(injected, undefined, true).catch(error => {
            console.error("Failed to activate after accounts changed", error);
          });
        }
      };

      ethereum.on("chainChanged", handleChainChanged);
      ethereum.on("accountsChanged", handleAccountsChanged);

      return () => {
        if (ethereum.removeListener) {
          ethereum.removeListener("chainChanged", handleChainChanged);
          ethereum.removeListener("accountsChanged", handleAccountsChanged);
        }
      };
    }
    return undefined;
  }, [active, error, suppress, activate]);
}
