import { expect, use } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "@nomiclabs/buidler";
import { deployContract, solidity, MockProvider } from "ethereum-waffle";

import { YieldComponentToken } from "../typechain/YieldComponentToken";
import { CapitalComponentToken } from "../typechain/CapitalComponentToken";
import { PriceOracleMock } from "../typechain/PriceOracleMock";
import { CTokenMock } from "../typechain/CTokenMock";
import { SplitVault } from "../typechain/SplitVault";

import { WAD } from "./constants";

use(solidity);

const DEFAULT_PRICE_FROM_ORACLE = BigNumber.from(WAD);

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

    const wallets = new MockProvider().getWallets();
    const CTokenMockFactory = await ethers.getContractFactory("CTokenMock", wallets[0]);
    erc20Token = (await CTokenMockFactory.deploy("A Token", "AAA", ERC20_DECIMALS)) as CTokenMock;
    await erc20Token.deployed();
    console.log(await erc20Token.decimals());

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
      const amount = BigNumber.from("10000000000000000");
      const { yieldComponentToken } = await deployAll("X Token", "XXX", deployedAddresses, splitVault);
      expect(await yieldComponentToken.balanceOf(address)).to.eq(0);
      await yieldComponentToken.mint(address, amount);
      expect(await yieldComponentToken.balanceOf(address)).to.eq(amount);
      // TODO(fabio): Assert that accrued yield was paid out and lastPrice updated
      const balance = await yieldComponentToken.balanceOf(address);
      const lastPrice = await yieldComponentToken.lastPrices(address);
      expect(balance).to.equal(amount);
      expect(lastPrice).to.equal(DEFAULT_PRICE_FROM_ORACLE);
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
    it("should mint yield component tokens corresponding to the underlying value of the fullToken in wads", async () => {
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
  describe.only("transfer", async () => {
    it("should revert if trying to send more than balance", async () => {
      const [ownerSigner, senderSigner] = await ethers.getSigners();
      const [owner, sender] = await Promise.all([ownerSigner.getAddress(), senderSigner.getAddress()]);
      const amountToSend = "12340000";
      const { yieldComponentToken } = await deployAll("X Token", "XXX", deployedAddresses, splitVault);
      expect(await yieldComponentToken.balanceOf(sender)).to.eq(0);
      await expect(yieldComponentToken.connect(senderSigner).transfer(owner, amountToSend)).to.be.revertedWith(
        "ERC20: transfer amount exceeds balance",
      );
    });
    it("should correctly transfer balances from msg.sender", async () => {
      const [ownerSigner, senderSigner] = await ethers.getSigners();
      const [owner, sender] = await Promise.all([ownerSigner.getAddress(), senderSigner.getAddress()]);
      const amountToSend = "12340000";
      const { yieldComponentToken } = await deployAll("X Token", "XXX", deployedAddresses, splitVault);
      await yieldComponentToken.mint(sender, "10000000000000");
      expect(await yieldComponentToken.balanceOf(owner)).to.eq(0);
      await yieldComponentToken.connect(senderSigner).transfer(owner, amountToSend);
      expect(await yieldComponentToken.balanceOf(owner)).to.eq(amountToSend);
      // should allow to transfer entire balance.
      await expect(
        yieldComponentToken.connect(senderSigner).transfer(owner, await yieldComponentToken.balanceOf(sender)),
      ).not.to.be.reverted;
    });
    it("should payout yield to msg.sender", async () => {
      const [ownerSigner, senderSigner] = await ethers.getSigners();
      const [owner, sender] = await Promise.all([ownerSigner.getAddress(), senderSigner.getAddress()]);
      const { yieldComponentToken } = await deployAll("X Token", "XXX", deployedAddresses, splitVault);
      await priceOracle.setPrice("1100000000");
      // There is no price at first
      expect(await yieldComponentToken.lastPrices(sender)).to.eq(0);
      await yieldComponentToken.mint(sender, "12340000000000");
      expect("payout").not.to.be.calledOnContract(splitVault);
      // minting triggers a payout as well, updating price
      // expect(await yieldComponentToken.lastPrices(sender)).to.eq("1100000000");
      // expect(await erc20Token.balanceOf(sender)).to.eq(0);
      // await yieldComponentToken.connect(senderSigner).transfer(owner, "1000000");
      // // no payout happens without a price increase
      // expect(await erc20Token.balanceOf(sender)).to.eq(0);
      // await priceOracle.setPrice("1200000000");
      // await yieldComponentToken.connect(senderSigner).transfer(owner, "1000000");
      // // price has increased, and so a transfer should trigger a real payout
      // expect(await erc20Token.balanceOf(sender)).to.eq(0);
    });
    it("should payout yield to both sender and receiver when both have balances", async () => {});
  });
  describe("transferFrom", async () => {
    it("should not allow a transfer when an allowance has not been set", async () => {
      const [ownerSigner, senderSigner] = await ethers.getSigners();
      const [owner, sender] = await Promise.all([ownerSigner.getAddress(), senderSigner.getAddress()]);
      const amountToSend = "12340000";
      const { yieldComponentToken } = await deployAll("X Token", "XXX", deployedAddresses, splitVault);
      await yieldComponentToken.mint(owner, "10000000000000");
      await expect(
        yieldComponentToken.connect(senderSigner).transferFrom(owner, sender, amountToSend),
      ).to.be.revertedWith("ERC20: transfer amount exceeds allowance");
    });
    it("should not allow a transfer when an allowance is too small", async () => {
      const [ownerSigner, senderSigner] = await ethers.getSigners();
      const [owner, sender] = await Promise.all([ownerSigner.getAddress(), senderSigner.getAddress()]);
      const amountToSend = "12340000";
      const { yieldComponentToken } = await deployAll("X Token", "XXX", deployedAddresses, splitVault);
      await yieldComponentToken.mint(owner, "10000000000000");
      await yieldComponentToken.approve(sender, "1234");
      await expect(
        yieldComponentToken.connect(senderSigner).transferFrom(owner, sender, amountToSend),
      ).to.be.revertedWith("ERC20: transfer amount exceeds allowance");
    });
    it("should allow a transfer when an allowance is set and is great enough", async () => {
      const [ownerSigner, senderSigner] = await ethers.getSigners();
      const [owner, sender] = await Promise.all([ownerSigner.getAddress(), senderSigner.getAddress()]);
      const amountToSend = "12340000";
      const { yieldComponentToken } = await deployAll("X Token", "XXX", deployedAddresses, splitVault);
      await yieldComponentToken.mint(owner, "10000000000000");
      await yieldComponentToken.approve(sender, amountToSend);
      expect(await yieldComponentToken.balanceOf(sender)).to.eq(0);
      await yieldComponentToken.connect(senderSigner).transferFrom(owner, sender, amountToSend);
      expect(await yieldComponentToken.balanceOf(sender)).to.eq(amountToSend);
    });
    it("should withdraw the accrued yield to msg.sender and `recipient` accounts and update their lastPrice's", async () => {
      // TODO(fabio): Write me!
    });
  });
  describe("calculatePayoutAmount", async () => {
    let yieldComponentToken: YieldComponentToken;
    before(async () => {
      yieldComponentToken = (await deployAll("X Token", "XXX", deployedAddresses, splitVault)).yieldComponentToken;
    });
    it("returns 0 if there is no price difference", () => {});
    type CalculatePayoutAmountTest = [string, string, string, string, string];
    const calculatePayoutTests: CalculatePayoutAmountTest[] = [["", "", "", "", ""]];
    calculatePayoutTests.forEach(async ([balance, currPrice, lastPrice, fullTokenDecimals, correctResult]) => {
      it(`Is correct for balance = ${balance}, currPrice = ${currPrice}, lastPrice = ${lastPrice}, fullTokenDecimals = ${fullTokenDecimals}`, async () => {
        expect(await yieldComponentToken.calculatePayoutAmount(balance, currPrice, lastPrice, fullTokenDecimals)).to.eq(
          correctResult,
        );
      });
    });
  });
  describe("withdrawYield", async () => {
    it("should withdraw the accrued yield to msg.sender and update lastPrice", async () => {
      // TODO(fabio): Write me!
    });
  });
});
