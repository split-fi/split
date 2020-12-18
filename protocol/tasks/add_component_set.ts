import { task } from "hardhat/config";

import { deployments } from "../deployments";

interface Args {
  cTokenAddress: string;
  splitVaultAddress?: string;
  capitalComponentTokenAddress?: string;
  yieldComponentTokenAddress?: string;
}

task("add_component_set", "adds a component set to the SplitVault")
  .addParam("cTokenAddress", "address of the cToken")
  .addOptionalParam("splitVaultAddress", "address of the SplitVault")
  .addOptionalParam("capitalComponentTokenAddress", "address of the deployed capital component token")
  .addOptionalParam("yieldComponentTokenAddress", "address of the deployed yield component token")
  .setAction(async (args: Args, bre) => {
    await bre.run("compile");
    const deployment = deployments[bre.network.name];
    const componentSet = deployment.componentSets[args.cTokenAddress] || {};
    const { splitVaultAddress, cTokenAddress, capitalComponentTokenAddress, yieldComponentTokenAddress } = {
      ...args,
      splitVaultAddress: args.splitVaultAddress || deployment.splitVaultAddress,
      capitalComponentTokenAddress: args.capitalComponentTokenAddress || componentSet.capitalComponentTokenAddress,
      yieldComponentTokenAddress: args.yieldComponentTokenAddress || componentSet.yieldComponentTokenAddress,
    };
    if (!capitalComponentTokenAddress || !yieldComponentTokenAddress) {
      console.warn(
        "Could not find values for capitalComponentTokenAddress or yieldComponentTokenAddress. Add to deployments or provide as parameters.",
      );
      return;
    }

    console.log("SplitVault address used: ", splitVaultAddress);
    console.log("cTokenAddress address used: ", cTokenAddress);
    console.log("YieldComponentToken address used: ", yieldComponentTokenAddress);
    console.log("CapitalComponentToken address used: ", capitalComponentTokenAddress);

    const SplitVaultFactory = await bre.ethers.getContractFactory("SplitVault");
    const splitVault = SplitVaultFactory.attach(splitVaultAddress);

    const txn = await splitVault.add(cTokenAddress, yieldComponentTokenAddress, capitalComponentTokenAddress);

    console.log("Added ComponentSet to SplitVault. Txn:", txn.hash);
  });
