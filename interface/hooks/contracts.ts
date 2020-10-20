import { JsonRpcSigner, Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from "@web3-react/core";
import { chain } from "lodash";
import { useMemo } from "react";
import { Erc20Factory, SplitVaultFactory } from "split-contracts";
import { useSplitProtocolAddresses } from "../contexts/split-addresses";

// account is not optional
export function getSigner(library: Web3Provider, account: string): JsonRpcSigner {
  return library.getSigner(account).connectUnchecked();
}

// account is optional
export function getProviderOrSigner(library: Web3Provider, account?: string): Web3Provider | JsonRpcSigner {
  return account ? getSigner(library, account) : library;
}

export const useTokenContract = (tokenAddress: string) => {
  const { library, account } = useWeb3React();
  return useMemo(() => {
    return Erc20Factory.connect(tokenAddress, getProviderOrSigner(library, account));
  }, [library, account, tokenAddress]);
};

export const useTokenContracts = (tokenAddresses: string[]) => {
  const { library, account } = useWeb3React();
  return useMemo(() => {
    return tokenAddresses.map(ta => Erc20Factory.connect(ta, getProviderOrSigner(library, account)));
  }, [library, account, tokenAddresses]);
};

export const useSplitVault = () => {
  const { library, account } = useWeb3React();
  const { splitVaultAddress } = useSplitProtocolAddresses();
  return useMemo(() => SplitVaultFactory.connect(splitVaultAddress, getProviderOrSigner(library, account)), [
    library,
    account,
    splitVaultAddress,
  ]);
};
