import { task } from "@nomiclabs/buidler/config";

import { deployments } from "../deployments";

interface Args {
  cTokenAddress: string;
  splitVaultAddress?: string;
  priceOracleAddress?: string;
  name?: string;
  symbol?: string;
}

task("deploy_component_tokens", "deploys a pair of component tokens for a cToken")
  .addParam("cTokenAddress", "address of the cToken")
  .addOptionalParam("splitVaultAddress", "address of the deployed splitVault")
  .addOptionalParam("priceOracleAddress", "address of the cToken price oracle")
  .addOptionalParam("name", "name of the cToken")
  .addOptionalParam("symbol", "symbol of the cToken")
  .setAction(async (args: Args, bre) => {
    await bre.run("compile");
    const deployment = deployments[bre.network.name];
    const { cTokenAddress, splitVaultAddress, priceOracleAddress, name, symbol } = {
      ...args,
      splitVaultAddress: args.splitVaultAddress || deployment.splitVaultAddress,
      priceOracleAddress: args.priceOracleAddress || deployment.priceOracleAddress,
    };
    if (!priceOracleAddress || !splitVaultAddress) {
      console.warn(
        `Could not find deployments of PriceOracle or SplitVault on ${bre.network.name}, so must provide optional parameters`,
      );
      return;
    }

    console.log("Oracle address used: ", priceOracleAddress);
    console.log("SplitVault address used: ", splitVaultAddress);

    const Erc20Factory = await bre.ethers.getContractFactory("ERC20");
    const erc20 = Erc20Factory.attach(cTokenAddress);
    let cTokenName = name;
    let cTokenSymbol = symbol;
    if (!cTokenName || !cTokenSymbol) {
      try {
        cTokenName = await erc20.name();
        cTokenSymbol = await erc20.symbol();
        console.log(`Token name and symbol not provided, so using ${cTokenName}: ${cTokenSymbol}`);
      } catch {
        console.warn("Failed to fetch name and symbol from ERC20 contract. Must provide optional parameters.");
        return;
      }
    }

    const CapitalComponentTokenFactory = await bre.ethers.getContractFactory("CapitalComponentToken");
    const capitalComponentToken = await CapitalComponentTokenFactory.deploy(
      `Capital ${cTokenName}`,
      `c${cTokenSymbol}`,
      cTokenAddress,
      priceOracleAddress,
      splitVaultAddress,
    );
    await capitalComponentToken.deployed();

    const YieldComponentTokenFactory = await bre.ethers.getContractFactory("YieldComponentToken");
    const yieldComponentToken = await YieldComponentTokenFactory.deploy(
      `Yield ${cTokenName}`,
      `y${cTokenSymbol}`,
      cTokenAddress,
      priceOracleAddress,
      splitVaultAddress,
    );
    await yieldComponentToken.deployed();

    console.log(`Used ${cTokenName}: ${cTokenSymbol} as full token`);
    console.log("CapitalComponentToken deployed to: ", capitalComponentToken.address);
    console.log("YieldComponentToken deployed to :", yieldComponentToken.address);
  });
