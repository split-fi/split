import { expect } from "chai";
import { ethers } from "@nomiclabs/buidler";

import { PriceUtilsMock } from "../../typechain/PriceUtilsMock";

import { WAD } from "../constants";

type StringOrNum = string | number;
export type FullTokenValueInWadsTest = [StringOrNum, StringOrNum, StringOrNum, StringOrNum];

describe.only("PriceUtils", function () {
  let priceUtils: PriceUtilsMock;

  before(async () => {
    const PriceUtilsFactory = await ethers.getContractFactory("PriceUtilsMock");
    priceUtils = (await PriceUtilsFactory.deploy()) as PriceUtilsMock;
    await priceUtils.deployed();
  });

  describe("fullTokenValueInWads", async () => {
    const permutations: FullTokenValueInWadsTest[] = [
      [WAD, "100", "2", WAD],
      ["150000000000000000", "3000", "2", "4500000000000000000"],
      ["150000000000000000", "2500000000000000000000", "22", "37500000000000000"],
      ["0", "100", "2", "0"],
      ["0", "2500000000000000000000", "22", "0"],
    ];
    permutations.forEach(([fullTokenPrice, amountOfFull, fullTokenDecimals, correctResult]) => {
      it(`fullTokenPrice = ${fullTokenPrice}, amountOfFull = ${amountOfFull}, fullTokenDecimals = ${fullTokenDecimals}, correctResult = ${correctResult}`, async () => {
        const result = await priceUtils.testFullTokenValueInWads(fullTokenPrice, amountOfFull, fullTokenDecimals);
        expect(result).to.eq(correctResult);
      });
    });
  });
});
