import { expect, use } from "chai";
import { ethers } from "@nomiclabs/buidler";
import { solidity } from "ethereum-waffle";

import { SplitVault } from "../typechain/SplitVault";
import { ACCOUNT_1, NULL_ADDRESS } from "./constants";

// TODO(fabio): Update these with actual values once tokens have been added to deployer
const TOKEN_ADDRESS = "0x4a77faee9650b09849ff459ea1476eab01606c7a";
const YIELD_TOKEN_ADDRESS = "0xb3f7fB482492f4220833De6D6bfCC81157214bEC";
const CAPITAL_TOKEN_ADDRESS = "0x41B5844f4680a8C38fBb695b7F9CFd1F64474a72";

use(solidity);

describe.only("SplitVault", function () {
  describe("add function", function () {
    it("should add componentSet when called by owner", async function () {
      const SplitVault = await ethers.getContractFactory("SplitVault");
      const splitVault = (await SplitVault.deploy()) as SplitVault;

      await splitVault.deployed();
      await splitVault.add(TOKEN_ADDRESS, YIELD_TOKEN_ADDRESS, CAPITAL_TOKEN_ADDRESS);

      expect(await splitVault.getComponentSet(TOKEN_ADDRESS)).to.be.deep.equal([
        YIELD_TOKEN_ADDRESS,
        CAPITAL_TOKEN_ADDRESS,
      ]);
    });
    it("should not add componentSet when called by non-owner", async function () {
      const SplitVault = await ethers.getContractFactory("SplitVault");
      let splitVault = (await SplitVault.deploy()) as SplitVault;

      await splitVault.deployed();
      const signers = await ethers.getSigners();
      const nonOwner = signers[1];

      await expect(
        splitVault.connect(nonOwner).add(TOKEN_ADDRESS, YIELD_TOKEN_ADDRESS, CAPITAL_TOKEN_ADDRESS),
      ).to.be.revertedWith("Ownable: caller is not the owner");

      expect(await splitVault.getComponentSet(TOKEN_ADDRESS)).to.be.deep.equal([NULL_ADDRESS, NULL_ADDRESS]);
    });
  });
  describe("split", function () {
    it("should revert if user attempts to split an unregistered token", async function () {
      const SplitVault = await ethers.getContractFactory("SplitVault");
      const splitVault = (await SplitVault.deploy()) as SplitVault;

      await splitVault.deployed();
      const unregisteredTokenAddress = NULL_ADDRESS;
      const amount = 10;
      await expect(splitVault.split(amount, unregisteredTokenAddress)).to.be.revertedWith(
        "Attempted to split unsupported token",
      );
    });
  });
  describe("combine", function () {
    it("should revert if user attempts to recombine an unregistered token", async function () {
      const SplitVault = await ethers.getContractFactory("SplitVault");
      const splitVault = (await SplitVault.deploy()) as SplitVault;

      await splitVault.deployed();
      const unregisteredTokenAddress = NULL_ADDRESS;
      const amount = 10;
      await expect(splitVault.combine(amount, unregisteredTokenAddress)).to.be.revertedWith(
        "Attempted to recombine unsupported token",
      );
    });
  });
  describe("payout", function () {
    it("should revert if user attempts to call payout for an unregistered token", async function () {
      const SplitVault = await ethers.getContractFactory("SplitVault");
      const splitVault = (await SplitVault.deploy()) as SplitVault;

      await splitVault.deployed();
      const recipient = ACCOUNT_1;
      const amount = 10;
      await expect(splitVault.payout(amount, TOKEN_ADDRESS, recipient)).to.be.revertedWith(
        "Attempted to request a payout for an unsupported token",
      );
    });
    it("should revert if msg.sender isn't the corresponding YieldERC20Token", async function () {
      const SplitVault = await ethers.getContractFactory("SplitVault");
      const splitVault = (await SplitVault.deploy()) as SplitVault;

      await splitVault.deployed();
      // Add a CToken to the contract, so we don't revert because the token is unregistered
      await splitVault.add(TOKEN_ADDRESS, YIELD_TOKEN_ADDRESS, CAPITAL_TOKEN_ADDRESS);

      const recipient = ACCOUNT_1;
      const amount = 10;
      await expect(splitVault.payout(amount, TOKEN_ADDRESS, recipient)).to.be.revertedWith(
        "Payout can only be called by the corresponding yield or capital token",
      );
    });
  });
  describe("getComponentSet function", function () {
    it("should return a zero-value component set for an unregistered token", async function () {
      const SplitVault = await ethers.getContractFactory("SplitVault");
      const splitVault = (await SplitVault.deploy()) as SplitVault;

      await splitVault.deployed();
      const unregisteredTokenAddress = NULL_ADDRESS;
      expect(await splitVault.getComponentSet(unregisteredTokenAddress)).to.be.deep.equal([NULL_ADDRESS, NULL_ADDRESS]);
    });
  });
});
