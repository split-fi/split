import { expect, use } from "chai";
import { ethers } from "@nomiclabs/buidler";
import { solidity } from "ethereum-waffle";

import { PriceOracleMock } from "../typechain/PriceOracleMock";
import { CTokenMock } from "../typechain/CTokenMock";
import { SplitVault } from "../typechain/SplitVault";

import { ACCOUNT_1, NULL_ADDRESS } from "./constants";
import { ComponentTokenDependencyAddresses } from "./types";
import { getDeployedCapitalComponentToken, getDeployedYieldComponentToken } from "./utils";

const ERC20_DECIMALS = 8;

use(solidity);

export interface SplitVaultDependencyAddresses {
  fullTokenAddress: string;
  oracleAddress: string;
}

const getDeployedContracts = async (addresses: SplitVaultDependencyAddresses) => {
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

describe("SplitVault", function () {
  let erc20Token: CTokenMock;
  let priceOracle: PriceOracleMock;
  let addresses: SplitVaultDependencyAddresses;

  before(async () => {
    const PriceOracleMockFactory = await ethers.getContractFactory("PriceOracleMock");
    priceOracle = (await PriceOracleMockFactory.deploy()) as PriceOracleMock;
    await priceOracle.deployed();

    const CTokenMockFactory = await ethers.getContractFactory("CTokenMock");
    erc20Token = (await CTokenMockFactory.deploy("A Token", "AAA", ERC20_DECIMALS)) as CTokenMock;
    await erc20Token.deployed();

    addresses = {
      fullTokenAddress: erc20Token.address,
      oracleAddress: priceOracle.address,
    };
  });
  describe("add", function () {
    it("should add componentSet when called by owner", async function () {
      const { splitVault, yieldComponentToken, capitalComponentToken } = await getDeployedContracts(addresses);
      await splitVault.add(addresses.fullTokenAddress, yieldComponentToken.address, capitalComponentToken.address);
      expect(await splitVault.getComponentSet(addresses.fullTokenAddress)).to.be.deep.equal([
        yieldComponentToken.address,
        capitalComponentToken.address,
      ]);
    });
    it("should not add componentSet when called by non-owner", async function () {
      const { splitVault, yieldComponentToken, capitalComponentToken } = await getDeployedContracts(addresses);
      const signers = await ethers.getSigners();
      const nonOwner = signers[1];

      await expect(
        splitVault
          .connect(nonOwner)
          .add(addresses.fullTokenAddress, yieldComponentToken.address, capitalComponentToken.address),
      ).to.be.revertedWith("Ownable: caller is not the owner");

      expect(await splitVault.getComponentSet(addresses.fullTokenAddress)).to.be.deep.equal([
        NULL_ADDRESS,
        NULL_ADDRESS,
      ]);
    });
  });
  describe("remove", function () {
    it("should remove componentSet when called by owner", async function () {
      const { splitVault, yieldComponentToken, capitalComponentToken } = await getDeployedContracts(addresses);
      await splitVault.add(addresses.fullTokenAddress, yieldComponentToken.address, capitalComponentToken.address);
      await splitVault.remove(addresses.fullTokenAddress);
      expect(await splitVault.getComponentSet(addresses.fullTokenAddress)).to.be.deep.equal([
        NULL_ADDRESS,
        NULL_ADDRESS,
      ]);
    });
    it("should not remove componentSet when called by non-owner", async function () {
      const { splitVault, yieldComponentToken, capitalComponentToken } = await getDeployedContracts(addresses);
      await splitVault.add(addresses.fullTokenAddress, yieldComponentToken.address, capitalComponentToken.address);
      const signers = await ethers.getSigners();
      const nonOwner = signers[1];

      await expect(
        splitVault
          .connect(nonOwner)
          .remove(addresses.fullTokenAddress),
      ).to.be.revertedWith("Ownable: caller is not the owner");

      expect(await splitVault.getComponentSet(addresses.fullTokenAddress)).to.be.deep.equal([
        yieldComponentToken.address,
        capitalComponentToken.address,
      ]);
    });
  });
  describe("split", function () {
    it("should revert if user attempts to split an unregistered token", async function () {
      const { splitVault } = await getDeployedContracts(addresses);
      const unregisteredTokenAddress = NULL_ADDRESS;
      const amount = 10;
      await expect(splitVault.split(amount, unregisteredTokenAddress)).to.be.revertedWith(
        "Attempted to split unsupported token",
      );
    });
  });
  describe("combine", function () {
    it("should revert if user attempts to recombine an unregistered token", async function () {
      const { splitVault } = await getDeployedContracts(addresses);
      const unregisteredTokenAddress = NULL_ADDRESS;
      const amount = 10;
      await expect(splitVault.combine(amount, unregisteredTokenAddress)).to.be.revertedWith(
        "Attempted to recombine unsupported token",
      );
    });
  });
  describe("payout", function () {
    it("should revert if user attempts to call payout for an unregistered token", async function () {
      const { splitVault } = await getDeployedContracts(addresses);
      const recipient = ACCOUNT_1;
      const amount = 10;
      await expect(splitVault.payout(amount, addresses.fullTokenAddress, recipient)).to.be.revertedWith(
        "Attempted to request a payout for an unsupported token",
      );
    });
    it("should revert if msg.sender isn't the corresponding YieldERC20Token", async function () {
      const { splitVault, yieldComponentToken, capitalComponentToken } = await getDeployedContracts(addresses);
      await splitVault.add(addresses.fullTokenAddress, yieldComponentToken.address, capitalComponentToken.address);

      const recipient = ACCOUNT_1;
      const amount = 10;
      await expect(splitVault.payout(amount, addresses.fullTokenAddress, recipient)).to.be.revertedWith(
        "Payout can only be called by the corresponding yield or capital token",
      );
    });
  });
  describe("getComponentSet", function () {
    it("should return a zero-value component set for an unregistered token", async function () {
      const { splitVault, yieldComponentToken, capitalComponentToken } = await getDeployedContracts(addresses);
      await splitVault.add(addresses.fullTokenAddress, yieldComponentToken.address, capitalComponentToken.address);
      const unregisteredTokenAddress = NULL_ADDRESS;
      expect(await splitVault.getComponentSet(unregisteredTokenAddress)).to.be.deep.equal([NULL_ADDRESS, NULL_ADDRESS]);
    });
  });
});
