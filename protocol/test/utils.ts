import { ethers } from "hardhat";

import { SplitVault } from "../typechain/SplitVault";
import { PriceOracleMock } from "../typechain/PriceOracleMock";
import { ERC20Mock } from "../typechain/ERC20Mock";
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

export interface SplitVaultDependencyAddresses {
  fullTokenAddress: string;
  oracleAddress: string;
}

export interface VaultAndComponentTokens {
  splitVault: SplitVault;
  yieldComponentToken: YieldComponentToken;
  capitalComponentToken: CapitalComponentToken;
}

export const getDeployedContracts = async (addresses: SplitVaultDependencyAddresses) => {
  const SplitVaultFactory = await ethers.getContractFactory("SplitVault");
  const splitVault = (await SplitVaultFactory.deploy()) as SplitVault;
  await splitVault.deployed();
  const deployedAddresses: ComponentTokenDependencyAddresses = {
    ...addresses,
    splitVaultAddress: splitVault.address,
  };
  const name = "X Token";
  const symbol = "XXX";
  const yieldComponentToken = await getDeployedYieldComponentToken(name, symbol, deployedAddresses);
  const capitalComponentToken = await getDeployedCapitalComponentToken(name, symbol, deployedAddresses);
  return {
    splitVault,
    yieldComponentToken,
    capitalComponentToken,
  };
};

export const getPriceOracle = async () => {
  const PriceOracleMockFactory = await ethers.getContractFactory("PriceOracleMock");
  const priceOracle = (await PriceOracleMockFactory.deploy()) as PriceOracleMock;
  await priceOracle.deployed();
  return priceOracle;
};

export const getErc20 = async (decimals: number) => {
  const Erc20Factory = await ethers.getContractFactory("ERC20Mock");
  const erc20 = (await Erc20Factory.deploy("X Token", "XXX", decimals)) as ERC20Mock;
  await erc20.deployed();
  return erc20;
};
