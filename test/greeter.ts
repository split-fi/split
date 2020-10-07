import { expect } from "chai";
import { ethers } from "@nomiclabs/buidler";

import { Greeter } from "../typechain/Greeter";

describe("Greeter", function () {
  it("Should return the new greeting once it's changed", async function () {
    const GreeterFactory = await ethers.getContractFactory("GreeterFactory");
    const greeter = (await GreeterFactory.deploy("Hello, world!")) as Greeter;

    await greeter.deployed();
    expect(await greeter.greet()).to.equal("Hello, world!");

    await greeter.setGreeting("Hola, mundo!");
    expect(await greeter.greet()).to.equal("Hola, mundo!");
  });
});
