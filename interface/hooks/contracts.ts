import { JsonRpcSigner, Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from "@web3-react/core";
import { useMemo } from "react";
import { CTokenPriceOracle__factory, ERC20__factory, SplitVault__factory, YieldComponentToken__factory } from "split-contracts";
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
    return ERC20__factory.connect(tokenAddress, getProviderOrSigner(library, account));
  }, [library, account, tokenAddress]);
};

export const useTokenContracts = (tokenAddresses: string[]) => {
  const { library, account } = useWeb3React();
  return useMemo(() => {
    return tokenAddresses.map(ta => ERC20__factory.connect(ta, getProviderOrSigner(library, account)));
  }, [library, account, tokenAddresses]);
};

export const useSplitVault = () => {
  const { library, account, active, error } = useWeb3React();
  const { splitVaultAddress } = useSplitProtocolAddresses();
  const splitVault = useMemo(
    () => SplitVault__factory.connect(splitVaultAddress, getProviderOrSigner(library, account)),
    [library, account, splitVaultAddress],
  );
  return { splitVault, active, error };
};

export const useCTokenPriceOracle = () => {
  const { library, account, active, error } = useWeb3React();
  const { priceOracleAddress } = useSplitProtocolAddresses();
  const priceOracle = useMemo(
    () => CTokenPriceOracle__factory.connect(priceOracleAddress, getProviderOrSigner(library, account)),
    [library, account, priceOracleAddress],
  );
  return { priceOracle, active, error };
};

export const useYieldTokenContracts = (tokenAddresses: string[]) => {
  const { library, account } = useWeb3React();
  return useMemo(() => {
    return tokenAddresses.map(ta => YieldComponentToken__factory.connect(ta, getProviderOrSigner(library, account)));
  }, [library, account, tokenAddresses]);
};
