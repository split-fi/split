import { expect, use } from "chai";
import { ethers } from "@nomiclabs/buidler";
import { solidity } from "ethereum-waffle";

import { SplitVaultComp } from "../typechain/SplitVaultComp";

const NULL_ADDRESS = "0x0000000000000000000000000000000000000000";
const ACCOUNT_1 = "0xc783df8a850f42e7F7e57013759C285caa701eB6";

// TODO(fabio): Update these with actual values once tokens have been added to deployer
const CTOKEN_ADDRESS = "0x4a77faee9650b09849ff459ea1476eab01606c7a";
const YIELD_TOKEN_ADDRESS = "0xb3f7fB482492f4220833De6D6bfCC81157214bEC";
const CAPITAL_TOKEN_ADDRESS = "0x41B5844f4680a8C38fBb695b7F9CFd1F64474a72";

use(solidity);

describe("SplitVaultComp", function () {
  describe("add function", function () {
    it("should add componentSet when called by owner", async function () {
      const SplitVaultComp = await ethers.getContractFactory("SplitVaultComp");
      const splitVaultComp = (await SplitVaultComp.deploy()) as SplitVaultComp;

      await splitVaultComp.deployed();
      await splitVaultComp.add(CTOKEN_ADDRESS, YIELD_TOKEN_ADDRESS, CAPITAL_TOKEN_ADDRESS);

      expect(await splitVaultComp.getComponentSet(CTOKEN_ADDRESS)).to.be.deep.equal([
        YIELD_TOKEN_ADDRESS,
        CAPITAL_TOKEN_ADDRESS,
      ]);
    });
    it("should not add componentSet when called by non-owner", async function () {
      const SplitVaultComp = await ethers.getContractFactory("SplitVaultComp");
      let splitVaultComp = (await SplitVaultComp.deploy()) as SplitVaultComp;

      await splitVaultComp.deployed();
      const signers = await ethers.getSigners();
      // Instatiate splitVaultComp instance with a signer that isn't the contract owner
      splitVaultComp = (await ethers.getContractAt(
        "SplitVaultComp",
        splitVaultComp.address,
        signers[1],
      )) as SplitVaultComp;

      await expect(splitVaultComp.add(CTOKEN_ADDRESS, YIELD_TOKEN_ADDRESS, CAPITAL_TOKEN_ADDRESS)).to.be.revertedWith(
        "Ownable: caller is not the owner",
      );

      expect(await splitVaultComp.getComponentSet(CTOKEN_ADDRESS)).to.be.deep.equal([NULL_ADDRESS, NULL_ADDRESS]);
    });
  });
  describe("split function", function () {
    it("should revert if user attempts to split an unregistered token", async function () {
      const SplitVaultComp = await ethers.getContractFactory("SplitVaultComp");
      const splitVaultComp = (await SplitVaultComp.deploy()) as SplitVaultComp;

      await splitVaultComp.deployed();
      const unregisteredTokenAddress = NULL_ADDRESS;
      const amount = 10;
      await expect(splitVaultComp.split(amount, unregisteredTokenAddress)).to.be.revertedWith(
        "Attempted to split unsupported token",
      );
    });
  });
  describe("recombine function", function () {
    it("should revert if user attempts to recombine an unregistered token", async function () {
      const SplitVaultComp = await ethers.getContractFactory("SplitVaultComp");
      const splitVaultComp = (await SplitVaultComp.deploy()) as SplitVaultComp;

      await splitVaultComp.deployed();
      const unregisteredTokenAddress = NULL_ADDRESS;
      const amount = 10;
      await expect(splitVaultComp.recombine(amount, unregisteredTokenAddress)).to.be.revertedWith(
        "Attempted to recombine unsupported token",
      );
    });
  });
  describe("payout function", function () {
    it("should revert if user attempts to call payout for an unregistered token", async function () {
      const SplitVaultComp = await ethers.getContractFactory("SplitVaultComp");
      const splitVaultComp = (await SplitVaultComp.deploy()) as SplitVaultComp;

      await splitVaultComp.deployed();
      const recipient = ACCOUNT_1;
      const amount = 10;
      await expect(splitVaultComp.payout(amount, CTOKEN_ADDRESS, recipient)).to.be.revertedWith(
        "Attempted to request a payout for an unsupported token",
      );
    });
    it("should revert if msg.sender isn't the corresponding YieldERC20Token", async function () {
      const SplitVaultComp = await ethers.getContractFactory("SplitVaultComp");
      const splitVaultComp = (await SplitVaultComp.deploy()) as SplitVaultComp;

      await splitVaultComp.deployed();
      // Add a CToken to the contract, so we don't revert because the token is unregistered
      await splitVaultComp.add(CTOKEN_ADDRESS, YIELD_TOKEN_ADDRESS, CAPITAL_TOKEN_ADDRESS);

      const recipient = ACCOUNT_1;
      const amount = 10;
      await expect(splitVaultComp.payout(amount, CTOKEN_ADDRESS, recipient)).to.be.revertedWith(
        "Payout can only be called by the corresponding yield token",
      );
    });
  });
  describe("getComponentSet function", function () {
    it("should return a zero-value component set for an unregistered token", async function () {
      const SplitVaultComp = await ethers.getContractFactory("SplitVaultComp");
      const splitVaultComp = (await SplitVaultComp.deploy()) as SplitVaultComp;

      await splitVaultComp.deployed();
      const unregisteredTokenAddress = NULL_ADDRESS;
      expect(await splitVaultComp.getComponentSet(unregisteredTokenAddress)).to.be.deep.equal([
        NULL_ADDRESS,
        NULL_ADDRESS,
      ]);
    });
  });
});
