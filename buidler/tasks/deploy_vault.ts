import { task } from "hardhat/config";

task("deploy_vault", "deploys the SplitVault", async (_args, bre) => {
  await bre.run("compile");
  const SplitVault = await bre.ethers.getContractFactory("SplitVault");
  const splitVault = await SplitVault.deploy();

  await splitVault.deployed();
  console.log("SplitVault deployed to:", splitVault.address);
});
