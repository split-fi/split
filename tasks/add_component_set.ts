import { task } from "@nomiclabs/buidler/config";

import { SplitVaultFactory } from "../typechain/SplitVaultFactory";

interface Args {
  splitVaultAddress: string;
  cTokenAddress: string;
  capitalComponenTokenAddress: string;
  yieldComponentTokenAdress: string;
}

task("add_component_set", "adds a component set to the SplitVault")
  .addParam("splitVaultAddress", "address of the SplitVault")
  .addParam("cTokenAddress", "address of the cToken")
  .addParam("capitalComponenTokenAddress", "address of the deployed capital component token")
  .addParam("yieldComponentTokenAdress", "address of the deployed yield component token")
  .setAction(async (args: Args, bre) => {
    await bre.run("compile");
    const { splitVaultAddress, cTokenAddress, capitalComponenTokenAddress, yieldComponentTokenAdress } = args;

    const SplitVaultFactory = (await bre.ethers.getContractFactory("SplitVault")) as SplitVaultFactory;
    const splitVault = SplitVaultFactory.attach(splitVaultAddress);

    const txn = await splitVault.add(cTokenAddress, yieldComponentTokenAdress, capitalComponenTokenAddress);

    console.log("Added ComponentSet to SplitVault. Txn:", txn.hash);
  });
