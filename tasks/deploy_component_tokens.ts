import { task } from "@nomiclabs/buidler/config";

import { Erc20Factory } from "../typechain/Erc20Factory";

interface Args {
  cTokenAddress: string;
  splitVaultAddress: string;
  oracleAddress: string;
}

task("deploy_component_tokens", "deploys a pair of component tokens for a cToken")
  .addParam("cTokenAddress", "address of the cToken")
  .addParam("splitVaultAddress", "address of the deployed splitVault")
  .addParam("oracleAddress", "address of the cToken price oracle")
  .setAction(async (args: Args, bre) => {
    await bre.run("compile");
    const { cTokenAddress, splitVaultAddress, oracleAddress } = args;

    const Erc20Factory = (await bre.ethers.getContractFactory("ERC20")) as Erc20Factory;
    const erc20 = Erc20Factory.attach(cTokenAddress);
    const cTokenName = await erc20.name();
    const cTokenSymbol = await erc20.symbol();

    const CapitalComponentTokenFactory = await bre.ethers.getContractFactory("CapitalComponentToken");
    const capitalComponentToken = await CapitalComponentTokenFactory.deploy(
      `Capital ${cTokenName}`,
      `c${cTokenSymbol}`,
      cTokenAddress,
      oracleAddress,
      splitVaultAddress,
    );
    await capitalComponentToken.deployed();

    const YieldComponentTokenFactory = await bre.ethers.getContractFactory("YieldComponentToken");
    const yieldComponentToken = await YieldComponentTokenFactory.deploy(
      `Yield ${cTokenName}`,
      `y${cTokenSymbol}`,
      cTokenAddress,
      oracleAddress,
      splitVaultAddress,
    );
    await yieldComponentToken.deployed();

    console.log("CapitalComponentToken deployed to:", capitalComponentToken.address);
    console.log("YieldComponentToken deployed to:", yieldComponentToken.address);
  });
