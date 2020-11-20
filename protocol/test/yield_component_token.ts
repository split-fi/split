import { expect, use } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import { solidity } from "ethereum-waffle";

import { YieldComponentToken } from "../typechain/YieldComponentToken";
import { PriceOracleMock } from "../typechain/PriceOracleMock";
import { CTokenMock } from "../typechain/CTokenMock";
import { SplitVaultMock } from "../typechain/SplitVaultMock";

import { WAD } from "./constants";
import { ComponentTokenDependencyAddresses } from "./types";
import { getDeployedYieldComponentToken, getYieldName, getYieldSymbol } from "./utils";

use(solidity);

const DEFAULT_PRICE_FROM_ORACLE = BigNumber.from(WAD);

const ERC20_DECIMALS = 8;

describe("YieldComponentToken", () => {
  let erc20Token: CTokenMock;
  let priceOracle: PriceOracleMock;
  let splitVault: SplitVaultMock;
  let deployedAddresses: ComponentTokenDependencyAddresses;

  before(async () => {
    const PriceOracleMockFactory = await ethers.getContractFactory("PriceOracleMock");
    priceOracle = (await PriceOracleMockFactory.deploy()) as PriceOracleMock;
    await priceOracle.deployed();

    const CTokenMockFactory = await ethers.getContractFactory("CTokenMock");
    erc20Token = (await CTokenMockFactory.deploy("A Token", "AAA", ERC20_DECIMALS)) as CTokenMock;
    await erc20Token.deployed();

    const SplitVaultFactory = await ethers.getContractFactory("SplitVaultMock");
    splitVault = (await SplitVaultFactory.deploy()) as SplitVaultMock;
    await splitVault.deployed();

    deployedAddresses = {
      fullTokenAddress: erc20Token.address,
      oracleAddress: priceOracle.address,
      splitVaultAddress: splitVault.address,
    };
  });

  afterEach(async () => {
    priceOracle.setPrice(WAD);
    splitVault.reset();
  });

  describe("initialization", () => {
    it("should use correct name and symbol", async () => {
      const name = "Compound DAI";
      const symbol = "DAI";
      const yieldComponentToken = await getDeployedYieldComponentToken(name, symbol, deployedAddresses);
      expect(await yieldComponentToken.name()).to.eq(getYieldName(name));
      expect(await yieldComponentToken.symbol()).to.eq(getYieldSymbol(symbol));
    });
    it("start off with 0 supply", async () => {
      const name = "Compound DAI";
      const symbol = "DAI";
      const yieldComponentToken = await getDeployedYieldComponentToken(name, symbol, deployedAddresses);
      await yieldComponentToken.deployed();
      expect(await yieldComponentToken.totalSupply()).to.eq(0);
    });
  });
  describe("mint", async () => {
    it("should revert when called by non-owner", async () => {
      const signers = await ethers.getSigners();
      const nonOwner = signers[1];
      const address = await signers[1].getAddress();
      const yieldComponentToken = await getDeployedYieldComponentToken("X Token", "XXX", deployedAddresses);
      await expect(yieldComponentToken.connect(nonOwner).mint(address, "1000000000")).to.be.revertedWith(
        "Ownable: caller is not the owner",
      );
    });
    it("should payout accrued yield and then mint new tokens for any address when called by owner", async () => {
      const signers = await ethers.getSigners();
      const address = await signers[1].getAddress();
      const amount = BigNumber.from("10000000000000000");
      const yieldComponentToken = await getDeployedYieldComponentToken("X Token", "XXX", deployedAddresses);
      expect(await yieldComponentToken.balanceOf(address)).to.eq(0);
      await yieldComponentToken.mint(address, amount);
      expect(await yieldComponentToken.balanceOf(address)).to.eq(amount);
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
      const yieldComponentToken = await getDeployedYieldComponentToken("X Token", "XXX", deployedAddresses);
      await expect(yieldComponentToken.connect(nonOwner).burn(address, "1000000000")).to.be.revertedWith(
        "Caller is not the SplitVault or Owner",
      );
    });
    it("should payout accrued yield and then burn tokens for any address when called by owner", async () => {
      const signers = await ethers.getSigners();
      const address = await signers[1].getAddress();
      const amount = "10000000000000000";
      const yieldComponentToken = await getDeployedYieldComponentToken("X Token", "XXX", deployedAddresses);
      expect(await yieldComponentToken.balanceOf(address)).to.eq(0);
      await yieldComponentToken.mint(address, amount);
      expect(await yieldComponentToken.balanceOf(address)).to.eq(amount);
      await yieldComponentToken.burn(address, amount);
      expect(await yieldComponentToken.balanceOf(address)).to.eq(0);
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
      const yieldComponentToken = await getDeployedYieldComponentToken("X Token", "XXX", deployedAddresses);
      await expect(yieldComponentToken.connect(nonOwner).mintFromFull(address, "1000000000")).to.be.revertedWith(
        "Caller is not the SplitVault or Owner",
      );
    });
    it("should mint yield component tokens corresponding to the underlying value of the fullToken in wads", async () => {
      const signers = await ethers.getSigners();
      const address = await signers[1].getAddress();
      const amountOfFull = "2000000000";
      priceOracle.setPrice("12345678900000000000");
      const yieldComponentToken = await getDeployedYieldComponentToken("X Token", "XXX", deployedAddresses);
      expect(await yieldComponentToken.balanceOf(address)).to.eq(0);
      await yieldComponentToken.mintFromFull(address, amountOfFull);
      expect(await yieldComponentToken.balanceOf(address)).to.eq("24691357800");
    });
  });
  describe("transfer", async () => {
    it("should revert if trying to send more than balance", async () => {
      const [ownerSigner, senderSigner, receiverSigner] = await ethers.getSigners();
      const [_, sender, receiver] = await Promise.all([
        ownerSigner.getAddress(),
        senderSigner.getAddress(),
        receiverSigner.getAddress(),
      ]);
      const amountToSend = "12340000";
      const yieldComponentToken = await getDeployedYieldComponentToken("X Token", "XXX", deployedAddresses);
      expect(await yieldComponentToken.balanceOf(sender)).to.eq(0);
      await expect(yieldComponentToken.connect(senderSigner).transfer(receiver, amountToSend)).to.be.revertedWith(
        "ERC20: transfer amount exceeds balance",
      );
    });
    it("should correctly transfer balances from msg.sender", async () => {
      const [ownerSigner, senderSigner, receiverSigner] = await ethers.getSigners();
      const [_, sender, receiver] = await Promise.all([
        ownerSigner.getAddress(),
        senderSigner.getAddress(),
        receiverSigner.getAddress(),
      ]);
      const amountToSend = "12340000";
      const mintAmount = "10000000000000";
      const yieldComponentToken = await getDeployedYieldComponentToken("X Token", "XXX", deployedAddresses);
      await yieldComponentToken.mint(sender, "10000000000000");
      expect(await yieldComponentToken.balanceOf(receiver)).to.eq(0);
      await yieldComponentToken.connect(senderSigner).transfer(receiver, amountToSend);
      expect(await yieldComponentToken.balanceOf(receiver)).to.eq(amountToSend);
      // should allow to transfer entire balance.
      const entireBalance = await yieldComponentToken.balanceOf(sender);
      await expect(yieldComponentToken.connect(senderSigner).transfer(receiver, entireBalance)).not.to.be.reverted;
      expect(await yieldComponentToken.balanceOf(sender)).to.eq(0);
      expect(await yieldComponentToken.balanceOf(receiver)).to.eq(mintAmount);
    });
    it("should payout yield to msg.sender", async () => {
      const [ownerSigner, senderSigner, receiverSigner] = await ethers.getSigners();
      const [_, sender, receiver] = await Promise.all([
        ownerSigner.getAddress(),
        senderSigner.getAddress(),
        receiverSigner.getAddress(),
      ]);
      const yieldComponentToken = await getDeployedYieldComponentToken("X Token", "XXX", deployedAddresses);
      const firstPrice = "1100000000";
      const secondPrice = "1200000000";
      await priceOracle.setPrice(firstPrice);
      await yieldComponentToken.mint(sender, "12340000000000");
      // no payout happens without a price increase
      expect(await splitVault.getPayoutCalls()).to.be.empty;
      await priceOracle.setPrice(secondPrice);
      await yieldComponentToken.connect(senderSigner).transfer(receiver, "1000000");
      // // price has increased, and so a transfer should trigger a real payout
      const payoutCalls = await splitVault.getPayoutCalls();
      expect(payoutCalls).to.not.be.empty;
      // Only send to sender, as they are the only one with a balance
      expect(payoutCalls).to.have.lengthOf(1);
      expect(payoutCalls[0].recipient).to.eq(sender);
    });
    it("should payout yield to both sender and receiver when both have balances", async () => {
      const [ownerSigner, senderSigner, receiverSigner] = await ethers.getSigners();
      const [_, sender, receiver] = await Promise.all([
        ownerSigner.getAddress(),
        senderSigner.getAddress(),
        receiverSigner.getAddress(),
      ]);
      const yieldComponentToken = await getDeployedYieldComponentToken("X Token", "XXX", deployedAddresses);
      const firstPrice = "1100000000";
      const secondPrice = "1200000000";
      await priceOracle.setPrice(firstPrice);
      await yieldComponentToken.mint(sender, "12340000000000");
      // No payout yet since the price hasn't changed and no transfer.
      expect(await splitVault.getPayoutCalls()).to.be.empty;
      await yieldComponentToken.connect(senderSigner).transfer(receiver, "1000000");
      // no payout happens without a price increase
      expect(await splitVault.getPayoutCalls()).to.be.empty;
      await priceOracle.setPrice(secondPrice);
      await yieldComponentToken.connect(senderSigner).transfer(receiver, "1000000");
      // // price has increased, and so a transfer should trigger a real payout
      const payoutCalls = await splitVault.getPayoutCalls();
      expect(payoutCalls).to.not.be.empty;
      // Send to both sender and receiver
      expect(payoutCalls).to.have.lengthOf(2);
      expect(payoutCalls[0].recipient).to.eq(sender);
      expect(payoutCalls[1].recipient).to.eq(receiver);
    });
    it("should always update lastPrice for both parties", async () => {
      const [ownerSigner, senderSigner, receiverSigner] = await ethers.getSigners();
      const [_, sender, receiver] = await Promise.all([
        ownerSigner.getAddress(),
        senderSigner.getAddress(),
        receiverSigner.getAddress(),
      ]);
      const yieldComponentToken = await getDeployedYieldComponentToken("X Token", "XXX", deployedAddresses);
      const firstPrice = "1100000000";
      const secondPrice = "1200000000";
      await priceOracle.setPrice(firstPrice);
      // There is no price at first
      expect(await yieldComponentToken.lastPrices(sender)).to.eq(0);
      await yieldComponentToken.mint(sender, "12340000000000");
      // minting triggers a payout as well, updating price
      expect(await yieldComponentToken.lastPrices(sender)).to.eq(firstPrice);
      // the receiver has never seen a price
      expect(await yieldComponentToken.lastPrices(receiver)).to.eq(0);
      await yieldComponentToken.connect(senderSigner).transfer(receiver, "1000000");
      expect(await yieldComponentToken.lastPrices(sender)).to.eq(firstPrice);
      // the receiver no knows of a price
      expect(await yieldComponentToken.lastPrices(receiver)).to.eq(firstPrice);
      await priceOracle.setPrice(secondPrice);
      await yieldComponentToken.connect(senderSigner).transfer(receiver, "1000000");
      // both should know of updated price
      expect(await yieldComponentToken.lastPrices(sender)).to.eq(secondPrice);
      expect(await yieldComponentToken.lastPrices(receiver)).to.eq(secondPrice);
    });
  });
  describe("transferFrom", async () => {
    it("should not allow a transfer when an allowance has not been set", async () => {
      const [ownerSigner, senderSigner, receiverSigner] = await ethers.getSigners();
      const [_, sender, receiver] = await Promise.all([
        ownerSigner.getAddress(),
        senderSigner.getAddress(),
        receiverSigner.getAddress(),
      ]);
      const amountToSend = "12340000";
      const yieldComponentToken = await getDeployedYieldComponentToken("X Token", "XXX", deployedAddresses);
      await yieldComponentToken.mint(sender, "10000000000000");
      await expect(
        yieldComponentToken.connect(receiverSigner).transferFrom(sender, receiver, amountToSend),
      ).to.be.revertedWith("ERC20: transfer amount exceeds allowance");
    });
    it("should not allow a transfer when an allowance is too small", async () => {
      const [ownerSigner, senderSigner, receiverSigner] = await ethers.getSigners();
      const [_, sender, receiver] = await Promise.all([
        ownerSigner.getAddress(),
        senderSigner.getAddress(),
        receiverSigner.getAddress(),
      ]);
      const amountToSend = "12340000";
      const yieldComponentToken = await getDeployedYieldComponentToken("X Token", "XXX", deployedAddresses);
      await yieldComponentToken.mint(sender, "10000000000000");
      await yieldComponentToken.connect(senderSigner).approve(receiver, "1234");
      await expect(
        yieldComponentToken.connect(receiverSigner).transferFrom(sender, receiver, amountToSend),
      ).to.be.revertedWith("ERC20: transfer amount exceeds allowance");
    });
    it("should allow a transfer when an allowance is set and is great enough", async () => {
      const [ownerSigner, senderSigner, receiverSigner] = await ethers.getSigners();
      const [_, sender, receiver] = await Promise.all([
        ownerSigner.getAddress(),
        senderSigner.getAddress(),
        receiverSigner.getAddress(),
      ]);
      const amountToSend = "12340000";
      const yieldComponentToken = await getDeployedYieldComponentToken("X Token", "XXX", deployedAddresses);
      await yieldComponentToken.mint(sender, "10000000000000");
      await yieldComponentToken.connect(senderSigner).approve(receiver, amountToSend);
      expect(await yieldComponentToken.balanceOf(receiver)).to.eq(0);
      await yieldComponentToken.connect(receiverSigner).transferFrom(sender, receiver, amountToSend);
      expect(await yieldComponentToken.balanceOf(receiver)).to.eq(amountToSend);
    });
    it("should payout yield to sender", async () => {
      const [ownerSigner, senderSigner, receiverSigner] = await ethers.getSigners();
      const [_, sender, receiver] = await Promise.all([
        ownerSigner.getAddress(),
        senderSigner.getAddress(),
        receiverSigner.getAddress(),
      ]);
      const yieldComponentToken = await getDeployedYieldComponentToken("X Token", "XXX", deployedAddresses);
      const firstPrice = "1100000000";
      const secondPrice = "1200000000";
      await priceOracle.setPrice(firstPrice);
      const mintAmount = "12340000000000";
      const amountToSend = "1000000";
      await yieldComponentToken.mint(sender, mintAmount);
      await yieldComponentToken.connect(senderSigner).approve(receiver, mintAmount);
      // no payout happens without a price increase
      expect(await splitVault.getPayoutCalls()).to.be.empty;
      await priceOracle.setPrice(secondPrice);
      await yieldComponentToken.connect(receiverSigner).transferFrom(sender, receiver, amountToSend);
      // // price has increased, and so a transfer should trigger a real payout
      const payoutCalls = await splitVault.getPayoutCalls();
      expect(payoutCalls).to.not.be.empty;
      // Only send to sender, as they are the only one with a balance
      expect(payoutCalls).to.have.lengthOf(1);
      expect(payoutCalls[0].recipient).to.eq(sender);
    });
    it("should payout yield to both sender and receiver when both have balances", async () => {
      const [ownerSigner, senderSigner, receiverSigner] = await ethers.getSigners();
      const [_, sender, receiver] = await Promise.all([
        ownerSigner.getAddress(),
        senderSigner.getAddress(),
        receiverSigner.getAddress(),
      ]);
      const yieldComponentToken = await getDeployedYieldComponentToken("X Token", "XXX", deployedAddresses);
      const firstPrice = "1100000000";
      const secondPrice = "1200000000";
      const mintAmount = "12340000000000";
      const amountToSend = "1000000";
      await priceOracle.setPrice(firstPrice);
      await yieldComponentToken.mint(sender, mintAmount);
      await yieldComponentToken.connect(senderSigner).approve(receiver, mintAmount);
      // No payout yet since the price hasn't changed and no transfer.
      expect(await splitVault.getPayoutCalls()).to.be.empty;
      await yieldComponentToken.connect(receiverSigner).transferFrom(sender, receiver, amountToSend);
      // no payout happens without a price increase
      expect(await splitVault.getPayoutCalls()).to.be.empty;
      await priceOracle.setPrice(secondPrice);
      await yieldComponentToken.connect(receiverSigner).transferFrom(sender, receiver, amountToSend);
      // // price has increased, and so a transfer should trigger a real payout
      const payoutCalls = await splitVault.getPayoutCalls();
      expect(payoutCalls).to.not.be.empty;
      // Send to both sender and receiver
      expect(payoutCalls).to.have.lengthOf(2);
      expect(payoutCalls[0].recipient).to.eq(sender);
      expect(payoutCalls[1].recipient).to.eq(receiver);
    });
    it("should always update lastPrice for both parties", async () => {
      const [ownerSigner, senderSigner, receiverSigner] = await ethers.getSigners();
      const [_, sender, receiver] = await Promise.all([
        ownerSigner.getAddress(),
        senderSigner.getAddress(),
        receiverSigner.getAddress(),
      ]);
      const yieldComponentToken = await getDeployedYieldComponentToken("X Token", "XXX", deployedAddresses);
      const firstPrice = "1100000000";
      const secondPrice = "1200000000";
      const mintAmount = "12340000000000";
      const amountToSend = "1000000";
      await priceOracle.setPrice(firstPrice);
      await yieldComponentToken.connect(senderSigner).approve(receiver, mintAmount);
      // There is no price at first
      expect(await yieldComponentToken.lastPrices(sender)).to.eq(0);
      await yieldComponentToken.mint(sender, mintAmount);
      // minting triggers a payout as well, updating price
      expect(await yieldComponentToken.lastPrices(sender)).to.eq(firstPrice);
      // the receiver has never seen a price
      expect(await yieldComponentToken.lastPrices(receiver)).to.eq(0);
      await yieldComponentToken.connect(receiverSigner).transferFrom(sender, receiver, amountToSend);
      expect(await yieldComponentToken.lastPrices(sender)).to.eq(firstPrice);
      // the receiver no knows of a price
      expect(await yieldComponentToken.lastPrices(receiver)).to.eq(firstPrice);
      await priceOracle.setPrice(secondPrice);
      await yieldComponentToken.connect(receiverSigner).transferFrom(sender, receiver, amountToSend);
      // both should know of updated price
      expect(await yieldComponentToken.lastPrices(sender)).to.eq(secondPrice);
      expect(await yieldComponentToken.lastPrices(receiver)).to.eq(secondPrice);
    });
  });
  describe("calculatePayoutAmount", async () => {
    let yieldComponentToken: YieldComponentToken;
    before(async () => {
      yieldComponentToken = await getDeployedYieldComponentToken("X Token", "XXX", deployedAddresses);
    });
    type CalculatePayoutAmountTest = [string, string, string, string];
    const calculatePayoutTests: CalculatePayoutAmountTest[] = [
      [WAD, WAD, WAD, "0"],
      [WAD, "1100000000000000000", WAD, "90909090909090909"],
      ["500000000000000000", "1200000000000000000", "1100000000000000000", "37878787878787879"],
      [WAD, "11000000000", "10000000000", "9090909090909090909090909"],
      ["1000000000000", "1100000000000000000", WAD, "90909090909"],
      ["100000000000", "1100000000000000000", WAD, "9090909091"],
      ["100000000000000000000000000000000000", "1100000000000000000", WAD, "9090909090909090909090909090909091"],
      [WAD, "1234599990000000000", "1234567890000000000", "21060262795409"],
      ["0", "1100000000000000000", WAD, "0"],
      [WAD, "1100000000000000000", WAD, "90909090909090909"],
      [WAD, "1100000000000000000", WAD, "90909090909090909"],
    ];
    calculatePayoutTests.forEach(async ([balance, currPrice, lastPrice, correctResult]) => {
      it(`Is correct for balance = ${balance}, currPrice = ${currPrice}, lastPrice = ${lastPrice}`, async () => {
        expect(
          await yieldComponentToken["calculatePayoutAmount(uint256,uint256,uint256)"](balance, currPrice, lastPrice),
        ).to.eq(correctResult);
      });
    });
    it("Does not allow for decreasing price", async () => {
      await expect(
        yieldComponentToken["calculatePayoutAmount(uint256,uint256,uint256)"]("1000000000", "1000000", "100000000"),
      ).to.revertedWith("Price has decreased");
    });
  });
  describe("withdrawYield", async () => {
    it("should withdraw the accrued yield to msg.sender", async () => {
      const [ownerSigner, senderSigner] = await ethers.getSigners();
      const [_, sender] = await Promise.all([ownerSigner.getAddress(), senderSigner.getAddress()]);
      const yieldComponentToken = await getDeployedYieldComponentToken("X Token", "XXX", deployedAddresses);
      const firstPrice = "1100000000";
      const secondPrice = "1200000000";
      await priceOracle.setPrice(firstPrice);
      await yieldComponentToken.mint(sender, "12340000000000");
      // no payout happens without a price increase
      expect(await splitVault.getPayoutCalls()).to.be.empty;
      await priceOracle.setPrice(secondPrice);
      await yieldComponentToken.connect(senderSigner).withdrawYield();
      // // price has increased, and so a transfer should trigger a real payout
      const payoutCalls = await splitVault.getPayoutCalls();
      expect(payoutCalls).to.not.be.empty;
      // Only send to sender, as they are the only one with a balance
      expect(payoutCalls).to.have.lengthOf(1);
      expect(payoutCalls[0].recipient).to.eq(sender);
    });
    it("should update lastPrice when yield is withdrawn", async () => {
      const [ownerSigner, senderSigner] = await ethers.getSigners();
      const [_, sender] = await Promise.all([ownerSigner.getAddress(), senderSigner.getAddress()]);
      const yieldComponentToken = await getDeployedYieldComponentToken("X Token", "XXX", deployedAddresses);
      const firstPrice = "1100000000";
      const secondPrice = "1200000000";
      await priceOracle.setPrice(firstPrice);
      // There is no price at first
      expect(await yieldComponentToken.lastPrices(sender)).to.eq(0);
      await yieldComponentToken.mint(sender, "12340000000000");
      expect(await yieldComponentToken.lastPrices(sender)).to.eq(firstPrice);
      await yieldComponentToken.connect(senderSigner).withdrawYield();
      expect(await yieldComponentToken.lastPrices(sender)).to.eq(firstPrice);
      await priceOracle.setPrice(secondPrice);
      await yieldComponentToken.connect(senderSigner).withdrawYield();
      expect(await yieldComponentToken.lastPrices(sender)).to.eq(secondPrice);
    });
  });
});
