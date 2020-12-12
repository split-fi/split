import { expect, use } from "chai";
import { ethers } from "hardhat";
import { solidity } from "ethereum-waffle";

import { SplitPoolFactory } from "../typechain/SplitPoolFactory";

import { WAD } from "./constants";
import { ComponentTokenDependencyAddresses } from "./types";
import {
  getPriceOracle,
  getDeployedContracts,
  SplitVaultDependencyAddresses,
  VaultAndComponentTokens,
  getErc20,
} from "./utils";
import { ERC20 } from "../typechain/ERC20";

use(solidity);

interface Libraries {
  // name -> address
  [libraryName: string]: string;
}

interface PoolParams {
  poolTokenSymbol: string;
  poolTokenName: string;
  constituentTokens: string[];
  tokenBalances: string[];
  tokenWeights: string[];
  swapFee: string;
}

interface Rights {
  canPauseSwapping: boolean;
  canChangeSwapFee: boolean;
  canChangeWeights: boolean;
  canAddRemoveTokens: boolean;
  canWhitelistLPs: boolean;
  canChangeCap: boolean;
}

const getPoolRights = (overrides?: Partial<Rights>): Rights => {
  return {
    canPauseSwapping: false,
    canChangeSwapFee: false,
    canChangeWeights: false,
    canAddRemoveTokens: false,
    canWhitelistLPs: false,
    canChangeCap: false,
    ...overrides,
  };
};

const getPoolParams = (
  addresses: SplitVaultDependencyAddresses,
  vaultAndComponentTokens: VaultAndComponentTokens,
  quoteTokenAddress: string,
): PoolParams => {
  return {
    poolTokenSymbol: "SPLP",
    poolTokenName: "Split Pool LP",
    constituentTokens: [
      addresses.fullTokenAddress,
      vaultAndComponentTokens.yieldComponentToken.address,
      vaultAndComponentTokens.capitalComponentToken.address,
      quoteTokenAddress,
    ],
    tokenBalances: ["0", "0", "0", "0"],
    tokenWeights: [WAD, WAD, WAD, WAD],
    swapFee: "30000000000000000",
  };
};

const getDeployedLibraries = async () => {
  const BalancerSafeMathFactory = await ethers.getContractFactory("BalancerSafeMath");
  const balancerSafeMath = await BalancerSafeMathFactory.deploy();
  await balancerSafeMath.deployed();

  const RightsManagerFactory = await ethers.getContractFactory("RightsManager");
  const rightsManager = await RightsManagerFactory.deploy();
  await rightsManager.deployed();

  const SmartPoolManagerFactory = await ethers.getContractFactory("SmartPoolManager");
  const smartPoolManager = await SmartPoolManagerFactory.deploy();
  await smartPoolManager.deployed();

  return {
    BalancerSafeMath: balancerSafeMath.address,
    RightsManager: rightsManager.address,
    SmartPoolManager: smartPoolManager.address,
  };
};

const getDeployedFactories = async (libraries: Libraries) => {
  const BalancerSafeMathFactory = await ethers.getContractFactory("BalancerSafeMath");
  const balancerSafeMath = await BalancerSafeMathFactory.deploy();
  await balancerSafeMath.deployed();

  const RightsManagerFactory = await ethers.getContractFactory("RightsManager");
  const rightsManager = await RightsManagerFactory.deploy();
  await rightsManager.deployed();

  const SmartPoolManagerFactory = await ethers.getContractFactory("SmartPoolManager");
  const smartPoolManager = await SmartPoolManagerFactory.deploy();
  await smartPoolManager.deployed();

  // Have to initialize all Balancer factories first.
  const BFactoryFactory = await ethers.getContractFactory("BFactory");
  const bFactory = await BFactoryFactory.deploy();
  await bFactory.deployed();

  const CRPFactoryFactory = await ethers.getContractFactory("CRPFactory", {
    libraries,
  });
  const crpFactory = await CRPFactoryFactory.deploy();
  await crpFactory.deployed();

  const SplitPoolFactoryFactory = await ethers.getContractFactory("SplitPoolFactory");
  const splitPoolFactory = (await SplitPoolFactoryFactory.deploy(crpFactory.address)) as SplitPoolFactory;
  await splitPoolFactory.deployed();
  return { splitPoolFactory, bFactory, crpFactory };
};

const ERC20_DECIMALS = 18;

describe.only("SplitPoolFactory", () => {
  let libraries: Libraries;
  let addresses: SplitVaultDependencyAddresses;
  let vaultAndComponentTokens: VaultAndComponentTokens;
  let erc20: ERC20;
  let poolParams: PoolParams;

  before(async () => {
    erc20 = await getErc20(ERC20_DECIMALS);
    libraries = await getDeployedLibraries();
    addresses = {
      fullTokenAddress: erc20.address,
      oracleAddress: (await getPriceOracle()).address,
    };
    vaultAndComponentTokens = await getDeployedContracts(addresses);
    poolParams = getPoolParams(addresses, vaultAndComponentTokens, erc20.address);
  });

  describe("initialization", () => {
    it("doesn't crash", async () => {
      await getDeployedFactories(libraries);
    });
  });

  describe("newSplitPool", async () => {
    it("creates and returns a new CRPool, logging a LogNewSplitPool event, and setting the mapping", async () => {
      const { splitPoolFactory, bFactory } = await getDeployedFactories(libraries);
      const tx = await splitPoolFactory.newSplitPool(bFactory.address, poolParams, getPoolRights());
      const txReceipt = await tx.wait();
      const result = txReceipt.events?.find(event => event.event === "LogNewSplitPool")?.args;
      expect(result).to.not.be.undefined;
      const address = (result ?? [])[1];
      expect(address).to.not.be.undefined;
      expect(await splitPoolFactory.isSplitPool(address)).to.be.true;
    });
  });

  describe("joinPollBySplitting", async () => {
    
  });
});
