import { ethers } from "ethers";
import { useWeb3React } from "@web3-react/core";

import { SplitVaultFactory } from "split-contracts";

import { useSplitProtocolAddresses } from "../contexts/split-addresses";

export const useSplitVault = () => {
  const { chainId, account, library, active, error } = useWeb3React<ethers.providers.Web3Provider>();
  const deployment = useSplitProtocolAddresses();
  if (!deployment) {
    return { chainId, account, library, active, error };
  }
  const splitVaultAddress = deployment.splitVaultAddress;
  const splitVault = SplitVaultFactory.connect(splitVaultAddress, library.getSigner());
  return { chainId, account, splitVault, active, error };
};
