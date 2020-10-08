import { expect, use } from "chai";
import { ethers } from "@nomiclabs/buidler";
import { solidity } from "ethereum-waffle";

import { YieldComponentToken } from "../typechain/YieldComponentToken";
import { CapitalComponentToken } from "../typechain/CapitalComponentToken";
import { PriceOracle } from "../typechain/PriceOracle";

use(solidity);

// TODO(fabio): Update these with actual values once tokens have been added to deployer
const FULL_TOKEN = "0x4a77faee9650b09849ff459ea1476eab01606c7a";
// TODO(fabio): Instantiate as a BigNumber
const DEFAULT_PRICE_FROM_ORACLE = "1";

const getDeployedYieldComponentToken = async (name: string, symbol: string) => {
  const PriceOracleMockFactory = await ethers.getContractFactory("PriceOracleMock");
  const priceOracleMock = (await PriceOracleMockFactory.deploy()) as PriceOracle;
  await priceOracleMock.deployed();

  const CapitalComponentTokenFactory = await ethers.getContractFactory("CapitalComponentToken");
  const capitalComponentToken = (await CapitalComponentTokenFactory.deploy(
    `${name} Capital Component`,
    `cc${symbol}`,
    FULL_TOKEN,
    priceOracleMock.address,
  )) as CapitalComponentToken;
  await capitalComponentToken.deployed();

  const SplitVault = await ethers.getContractFactory("SplitVault");
  const splitVault = await SplitVault.deploy();
  await splitVault.deployed();

  const YieldComponentTokenFactory = await ethers.getContractFactory("YieldComponentToken");
  const yieldComponentToken = (await YieldComponentTokenFactory.deploy(
    getYieldName(name),
    getYieldSymbol(symbol),
    FULL_TOKEN,
    priceOracleMock.address,
    splitVault.address,
  )) as YieldComponentToken;

  await yieldComponentToken.deployed();

  await splitVault.add(FULL_TOKEN, yieldComponentToken.address, capitalComponentToken.address);

  return yieldComponentToken;
};

const getYieldName = (name: string) => {
  return `${name} Yield Component`;
};

const getYieldSymbol = (symbol: string) => {
  return `yc${symbol}`;
};

describe("YieldComponentToken", () => {
  describe("initialization", () => {
    it("should use correct name and symbol", async () => {
      const name = "Compound DAI";
      const symbol = "DAI";
      const yieldComponentToken = await getDeployedYieldComponentToken(name, symbol);

      expect(await yieldComponentToken.name()).to.eq(getYieldName(name));
      expect(await yieldComponentToken.symbol()).to.eq(getYieldSymbol(symbol));
    });
    it("start off with 0 supply", async () => {
      const name = "Compound DAI";
      const symbol = "DAI";
      const yieldComponentToken = await getDeployedYieldComponentToken(name, symbol);

      await yieldComponentToken.deployed();

      expect(await yieldComponentToken.totalSupply()).to.eq(0);
    });
  });
  describe("mint", async () => {
    it("should revert when called by non-owner", async () => {
      const signers = await ethers.getSigners();
      const nonOwner = signers[1];
      const address = await signers[1].getAddress();
      let yieldComponentToken = await getDeployedYieldComponentToken("X Token", "XXX");
      await expect(yieldComponentToken.connect(nonOwner).mint(address, "1000000000")).to.be.revertedWith(
        "Ownable: caller is not the owner",
      );
    });
    it("should payout accrued yield and then mint new tokens for any address when called by owner", async () => {
      const signers = await ethers.getSigners();
      const address = await signers[1].getAddress();
      const amount = "10000000000000000";
      let yieldComponentToken = await getDeployedYieldComponentToken("X Token", "XXX");
      expect(await yieldComponentToken.balanceOf(address)).to.eq(0);
      await yieldComponentToken.mint(address, amount);
      expect(await yieldComponentToken.balanceOf(address)).to.eq(amount);
      // TODO(fabio): Assert that accrued yield was paid out and lastPrice updated
      const account = await yieldComponentToken.accounts(address);
      // TODO(fabio): Use native BigNumber comparison instead of converting to strings
      expect(account.balance.toString()).to.equal(amount.toString());
      expect(account.lastPrice.toString()).to.equal(DEFAULT_PRICE_FROM_ORACLE);
      console.log("lastPrice:", account.lastPrice.toString());
    });
  });
  describe("burn", async () => {
    it("should revert when called by non-owner", async () => {
      const signers = await ethers.getSigners();
      const nonOwner = signers[1];
      const address = await signers[1].getAddress();
      let yieldComponentToken = await getDeployedYieldComponentToken("X Token", "XXX");
      await expect(yieldComponentToken.connect(nonOwner).burn(address, "1000000000")).to.be.revertedWith(
        "Ownable: caller is not the owner",
      );
    });
    it("should payout accrued yield and then burn tokens for any address when called by owner", async () => {
      const signers = await ethers.getSigners();
      const address = await signers[1].getAddress();
      const amount = "10000000000000000";
      let yieldComponentToken = await getDeployedYieldComponentToken("X Token", "XXX");
      expect(await yieldComponentToken.balanceOf(address)).to.eq(0);
      await yieldComponentToken.mint(address, amount);
      expect(await yieldComponentToken.balanceOf(address)).to.eq(amount);
      await yieldComponentToken.burn(address, amount);
      expect(await yieldComponentToken.balanceOf(address)).to.eq(0);
      // TODO(fabio): Assert that accrued yield was paid out and lastPrice updated
    });
  });
  describe("withdrawYield", async () => {
    it("should withdraw the accrued yield to msg.sender and update lastPrice", async () => {
      // TODO(fabio): Write me!
    });
  });
  describe("transfer", async () => {
    it("should withdraw the accrued yield to msg.sender and `recipient` accounts and update their lastPrice's", async () => {
      // TODO(fabio): Write me!
    });
  });
  describe("transferFrom", async () => {
    it("should withdraw the accrued yield to `sender` and `recipient` accounts and update their lastPrice's", async () => {
      // TODO(fabio): Write me!
    });
  });
});
