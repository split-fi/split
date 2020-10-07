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
}

describe("CapitalComponentToken", function () {
  describe("initialization", function () {
    it("should use correct name and symbol", async function () {
      const name = "Compound DAI Capital Component";
      const symbol = "ccDAI";
      const capitalComponentToken = await getDeployedCapitalComponentToken(name, symbol);

      expect(await capitalComponentToken.name()).to.eq(name);
      expect(await capitalComponentToken.symbol()).to.eq(symbol);
    });
    it("start off with 0 supply", async function () {
      const name = "Compound DAI Capital Component";
      const symbol = "ccDAI";
      const capitalComponentToken = await getDeployedCapitalComponentToken(name, symbol);

      await capitalComponentToken.deployed();

      expect(await capitalComponentToken.totalSupply()).to.eq(0);
    });
  });
});
