import { expect, use } from "chai";
import { ethers } from "@nomiclabs/buidler";
import { solidity } from "ethereum-waffle";

import { YieldComponentToken } from "../typechain/YieldComponentToken";
import { CapitalComponentToken } from "../typechain/CapitalComponentToken";
import { PriceOracleMock } from "../typechain/PriceOracleMock";
import { CTokenMock } from "../typechain/CTokenMock";
import { SplitVault } from "../typechain/SplitVault";

import { WAD } from "./constants";

use(solidity);

// TODO(fabio): Instantiate as a BigNumber
const DEFAULT_PRICE_FROM_ORACLE = WAD;

const ERC20_DECIMALS = 8;

interface ComponentTokenDependencyAddresses {
  fullTokenAddress: string;
  oracleAddress: string;
  splitVaultAddress: string;
}

const getDeployedCapitalComponentToken = async (
  name: string,
  symbol: string,
  addresses: ComponentTokenDependencyAddresses,
) => {
  const CapitalComponentTokenFactory = await ethers.getContractFactory("CapitalComponentToken");
  const capitalComponentToken = (await CapitalComponentTokenFactory.deploy(
    `${name} Capital Component`,
    `cc${symbol}`,
    addresses.fullTokenAddress,
    addresses.oracleAddress,
  )) as CapitalComponentToken;
  await capitalComponentToken.deployed();
  return capitalComponentToken;
};

const getDeployedYieldComponentToken = async (
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

const deployAll = async (
  name: string,
  symbol: string,
  addresses: ComponentTokenDependencyAddresses,
  splitVault: SplitVault,
) => {
  const capitalComponentToken = await getDeployedCapitalComponentToken(name, symbol, addresses);
  const yieldComponentToken = await getDeployedYieldComponentToken(name, symbol, addresses);
  splitVault.add(addresses.fullTokenAddress, yieldComponentToken.address, capitalComponentToken.address);
  return {
    capitalComponentToken: capitalComponentToken,
    yieldComponentToken: yieldComponentToken,
  };
};

const getYieldName = (name: string) => {
  return `${name} Yield Component`;
};

const getYieldSymbol = (symbol: string) => {
  return `yc${symbol}`;
};

describe("YieldComponentToken", () => {
  let erc20Token: CTokenMock;
  let priceOracle: PriceOracleMock;
  let splitVault: SplitVault;
  let deployedAddresses: ComponentTokenDependencyAddresses;

  before(async () => {
    const PriceOracleMockFactory = await ethers.getContractFactory("PriceOracleMock");
    priceOracle = (await PriceOracleMockFactory.deploy()) as PriceOracleMock;
    await priceOracle.deployed();

    const CTokenMockFactory = await ethers.getContractFactory("CTokenMock");
    erc20Token = (await CTokenMockFactory.deploy("A Token", "AAA", ERC20_DECIMALS)) as CTokenMock;
    await erc20Token.deployed();

    const SplitVault = await ethers.getContractFactory("SplitVault");
    splitVault = (await SplitVault.deploy()) as SplitVault;
    await splitVault.deployed();

    deployedAddresses = {
      fullTokenAddress: erc20Token.address,
      oracleAddress: priceOracle.address,
      splitVaultAddress: splitVault.address,
    };
  });

  afterEach(async () => {
    priceOracle.setPrice(WAD);
    splitVault.remove(erc20Token.address);
  });

  describe("initialization", () => {
    it("should use correct name and symbol", async () => {
      const name = "Compound DAI";
      const symbol = "DAI";
      const { yieldComponentToken } = await deployAll(name, symbol, deployedAddresses, splitVault);

      expect(await yieldComponentToken.name()).to.eq(getYieldName(name));
      expect(await yieldComponentToken.symbol()).to.eq(getYieldSymbol(symbol));
    });
    it("start off with 0 supply", async () => {
      const name = "Compound DAI";
      const symbol = "DAI";
      const { yieldComponentToken } = await deployAll(name, symbol, deployedAddresses, splitVault);

      await yieldComponentToken.deployed();

      expect(await yieldComponentToken.totalSupply()).to.eq(0);
    });
  });
  describe("mint", async () => {
    it("should revert when called by non-owner", async () => {
      const signers = await ethers.getSigners();
      const nonOwner = signers[1];
      const address = await signers[1].getAddress();
      const { yieldComponentToken } = await deployAll("X Token", "XXX", deployedAddresses, splitVault);
      await expect(yieldComponentToken.connect(nonOwner).mint(address, "1000000000")).to.be.revertedWith(
        "Ownable: caller is not the owner",
      );
    });
    it("should payout accrued yield and then mint new tokens for any address when called by owner", async () => {
      const signers = await ethers.getSigners();
      const address = await signers[1].getAddress();
      const amount = "10000000000000000";
      const { yieldComponentToken } = await deployAll("X Token", "XXX", deployedAddresses, splitVault);
      expect(await yieldComponentToken.balanceOf(address)).to.eq(0);
      await yieldComponentToken.mint(address, amount);
      expect(await yieldComponentToken.balanceOf(address)).to.eq(amount);
      // TODO(fabio): Assert that accrued yield was paid out and lastPrice updated
      const balance = await yieldComponentToken.balanceOf(address);
      const lastPrice = await yieldComponentToken.lastPrices(address);
      // TODO(fabio): Use native BigNumber comparison instead of converting to strings
      expect(balance.toString()).to.equal(amount.toString());
      expect(lastPrice.toString()).to.equal(DEFAULT_PRICE_FROM_ORACLE);
    });
  });
  describe("burn", async () => {
    it("should revert when called by non-owner", async () => {
      const signers = await ethers.getSigners();
      const nonOwner = signers[1];
      const address = await signers[1].getAddress();
      const { yieldComponentToken } = await deployAll("X Token", "XXX", deployedAddresses, splitVault);
      await expect(yieldComponentToken.connect(nonOwner).burn(address, "1000000000")).to.be.revertedWith(
        "Ownable: caller is not the owner",
      );
    });
    it("should payout accrued yield and then burn tokens for any address when called by owner", async () => {
      const signers = await ethers.getSigners();
      const address = await signers[1].getAddress();
      const amount = "10000000000000000";
      const { yieldComponentToken } = await deployAll("X Token", "XXX", deployedAddresses, splitVault);
      expect(await yieldComponentToken.balanceOf(address)).to.eq(0);
      await yieldComponentToken.mint(address, amount);
      expect(await yieldComponentToken.balanceOf(address)).to.eq(amount);
      await yieldComponentToken.burn(address, amount);
      expect(await yieldComponentToken.balanceOf(address)).to.eq(0);
      // TODO(fabio): Assert that accrued yield was paid out and lastPrice updated
    });
  });
  describe("mintFromFull", async () => {
    afterEach(async () => {
      priceOracle.setPrice(WAD);
    });
    it("should revert when called by non-owner", async () => {
      const signers = await ethers.getSigners();
      const nonOwner = signers[1];
      const address = await nonOwner.getAddress();
      const { yieldComponentToken } = await deployAll("X Token", "XXX", deployedAddresses, splitVault);
      await expect(yieldComponentToken.connect(nonOwner).mintFromFull(address, "1000000000")).to.be.revertedWith(
        "Ownable: caller is not the owner",
      );
    });
    it("should mint capital tokens corresponding to the underlying value of the fullToken in wads", async () => {
      const signers = await ethers.getSigners();
      const address = await signers[1].getAddress();
      // ERC20_DECIMALS decimals
      const amountOfFull = "2000000000";
      priceOracle.setPrice("12345678900000000000");
      const { yieldComponentToken } = await deployAll("X Token", "XXX", deployedAddresses, splitVault);
      expect(await yieldComponentToken.balanceOf(address)).to.eq(0);
      await yieldComponentToken.mintFromFull(address, amountOfFull);
      expect(await yieldComponentToken.balanceOf(address)).to.eq("246913578000000000000");
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
