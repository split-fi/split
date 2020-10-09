import { expect, use } from "chai";
import { ethers } from "@nomiclabs/buidler";
import { solidity } from "ethereum-waffle";

import { CapitalComponentToken } from "../typechain/CapitalComponentToken";
import { PriceOracleMock } from "../typechain/PriceOracleMock";
import { CTokenMock } from "../typechain/CTokenMock";

import { WAD } from "./constants";

use(solidity);

const ERC20_DECIMALS = 8;

const getDeployedCapitalComponentToken = async (
  name: string,
  symbol: string,
  fullTokenAddress: string,
  oracleAddress: string,
) => {
  const CapitalComponentTokenFactory = await ethers.getContractFactory("CapitalComponentToken");
  const capitalComponentToken = (await CapitalComponentTokenFactory.deploy(
    name,
    symbol,
    fullTokenAddress,
    oracleAddress,
  )) as CapitalComponentToken;
  await capitalComponentToken.deployed();
  return capitalComponentToken;
};

describe("CapitalComponentToken", () => {
  let erc20Token: CTokenMock;
  let priceOracle: PriceOracleMock;

  before(async () => {
    const PriceOracleMockFactory = await ethers.getContractFactory("PriceOracleMock");
    priceOracle = (await PriceOracleMockFactory.deploy()) as PriceOracleMock;
    await priceOracle.deployed();

    const CTokenMockFactory = await ethers.getContractFactory("CTokenMock");
    erc20Token = (await CTokenMockFactory.deploy("A Token", "AAA", ERC20_DECIMALS)) as CTokenMock;
    await erc20Token.deployed();
  });

  afterEach(async () => {
    priceOracle.setPrice(WAD);
  });

  describe("initialization", () => {
    it("should use correct name and symbol", async () => {
      const name = "Compound DAI Capital Component";
      const symbol = "ccDAI";
      const capitalComponentToken = await getDeployedCapitalComponentToken(
        name,
        symbol,
        erc20Token.address,
        priceOracle.address,
      );

      expect(await capitalComponentToken.name()).to.eq(name);
      expect(await capitalComponentToken.symbol()).to.eq(symbol);
    });
    it("start off with 0 supply", async () => {
      const name = "Compound DAI Capital Component";
      const symbol = "ccDAI";
      const capitalComponentToken = await getDeployedCapitalComponentToken(
        name,
        symbol,
        erc20Token.address,
        priceOracle.address,
      );

      await capitalComponentToken.deployed();

      expect(await capitalComponentToken.totalSupply()).to.eq(0);
    });
  });
  describe("mint", async () => {
    it("should revert when called by non-owner", async () => {
      const signers = await ethers.getSigners();
      const nonOwner = signers[1];
      const address = await signers[1].getAddress();
      let capitalComponentToken = await getDeployedCapitalComponentToken(
        "X Token",
        "XXX",
        erc20Token.address,
        priceOracle.address,
      );
      await expect(capitalComponentToken.connect(nonOwner).mint(address, "1000000000")).to.be.revertedWith(
        "Ownable: caller is not the owner",
      );
    });
    it("should mint new tokens for any address when called by owner", async () => {
      const signers = await ethers.getSigners();
      const address = await signers[1].getAddress();
      const amount = "10000000000000000";
      let capitalComponentToken = await getDeployedCapitalComponentToken(
        "X Token",
        "XXX",
        erc20Token.address,
        priceOracle.address,
      );
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
      let capitalComponentToken = await getDeployedCapitalComponentToken(
        "X Token",
        "XXX",
        erc20Token.address,
        priceOracle.address,
      );
      await expect(capitalComponentToken.connect(nonOwner).burn(address, "1000000000")).to.be.revertedWith(
        "Ownable: caller is not the owner",
      );
    });
    it("should burn tokens for any address when called by owner", async () => {
      const signers = await ethers.getSigners();
      const address = await signers[1].getAddress();
      const amount = "10000000000000000";
      let capitalComponentToken = await getDeployedCapitalComponentToken(
        "X Token",
        "XXX",
        erc20Token.address,
        priceOracle.address,
      );
      expect(await capitalComponentToken.balanceOf(address)).to.eq(0);
      await capitalComponentToken.mint(address, amount);
      expect(await capitalComponentToken.balanceOf(address)).to.eq(amount);
      await capitalComponentToken.burn(address, amount);
      expect(await capitalComponentToken.balanceOf(address)).to.eq(0);
    });
  });
  describe("mintFromFull", async () => {
    afterEach(async () => {
      priceOracle.setPrice(WAD);
    });
    it("should mint capital tokens corresponding to the underlying value of the fullToken in wads", async () => {
      const signers = await ethers.getSigners();
      const address = await signers[1].getAddress();
      // ERC20_DECIMALS decimals
      const amountOfFull = "2000000000";
      priceOracle.setPrice("12345678900000000000");
      let capitalComponentToken = await getDeployedCapitalComponentToken(
        "X Token",
        "XXX",
        erc20Token.address,
        priceOracle.address,
      );
      expect(await capitalComponentToken.balanceOf(address)).to.eq(0);
      await capitalComponentToken.mintFromFull(address, amountOfFull);
      expect(await capitalComponentToken.balanceOf(address)).to.eq("246913578000000000000");
    });
  });
});
