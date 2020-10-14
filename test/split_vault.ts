import { expect, use } from "chai";
import { ethers } from "@nomiclabs/buidler";
import { solidity } from "ethereum-waffle";

import { PriceOracleMock } from "../typechain/PriceOracleMock";
import { CTokenMock } from "../typechain/CTokenMock";
import { SplitVault } from "../typechain/SplitVault";

import { ACCOUNT_1, NULL_ADDRESS, WAD } from "./constants";
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

      await expect(splitVault.connect(nonOwner).remove(addresses.fullTokenAddress)).to.be.revertedWith(
        "Ownable: caller is not the owner",
      );

      expect(await splitVault.getComponentSet(addresses.fullTokenAddress)).to.be.deep.equal([
        yieldComponentToken.address,
        capitalComponentToken.address,
      ]);
    });
  });
  describe("split", function () {
    afterEach(async () => {
      const [ownerSigner, senderSigner] = await ethers.getSigners();
      const [owner, sender] = await Promise.all([ownerSigner.getAddress(), senderSigner.getAddress()]);
      await Promise.all([erc20Token.burnAll(owner), erc20Token.burnAll(sender)]);
    });
    it("should revert if user attempts to split an unregistered token", async function () {
      const { splitVault } = await getDeployedContracts(addresses);
      const unregisteredTokenAddress = NULL_ADDRESS;
      const amount = 10;
      await expect(splitVault.split(amount, unregisteredTokenAddress)).to.be.revertedWith(
        "Attempted to split unsupported token",
      );
    });
    it("should revert if the SplitVault does not have approval to transfer the fullToken from msg.sender", async () => {
      const [ownerSigner, senderSigner] = await ethers.getSigners();
      const [_, sender] = await Promise.all([ownerSigner.getAddress(), senderSigner.getAddress()]);
      const { splitVault, yieldComponentToken, capitalComponentToken } = await getDeployedContracts(addresses);
      const mintAmount = "1000000000000000000000";
      erc20Token.mint(sender, "1000000000000000000000");
      await splitVault.add(addresses.fullTokenAddress, yieldComponentToken.address, capitalComponentToken.address);
      await expect(splitVault.connect(senderSigner).split(WAD, addresses.fullTokenAddress)).to.be.revertedWith(
        "ERC20: transfer amount exceeds allowance",
      );
    });
    it("should withdraw fullToken from msg.sender when allowance is set", async () => {
      const [ownerSigner, senderSigner] = await ethers.getSigners();
      const [_, sender] = await Promise.all([ownerSigner.getAddress(), senderSigner.getAddress()]);
      const { splitVault, yieldComponentToken, capitalComponentToken } = await getDeployedContracts(addresses);
      const mintAmount = "1000000000000000000000";
      const splitAmount = "1000000000000";
      erc20Token.mint(sender, mintAmount);
      expect(await erc20Token.balanceOf(splitVault.address)).to.eq(0);
      await splitVault.add(addresses.fullTokenAddress, yieldComponentToken.address, capitalComponentToken.address);
      erc20Token.connect(senderSigner).approve(splitVault.address, mintAmount);
      await splitVault.connect(senderSigner).split(splitAmount, addresses.fullTokenAddress);
      expect(await erc20Token.balanceOf(sender)).to.eq("999999999000000000000");
      expect(await erc20Token.balanceOf(splitVault.address)).to.eq(splitAmount);
    });
    it("should mint a corresponding amount of capital and yield component tokens to msg.sender", async () => {
      const [ownerSigner, senderSigner] = await ethers.getSigners();
      const [_, sender] = await Promise.all([ownerSigner.getAddress(), senderSigner.getAddress()]);
      const { splitVault, yieldComponentToken, capitalComponentToken } = await getDeployedContracts(addresses);
      const mintAmount = "1000000000000000000000";
      const splitAmount = "1000000000000";
      expect(await yieldComponentToken.balanceOf(sender)).to.eq(0);
      expect(await capitalComponentToken.balanceOf(sender)).to.eq(0);
      erc20Token.mint(sender, mintAmount);
      await splitVault.add(addresses.fullTokenAddress, yieldComponentToken.address, capitalComponentToken.address);
      erc20Token.connect(senderSigner).approve(splitVault.address, mintAmount);
      await splitVault.connect(senderSigner).split(splitAmount, addresses.fullTokenAddress);
      expect(await yieldComponentToken.balanceOf(sender)).to.eq("10000000000000000000000");
      expect(await capitalComponentToken.balanceOf(sender)).to.eq("10000000000000000000000");
    });
  });
  describe("combine", function () {
    afterEach(async () => {
      const [ownerSigner, senderSigner] = await ethers.getSigners();
      const [owner, sender] = await Promise.all([ownerSigner.getAddress(), senderSigner.getAddress()]);
      await Promise.all([erc20Token.burnAll(owner), erc20Token.burnAll(sender)]);
    });
    it("should revert if user attempts to recombine an unregistered token", async function () {
      const { splitVault } = await getDeployedContracts(addresses);
      const unregisteredTokenAddress = NULL_ADDRESS;
      const amount = 10;
      await expect(splitVault.combine(amount, unregisteredTokenAddress)).to.be.revertedWith(
        "Attempted to recombine unsupported token",
      );
    });
    it("should burn the amount of component tokens specified and send msg.sender the corresponding fullTokens", async () => {
      const [ownerSigner, senderSigner] = await ethers.getSigners();
      const [_, sender] = await Promise.all([ownerSigner.getAddress(), senderSigner.getAddress()]);
      const { splitVault, yieldComponentToken, capitalComponentToken } = await getDeployedContracts(addresses);
      const mintAmount = "100000000";
      const splitAmount = "100000000";
      const combineAmount = WAD;
      erc20Token.mint(sender, mintAmount);
      await splitVault.add(addresses.fullTokenAddress, yieldComponentToken.address, capitalComponentToken.address);
      erc20Token.connect(senderSigner).approve(splitVault.address, mintAmount);
      await splitVault.connect(senderSigner).split(splitAmount, addresses.fullTokenAddress);
      expect(await erc20Token.balanceOf(sender)).to.eq("0");
      expect(await yieldComponentToken.balanceOf(sender)).to.eq(WAD);
      expect(await capitalComponentToken.balanceOf(sender)).to.eq(WAD);
      await splitVault.connect(senderSigner).combine(combineAmount, addresses.fullTokenAddress);
      expect(await yieldComponentToken.balanceOf(sender)).to.eq("0");
      expect(await capitalComponentToken.balanceOf(sender)).to.eq("0");
      expect(await erc20Token.balanceOf(sender)).to.eq(splitAmount);
    });
    it("should result in complete fullToken redemption even in the case of a price change", async () => {
      const [ownerSigner, senderSigner] = await ethers.getSigners();
      const [_, sender] = await Promise.all([ownerSigner.getAddress(), senderSigner.getAddress()]);
      const { splitVault, yieldComponentToken, capitalComponentToken } = await getDeployedContracts(addresses);
      const mintAmount = "100000000";
      const splitAmount = "100000000";
      const combineAmount = WAD;
      erc20Token.mint(sender, mintAmount);
      await splitVault.add(addresses.fullTokenAddress, yieldComponentToken.address, capitalComponentToken.address);
      erc20Token.connect(senderSigner).approve(splitVault.address, mintAmount);
      await splitVault.connect(senderSigner).split(splitAmount, addresses.fullTokenAddress);
      expect(await erc20Token.balanceOf(sender)).to.eq("0");
      expect(await yieldComponentToken.balanceOf(sender)).to.eq(WAD);
      expect(await capitalComponentToken.balanceOf(sender)).to.eq(WAD);
      // 20x increase in price
      await priceOracle.setPrice("20000000000000000000");
      await splitVault.connect(senderSigner).combine(combineAmount, addresses.fullTokenAddress);
      expect(await yieldComponentToken.balanceOf(sender)).to.eq("0");
      expect(await capitalComponentToken.balanceOf(sender)).to.eq("0");
      expect(await erc20Token.balanceOf(sender)).to.eq(splitAmount);
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
