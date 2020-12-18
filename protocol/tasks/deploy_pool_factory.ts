import { task } from "hardhat/config";

import { deployments } from "../deployments";

task("deploy_pool_factory", "deploys a SplitPoolFactory", async (_args, bre) => {
  await bre.run("compile");
  const deployment = deployments[bre.network.name];
  const { balancerSmartPoolFactoryAddress: balancerSmartPoolFactory } = deployment;
  const SplitPoolFactory = await bre.ethers.getContractFactory("SplitPoolFactory");
  const splitPoolFactory = await SplitPoolFactory.deploy(balancerSmartPoolFactory);

  await splitPoolFactory.deployed();
  console.log("SplitPoolFactory deployed to:", splitPoolFactory.address);
});
