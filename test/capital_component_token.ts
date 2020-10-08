import { expect, use } from "chai";
import { ethers } from "@nomiclabs/buidler";
import { solidity } from "ethereum-waffle";

import { CapitalComponentToken } from "../typechain/CapitalComponentToken";

use(solidity);

const getDeployedCapitalComponentToken = async (name: string, symbol: string) => {
  const CapitalComponentTokenFactory = await ethers.getContractFactory("CapitalComponentToken");
  const capitalComponentToken = (await CapitalComponentTokenFactory.deploy(name, symbol)) as CapitalComponentToken;

  await capitalComponentToken.deployed();
  return capitalComponentToken;
};

describe("CapitalComponentToken", () => {
  describe("initialization", () => {
    it("should use correct name and symbol", async () => {
      const name = "Compound DAI Capital Component";
      const symbol = "ccDAI";
      const capitalComponentToken = await getDeployedCapitalComponentToken(name, symbol);

      expect(await capitalComponentToken.name()).to.eq(name);
      expect(await capitalComponentToken.symbol()).to.eq(symbol);
    });
    it("start off with 0 supply", async () => {
      const name = "Compound DAI Capital Component";
      const symbol = "ccDAI";
      const capitalComponentToken = await getDeployedCapitalComponentToken(name, symbol);

      await capitalComponentToken.deployed();

      expect(await capitalComponentToken.totalSupply()).to.eq(0);
    });
  });
  describe("mint", async () => {
    it("should revert when called by non-owner", async () => {
      const signers = await ethers.getSigners();
      const address = await signers[1].getAddress();
      let capitalComponentToken = await getDeployedCapitalComponentToken("X Token", "XXX");
      await expect(capitalComponentToken.connect(signers[1]).mint(address, "1000000000")).to.be.revertedWith(
        "Ownable: caller is not the owner",
      );
    });
    it("should mint new tokens for any address when called by owner", async () => {
      const signers = await ethers.getSigners();
      const address = await signers[1].getAddress();
      const amount = "10000000000000000";
      let capitalComponentToken = await getDeployedCapitalComponentToken("X Token", "XXX");
      expect(await capitalComponentToken.balanceOf(address)).to.eq(0);
      await capitalComponentToken.mint(address, amount);
      expect(await capitalComponentToken.balanceOf(address)).to.eq(amount);
    });
  });
  describe("burn", async () => {
    it("should revert when called by non-owner", async () => {
      const signers = await ethers.getSigners();
      const address = await signers[1].getAddress();
      let capitalComponentToken = await getDeployedCapitalComponentToken("X Token", "XXX");
      await expect(capitalComponentToken.connect(signers[1]).burn(address, "1000000000")).to.be.revertedWith(
        "Ownable: caller is not the owner",
      );
    });
    it("should burn tokens for any address when called by owner", async () => {
      const signers = await ethers.getSigners();
      const address = await signers[1].getAddress();
      const amount = "10000000000000000";
      let capitalComponentToken = await getDeployedCapitalComponentToken("X Token", "XXX");
      expect(await capitalComponentToken.balanceOf(address)).to.eq(0);
      await capitalComponentToken.mint(address, amount);
      expect(await capitalComponentToken.balanceOf(address)).to.eq(amount);
      await capitalComponentToken.burn(address, amount);
      expect(await capitalComponentToken.balanceOf(address)).to.eq(0);
    });
  });
});
