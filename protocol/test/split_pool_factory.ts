import { expect, use } from "chai";
import { ethers } from "hardhat";
import { solidity } from "ethereum-waffle";

import {
  ERC20Mock,
  SplitPoolFactory,
  BFactory,
  BPool,
  BPool__factory,
  ConfigurableRightsPool,
  ConfigurableRightsPool__factory,
  CRPFactory,
  ERC20Mock__factory,
} from "../typechain";

import { WAD } from "./constants";
import { ComponentTokenDependencyAddresses } from "./types";
import {
  getPriceOracle,
  getDeployedContracts,
  SplitVaultDependencyAddresses,
  getErc20,
  VaultAndComponentTokens,
} from "./utils";

use(solidity);

interface Libraries {
  // name -> address
  [libraryName: string]: string;
}

interface Factories {
  splitPoolFactory: SplitPoolFactory;
  bFactory: BFactory;
  crpFactory: CRPFactory;
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
    tokenBalances: ["1000000000000", "1000000000000", "1000000000000", "1000000000000"],
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

const getDeployedFactories = async (libraries: Libraries): Promise<Factories> => {
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
  const bFactory = (await BFactoryFactory.deploy()) as BFactory;
  await bFactory.deployed();

  const CRPFactoryFactory = await ethers.getContractFactory("CRPFactory", {
    libraries,
  });
  const crpFactory = (await CRPFactoryFactory.deploy()) as CRPFactory;
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
  let fullToken: ERC20Mock;
  let quoteToken: ERC20Mock;
  let poolParams: PoolParams;

  before(async () => {
    fullToken = await getErc20(ERC20_DECIMALS);
    quoteToken = await getErc20(ERC20_DECIMALS);
    libraries = await getDeployedLibraries();
    addresses = {
      fullTokenAddress: fullToken.address,
      oracleAddress: (await getPriceOracle()).address,
    };
    vaultAndComponentTokens = await getDeployedContracts(addresses);
    poolParams = getPoolParams(addresses, vaultAndComponentTokens, quoteToken.address);
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

  describe("joinPoolBySplitting", async () => {
    // Connected to owner by default
    let crpPool: ConfigurableRightsPool;
    let factories: Factories;
    let bPool: BPool;
    let deployedSplitPoolFactory: SplitPoolFactory;

    before(async () => {
      const [ownerSigner, senderSigner] = await ethers.getSigners();
      factories = await getDeployedFactories(libraries);
      const { splitPoolFactory, bFactory } = factories;
      deployedSplitPoolFactory = splitPoolFactory;
      const tx = await splitPoolFactory.newSplitPool(bFactory.address, poolParams, getPoolRights());
      const txReceipt = await tx.wait();
      const result = txReceipt.events?.find(event => event.event === "LogNewSplitPool")?.args;
      const crpAddress = (result ?? [])[1];
      crpPool = ConfigurableRightsPool__factory.connect(crpAddress, ownerSigner);
      const [owner, sender] = await Promise.all([ownerSigner.getAddress(), senderSigner.getAddress()]);
      const { splitVault, yieldComponentToken, capitalComponentToken } = vaultAndComponentTokens;
      const { constituentTokens } = poolParams;
      const mintAmount = "10000000000000000000000000000000";
      const tokens = await Promise.all(
        constituentTokens.map(tokenAddress => ERC20Mock__factory.connect(tokenAddress, ownerSigner)),
      );
      await Promise.all(tokens.map(token => token.mint(owner, mintAmount)));
      await Promise.all(tokens.map(token => token.approve(crpPool.address, mintAmount)));
      await crpPool["createPool(uint256)"]("100000000000000000000000");
      await splitVault.add(addresses.fullTokenAddress, yieldComponentToken.address, capitalComponentToken.address);
      bPool = await BPool__factory.connect(await crpPool.bPool(), ownerSigner);
    });

    it("returns pool tokens in return for full tokens", async () => {
      const [ownerSigner, senderSigner] = await ethers.getSigners();
      const [_, sender] = await Promise.all([ownerSigner.getAddress(), senderSigner.getAddress()]);
      const { splitVault } = vaultAndComponentTokens;
      const mintAmount = "1000000000000000000000";
      const joinAmount = "1000000000";
      await fullToken.mint(sender, mintAmount);
      await fullToken.connect(senderSigner).approve(deployedSplitPoolFactory.address, mintAmount);
      expect(await fullToken.balanceOf(sender)).to.be.equal(mintAmount);
      expect(await crpPool.balanceOf(sender)).to.be.equal("0");
      const txn = await deployedSplitPoolFactory
        .connect(senderSigner)
        .joinPoolBySplitting(crpPool.address, splitVault.address, addresses.fullTokenAddress, joinAmount, "0");
      await txn.wait();
      expect(await fullToken.balanceOf(sender)).to.be.equal("999999999999000000000");
      expect(await crpPool.balanceOf(sender)).to.be.equal("48863062012718785609");
      // It should send its entire balance.
      expect(await crpPool.balanceOf(factories.splitPoolFactory.address)).to.be.equal("0");
    });
  });
});
