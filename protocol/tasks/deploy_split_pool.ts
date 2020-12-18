import { task } from "hardhat/config";
import { ethers } from "ethers";
import axios from "axios";

import { deployments } from "../deployments";
import { ComponentSet } from "../deployments/types";

interface Args {
  cTokenAddress: string;
  // optional w/ default
  initialDollarAmount: string;
  splitPoolFactoryAddress?: string;
  balancerPoolFactoryAddress?: string;
  // optional w/ default
  initialSupply: string;
  shouldSkipCreatePool?: boolean;
  shouldSkipApprovals?: boolean;
  shouldUseExistingDeployment?: boolean;
}

interface PoolParams {
  poolTokenSymbol: string;
  poolTokenName: string;
  constituentTokens: string[];
  tokenBalances: ethers.BigNumberish[];
  tokenWeights: ethers.BigNumberish[];
  swapFee: ethers.BigNumberish;
}

interface Rights {
  canPauseSwapping: boolean;
  canChangeSwapFee: boolean;
  canChangeWeights: boolean;
  canAddRemoveTokens: boolean;
  canWhitelistLPs: boolean;
  canChangeCap: boolean;
}

const DEFAULT_RIGHTS: Rights = {
  canPauseSwapping: true,
  canChangeSwapFee: false,
  // Need to continuously adjust.
  canChangeWeights: true,
  canAddRemoveTokens: false,
  canWhitelistLPs: false,
  canChangeCap: true,
};

const toWei = (num: ethers.BigNumberish) => ethers.constants.WeiPerEther.mul(num);
const BIG_NUMBER_TEN = ethers.BigNumber.from(10);

interface PoolTokenInfo {
  symbol: string;
  weight: number;
  address: string;
  priceFrom: { symbol: string; multiBy: number };
}

const calculateTokenBalances = async (
  dollarAmount: number,
  tokenInfos: PoolTokenInfo[],
): Promise<ethers.BigNumberish[]> => {
  const totalWeight = tokenInfos.map(info => info.weight).reduce((a, b) => a + b, 0);
  const tokenBalances = [];
  for (const tokenInfo of tokenInfos) {
    const { symbol, multiBy } = tokenInfo.priceFrom;
    const response = await axios.get(
      `https://api.0x.org/swap/v1/price?sellToken=${symbol}&buyToken=DAI&buyAmount=1000000000000000000`,
    );
    const { sellAmount } = response.data; // Amount needed for 1 dollars worth.
    const dollarAmountNeeded = (tokenInfo.weight / totalWeight) * dollarAmount;
    const amountNeeded = ethers.BigNumber.from(sellAmount).mul(dollarAmountNeeded).mul(multiBy);
    tokenBalances.push(amountNeeded);
  }
  return tokenBalances;
};

const logSplitPoolArgs = (splitPoolArgs: [string, PoolParams, Rights]) => {
  const poolParams = splitPoolArgs[1];
  const newPoolParams = {
    ...splitPoolArgs[1],
    tokenWeights: poolParams.tokenWeights.map(tw => tw.toString()),
    tokenBalances: poolParams.tokenBalances.map(tb => tb.toString()),
  };
  console.log(JSON.stringify([splitPoolArgs[0], newPoolParams, splitPoolArgs[2]], null, 2));
};

task("deploy_split_pool", "deploys a new Configurable Rights Pool through the SplitPoolFactory")
  .addParam("cTokenAddress", "address of the cToken")
  .addOptionalParam("initialDollarAmount", "amount of tokens to initialize the pool with in dollars", "100")
  .addOptionalParam("splitPoolFactoryAddress", "address of the SplitPoolFactory")
  .addOptionalParam("balancerFactoryAddress", "address of the BPoolFactory")
  .addOptionalParam("initialSupply", "the initial supply of pool tokens", "100")
  .addFlag("shouldSkipCreatePool", "whether to skip the call to createPool()")
  .addFlag("shouldSkipApprovals", "whether to skip token approvals")
  .addFlag("shouldUseExistingDeployment", "whether to create a new ConfigurableRightsPool")
  .setAction(async (args: Args, bre) => {
    await bre.run("compile");
    const deployment = deployments[bre.network.name];
    const dollarAmount = Number(args.initialDollarAmount);
    const { capitalComponentTokenAddress, yieldComponentTokenAddress } =
      deployment.componentSets[args.cTokenAddress] ?? ({} as ComponentSet);
    if (!capitalComponentTokenAddress || !yieldComponentTokenAddress) {
      console.warn(
        `Could not find values for capitalComponentTokenAddress or yieldComponentTokenAddress for ${args.cTokenAddress}. Add to deployments.`,
      );
      return;
    }
    const { cTokenAddress, splitPoolFactoryAddress, balancerPoolFactoryAddress } = {
      ...args,
      splitPoolFactoryAddress: args.splitPoolFactoryAddress || deployment.splitPoolFactoryAddress,
      balancerPoolFactoryAddress: args.balancerPoolFactoryAddress || deployment.balancerPoolFactoryAddress,
    };
    if (!splitPoolFactoryAddress || !balancerPoolFactoryAddress) {
      console.warn(
        "Could not find values for splitPoolFactoryAddress or balancerPoolFactoryAddress. Add to deployments or provide as parameters.",
      );
      return;
    }
    const Erc20Factory = await bre.ethers.getContractFactory("ERC20");

    const erc20 = Erc20Factory.attach(cTokenAddress);
    let cTokenName;
    let cTokenSymbol;
    try {
      cTokenName = await erc20.name();
      cTokenSymbol = await erc20.symbol();
    } catch {
      console.warn("Failed to fetch name and symbol from ERC20 contract.");
      return;
    }
    const poolTokenSymbol = `SBPT–${cTokenSymbol}`;
    const poolTokenName = `Split ${cTokenName} Pool LP Token`;

    console.log("Token symbol: ", poolTokenSymbol);
    console.log("Token name: ", poolTokenName);
    console.log("cTokenAddress address used: ", cTokenAddress);
    console.log("SplitPoolFactory address used: ", splitPoolFactoryAddress);
    console.log("BFactory address used: ", balancerPoolFactoryAddress);
    console.log("YieldComponentToken address used: ", yieldComponentTokenAddress);
    console.log("CapitalComponentToken address used: ", capitalComponentTokenAddress);

    const SplitPoolFactoryFactory = await bre.ethers.getContractFactory("SplitPoolFactory");
    const splitPoolFactory = SplitPoolFactoryFactory.attach(splitPoolFactoryAddress);

    const tokenInfos: PoolTokenInfo[] = [
      {
        symbol: "COMP",
        address: deployment.compAddress,
        weight: 1,
        priceFrom: {
          symbol: "COMP",
          multiBy: 1,
        },
      },
      {
        symbol: cTokenSymbol,
        weight: 1,
        address: cTokenAddress,
        priceFrom: {
          symbol: cTokenSymbol,
          multiBy: 1,
        },
      },
      // Assume split tokens are worth 1/2 the full token each.
      {
        symbol: `y${cTokenSymbol}`,
        address: yieldComponentTokenAddress,
        weight: 16,
        priceFrom: {
          symbol: cTokenSymbol,
          multiBy: 2,
        },
      },
      {
        symbol: `c${cTokenSymbol}`,
        address: capitalComponentTokenAddress,
        weight: 16,
        priceFrom: {
          symbol: cTokenSymbol,
          multiBy: 2,
        },
      },
      {
        symbol: "USDC",
        address: deployment.usdcAddress,
        weight: 16,
        priceFrom: {
          symbol: "USDC",
          multiBy: 1,
        },
      },
    ];

    const tokenBalances = await calculateTokenBalances(dollarAmount, tokenInfos);

    const newSplitPoolArgs: [string, PoolParams, Rights] = [
      balancerPoolFactoryAddress,
      {
        poolTokenSymbol,
        poolTokenName,
        constituentTokens: tokenInfos.map(info => info.address),
        tokenBalances,
        tokenWeights: tokenInfos.map(token => toWei(token.weight)),
        swapFee: "30000000000000000",
      },
      DEFAULT_RIGHTS,
    ];

    let crpAddress = deployment.splitPools[cTokenAddress].poolAddress;
    if (!crpAddress && args.shouldUseExistingDeployment) {
      console.warn("Could not find existing Configurable Rights Pool deployment");
      return;
    }
    if (!args.shouldUseExistingDeployment) {
      const txn = await splitPoolFactory.newSplitPool(newSplitPoolArgs[0], newSplitPoolArgs[1], newSplitPoolArgs[2]);
      console.log("Creating Configurable Rights Pool. Txn hash: ", txn.hash);
      const txReceipt = await txn.wait();
      const result = txReceipt.events?.find((event: any) => event.event === "LogNewSplitPool")?.args;
      crpAddress = (result ?? [])[1];
    }

    console.log("Configurable Rights Pool deployed to:", crpAddress);
    logSplitPoolArgs(newSplitPoolArgs);
    if (!args.shouldSkipCreatePool) {
      const tokens = tokenInfos.map(tokenInfo => Erc20Factory.attach(tokenInfo.address));
      if (!args.shouldSkipApprovals) {
        for (const token of tokens) {
          console.log("Setting max approval on token: ", token.address);
          await token.approve(crpAddress, ethers.constants.MaxUint256);
        }
      }
      const accountAddress = (await bre.ethers.getSigners())[0].address;
      const accountTokenBalances = await Promise.all(tokens.map(token => token.balanceOf(accountAddress)));
      let insufficientBalance = false;
      for (let i = 0; i < tokenBalances.length; i++) {
        const diff = accountTokenBalances[i].mul(-1).add(tokenBalances[i]);
        console.log(
          `Need ${tokenBalances[i]} of ${tokenInfos[i].symbol}, and have ${accountTokenBalances[
            i
          ].toString()}. Diff: ${diff.toString()}`,
        );
        if (diff.gt(0)) {
          insufficientBalance = true;
        }
      }
      if (insufficientBalance) {
        console.warn("Insuffient balance to continue");
        return;
      }
      const ConfigurableRightsPoolFactory = await bre.ethers.getContractFactory("ConfigurableRightsPool", {
        libraries: deployment.libraries,
      });
      const configurableRightsPool = ConfigurableRightsPoolFactory.attach(crpAddress);
      const txn = await configurableRightsPool["createPool(uint256)"](toWei(args.initialSupply), {
        gasLimit: "10000000",
      });
      console.log("Calling createPool(). Txn hash: ", txn.hash);
      try {
        await txn.wait();
        console.log("Created pool successfully.");
      } catch (err) {
        console.warn(err);
      }
    }
  });

// TODO: Need to deploy on Kovan to properly test the COMP rewards.
// TODO: Need to createPool() with the right parameters.
