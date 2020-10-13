import { expect, use } from "chai";
import { ethers } from "@nomiclabs/buidler";
import { solidity } from "ethereum-waffle";

import { CapitalComponentToken } from "../typechain/CapitalComponentToken";
import { PriceOracleMock } from "../typechain/PriceOracleMock";
import { CTokenMock } from "../typechain/CTokenMock";
import { SplitVaultMock } from "../typechain/SplitVaultMock";

import { WAD } from "./constants";

use(solidity);

const ERC20_DECIMALS = 8;

interface CapitalComponentTokenDependencyAddresses {
  fullTokenAddress: string;
  oracleAddress: string;
  splitVaultAddress: string;
}

const getDeployedCapitalComponentToken = async (
  name: string,
  symbol: string,
  addresses: CapitalComponentTokenDependencyAddresses,
) => {
  const CapitalComponentTokenFactory = await ethers.getContractFactory("CapitalComponentToken");
  const capitalComponentToken = (await CapitalComponentTokenFactory.deploy(
    name,
    symbol,
    addresses.fullTokenAddress,
    addresses.oracleAddress,
    addresses.splitVaultAddress,
  )) as CapitalComponentToken;
  await capitalComponentToken.deployed();
  return capitalComponentToken;
};

describe.only("CapitalComponentToken", () => {
  let erc20Token: CTokenMock;
  let priceOracle: PriceOracleMock;
  let splitVault: SplitVaultMock;
  let deployedAddresses: CapitalComponentTokenDependencyAddresses;

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
      const name = "Compound DAI Capital Component";
      const symbol = "ccDAI";
      const capitalComponentToken = await getDeployedCapitalComponentToken(name, symbol, deployedAddresses);

      expect(await capitalComponentToken.name()).to.eq(name);
      expect(await capitalComponentToken.symbol()).to.eq(symbol);
    });
    it("start off with 0 supply", async () => {
      const name = "Compound DAI Capital Component";
      const symbol = "ccDAI";
      const capitalComponentToken = await getDeployedCapitalComponentToken(name, symbol, deployedAddresses);

      await capitalComponentToken.deployed();

      expect(await capitalComponentToken.totalSupply()).to.eq(0);
    });
  });
  describe("mint", async () => {
    it("should revert when called by non-owner", async () => {
      const signers = await ethers.getSigners();
      const nonOwner = signers[1];
      const address = await signers[1].getAddress();
      let capitalComponentToken = await getDeployedCapitalComponentToken("X Token", "XXX", deployedAddresses);
      await expect(capitalComponentToken.connect(nonOwner).mint(address, "1000000000")).to.be.revertedWith(
        "Ownable: caller is not the owner",
      );
    });
    it("should mint new tokens for any address when called by owner", async () => {
      const signers = await ethers.getSigners();
      const address = await signers[1].getAddress();
      const amount = "10000000000000000";
      let capitalComponentToken = await getDeployedCapitalComponentToken("X Token", "XXX", deployedAddresses);
      expect(await capitalComponentToken.balanceOf(address)).to.eq(0);
      await capitalComponentToken.mint(address, amount);
      expect(await capitalComponentToken.balanceOf(address)).to.eq(amount);
    });
  });
  describe("burn", async () => {
    it("should revert when called by non-owner", async () => {
      const signers = await ethers.getSigners();
      const nonOwner = signers[1];
      const address = await signers[1].getAddress();
      let capitalComponentToken = await getDeployedCapitalComponentToken("X Token", "XXX", deployedAddresses);
      await expect(capitalComponentToken.connect(nonOwner).burn(address, "1000000000")).to.be.revertedWith(
        "Ownable: caller is not the owner",
      );
    });
    it("should burn tokens for any address when called by owner", async () => {
      const signers = await ethers.getSigners();
      const address = await signers[1].getAddress();
      const amount = "10000000000000000";
      let capitalComponentToken = await getDeployedCapitalComponentToken("X Token", "XXX", deployedAddresses);
      expect(await capitalComponentToken.balanceOf(address)).to.eq(0);
      await capitalComponentToken.mint(address, amount);
      expect(await capitalComponentToken.balanceOf(address)).to.eq(amount);
      await capitalComponentToken.burn(address, amount);
      expect(await capitalComponentToken.balanceOf(address)).to.eq(0);
    });
    it("should call payout on SplitVault at the correct address", async () => {
      const signers = await ethers.getSigners();
      const address = await signers[1].getAddress();
      const amount = "10000000000000000";
      let capitalComponentToken = await getDeployedCapitalComponentToken("X Token", "XXX", deployedAddresses);
      await capitalComponentToken.mint(address, amount);
      await capitalComponentToken.burn(address, amount);
      const payoutCalls = await splitVault.getPayoutCalls();
      expect(payoutCalls).to.not.be.empty;
      // Only send to sender, as they are the only one with a balance
      expect(payoutCalls).to.have.lengthOf(1);
      expect(payoutCalls[0].recipient).to.eq(address);
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
      let capitalComponentToken = await getDeployedCapitalComponentToken("X Token", "XXX", deployedAddresses);
      await expect(capitalComponentToken.connect(nonOwner).mintFromFull(address, "1000000000")).to.be.revertedWith(
        "Ownable: caller is not the owner",
      );
    });
    it("should mint capital tokens corresponding to the underlying value of the fullToken in wads", async () => {
      const signers = await ethers.getSigners();
      const address = await signers[1].getAddress();
      // ERC20_DECIMALS decimals
      const amountOfFull = "2000000000";
      priceOracle.setPrice("12345678900000000000");
      let capitalComponentToken = await getDeployedCapitalComponentToken("X Token", "XXX", deployedAddresses);
      expect(await capitalComponentToken.balanceOf(address)).to.eq(0);
      await capitalComponentToken.mintFromFull(address, amountOfFull);
      expect(await capitalComponentToken.balanceOf(address)).to.eq("246913578000000000000");
    });
  });
  describe("calculatePayoutAmount", async () => {
    let capitalComponentToken: CapitalComponentToken;
    before(async () => {
      capitalComponentToken = await getDeployedCapitalComponentToken("X Token", "XXX", deployedAddresses);
    });
    type CalculatePayoutAmountTest = [string, string, string, string];
    const calculatePayoutTests: CalculatePayoutAmountTest[] = [
      [WAD, WAD, "8", "100000000"],
      ["0", WAD, "8", "0"],
      [WAD, "10000000000000", "8", "10000000000000"],
      [WAD, WAD, "18", WAD],
      [WAD, WAD, "20", "100000000000000000000"],
      [WAD, "123400000000", "8", "810372771474878"],
    ];
    calculatePayoutTests.forEach(async ([balance, currPrice, fullTokenDecimals, correctResult]) => {
      it(`Is correct for balance = ${balance}, currPrice = ${currPrice}, fullTokenDecimals = ${fullTokenDecimals}`, async () => {
        expect(
          await capitalComponentToken["calculatePayoutAmount(uint256,uint256,uint8)"](
            balance,
            currPrice,
            fullTokenDecimals,
          ),
        ).to.eq(correctResult);
      });
    });
  });
});
