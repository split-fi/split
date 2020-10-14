import { ethers } from "@nomiclabs/buidler";

import { CapitalComponentToken } from "../typechain/CapitalComponentToken";
import { YieldComponentToken } from "../typechain/YieldComponentToken";

import { ComponentTokenDependencyAddresses } from "./types";

export const getDeployedCapitalComponentToken = async (
  name: string,
  symbol: string,
  addresses: ComponentTokenDependencyAddresses,
) => {
  const CapitalComponentTokenFactory = await ethers.getContractFactory("CapitalComponentToken");
  const capitalComponentToken = (await CapitalComponentTokenFactory.deploy(
    name,
    symbol,
    addresses.fullTokenAddress,
    addresses.oracleAddress,
    addresses.splitVaultAddress,
  )) as CapitalComponentToken;
  await capitalComponentToken.deployed();
  return capitalComponentToken;
};

export const getYieldName = (name: string) => {
  return `${name} Yield Component`;
};

export const getYieldSymbol = (symbol: string) => {
  return `yc${symbol}`;
};

export const getDeployedYieldComponentToken = async (
  name: string,
  symbol: string,
  addresses: ComponentTokenDependencyAddresses,
) => {
  const YieldComponentTokenFactory = await ethers.getContractFactory("YieldComponentToken");
  const yieldComponentToken = (await YieldComponentTokenFactory.deploy(
    getYieldName(name),
    getYieldSymbol(symbol),
    addresses.fullTokenAddress,
    addresses.oracleAddress,
    addresses.splitVaultAddress,
  )) as YieldComponentToken;

  await yieldComponentToken.deployed();

  return yieldComponentToken;
};
