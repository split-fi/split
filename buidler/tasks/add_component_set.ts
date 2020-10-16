import { task } from "@nomiclabs/buidler/config";

import { deployments } from "../deployments";

interface Args {
  cTokenAddress: string;
  splitVaultAddress?: string;
  capitalComponenTokenAddress?: string;
  yieldComponentTokenAdress?: string;
}

task("add_component_set", "adds a component set to the SplitVault")
  .addParam("cTokenAddress", "address of the cToken")
  .addOptionalParam("splitVaultAddress", "address of the SplitVault")
  .addOptionalParam("capitalComponenTokenAddress", "address of the deployed capital component token")
  .addOptionalParam("yieldComponentTokenAdress", "address of the deployed yield component token")
  .setAction(async (args: Args, bre) => {
    await bre.run("compile");
    const deployment = deployments[bre.network.name];
    const componentSet = deployment.componentSets[args.cTokenAddress] || {};
    const { splitVaultAddress, cTokenAddress, capitalComponenTokenAddress, yieldComponentTokenAdress } = {
      ...args,
      splitVaultAddress: args.splitVaultAddress || deployment.splitVaultAddress,
      capitalComponenTokenAddress: args.splitVaultAddress || componentSet.capitalComponentTokenAddress,
      yieldComponentTokenAdress: args.splitVaultAddress || componentSet.yieldComponentTokenAddress,
    };
    if (!capitalComponenTokenAddress || !yieldComponentTokenAdress) {
      console.warn(
        "Could not find values for capitalComponentTokenAddress or yieldComponentTokenAddress. Add to deployments or provide as parameters.",
      );
      return;
    }

    console.log("SplitVault address used: ", splitVaultAddress);
    console.log("cTokenAddress address used: ", cTokenAddress);
    console.log("YieldComponentToken address used: ", yieldComponentTokenAdress);
    console.log("CapitalComponentToken address used: ", capitalComponenTokenAddress);

    const SplitVaultFactory = await bre.ethers.getContractFactory("SplitVault");
    const splitVault = SplitVaultFactory.attach(splitVaultAddress);

    const txn = await splitVault.add(cTokenAddress, yieldComponentTokenAdress, capitalComponenTokenAddress);

    console.log("Added ComponentSet to SplitVault. Txn:", txn.hash);
  });
