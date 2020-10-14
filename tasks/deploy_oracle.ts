import { task } from "@nomiclabs/buidler/config";

task("deploy_oracle", "deploys the CTokenPriceOracle", async (_args, bre) => {
  await bre.run('compile');

  const CTokenPriceOracle = await bre.ethers.getContractFactory("CTokenPriceOracle");
  const priceOracle = await CTokenPriceOracle.deploy();

  await priceOracle.deployed();
  console.log("CTokenPriceOracle deployed to:", priceOracle.address);
})