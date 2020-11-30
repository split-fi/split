import { useWeb3React } from "@web3-react/core";
import { useMemo, useState, useEffect } from "react";

export const useENSLookup = (address: string | undefined) => {
  const { library } = useWeb3React();
  const [ensName, setEnsName] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!address) {
      return;
    }
    if (!library) {
      return;
    }
    library.lookupAddress(address).then(setEnsName);
  }, [library, setEnsName, address]);

  return ensName;
};
