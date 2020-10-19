import { ethers } from "ethers";
import { useWeb3React } from "@web3-react/core";

import { SplitVaultFactory } from "split-contracts";
import { deployments } from "split-contracts/deployments";

import { CHAIN_ID_NAME } from "../constants";

export const useSplitVault = () => {
  const { chainId, account, library, active, error } = useWeb3React<ethers.providers.Web3Provider>();
  if (!chainId) {
    return { chainId, account, library, active, error };
  }
  const chainName = CHAIN_ID_NAME[chainId];
  const deployment = deployments[chainName];
  if (!deployment) {
    throw new Error(`Could not find a deployment of split-contracts on chainId: ${chainId}`);
  }
  const splitVaultAddress = deployment.splitVaultAddress;
  const splitVault = SplitVaultFactory.connect(splitVaultAddress, library.getSigner());
  return { chainId, account, splitVault, active, error };
};
