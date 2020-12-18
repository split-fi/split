import { task } from "hardhat/config";

import { deployments } from "../deployments";

interface Args {
  cTokenAddress: string;
  tokenInAddress: string;
  tokenOutAddress: string;
  tokenInAmount: string;
}

task("swap_tokens", "swap tokens using a balancer pool")
  .addParam("cTokenAddress", "address of the cToken (to find the corresponding pool)")
  .addParam("tokenOutAddress", "address of the token to sell")
  .addParam("tokenInAddress", "address of the token to buy")
  .addParam("tokenInAmount", "amount of token to sell")
  .setAction(async (args: Args, bre) => {
    await bre.run("compile");
    const deployment = deployments[bre.network.name];
    const { poolAddress } = deployment.splitPools[args.cTokenAddress];

    const ConfigurableRightsPoolFactory = await bre.ethers.getContractFactory("ConfigurableRightsPool", {
      libraries: deployment.libraries,
    });
    const configurableRightsPool = ConfigurableRightsPoolFactory.attach(poolAddress);

    const ERC20Factory = await bre.ethers.getContractFactory("ERC20");
    const erc20 = ERC20Factory.attach(args.tokenInAddress);

    const bPoolAddress = await configurableRightsPool.bPool();
    await erc20.approve(bPoolAddress, bre.ethers.constants.MaxUint256);

    const BPoolFactory = await bre.ethers.getContractFactory("BPool");
    const bPool = BPoolFactory.attach(bPoolAddress);

    const txn = await bPool.swapExactAmountIn(
      args.tokenInAddress,
      args.tokenInAmount,
      args.tokenOutAddress,
      "0",
      bre.ethers.constants.MaxUint256,
      {
        gasLimit: "10000000",
      },
    );
    console.log(`Swapping ${args.tokenInAmount} ${args.tokenInAddress} for ${args.tokenOutAddress}. Txn: ${txn.hash}`);
  });
