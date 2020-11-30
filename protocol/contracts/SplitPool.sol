//SPDX-License-Identifier: AGPL-3.0
pragma solidity 0.6.12;
pragma experimental ABIEncoderV2;

import "./lib/balancer/configurable-rights-pool/contracts/ConfigurableRightsPool.sol";
import "./lib/balancer/configurable-rights-pool/libraries/RightsManager.sol";
import "./SplitVault.sol";

// TODO
// Take in a vault address
// Make ownable
// Get a full token as an input and read the component tokens from the vault
// Make it be a pool that is 1/3 tokenA, 1/3 tokenB, 1/3 baseToken (DAI/USDC/ETH)
// New join pool
// - Joining with the fullToken only.
// New exit pool
// - Exit with as many full tokens, and the remainder.
// - Exit with as many full tokens as possible, and keep the remainder in.
// Example: https://github.com/balancer-labs/configurable-rights-pool/blob/master/contracts/templates/ElasticSupplyPool.sol#L18

contract SplitPool is ConfigurableRightsPool {
  address public fullToken;
  SplitVault private splitVault;

  // Event declarations

  // Have to redeclare in the subclass, to be emitted from this contract
  event LogCall(bytes4 indexed sig, address indexed caller, bytes data) anonymous;

  event LogJoin(address indexed caller, address indexed tokenIn, uint256 tokenAmountIn);

  event LogExit(address indexed caller, address indexed tokenOut, uint256 tokenAmountOut);

  function constructPoolParams(
    string memory poolTokenSymbol,
    string memory poolTokenName,
    address splitVaultAddress,
    address fullTokenAddress,
    address quoteTokenAddress
  ) private view returns (ConfigurableRightsPool.PoolParams memory) {
    SplitVault.ComponentSet memory componentSet = SplitVault(splitVaultAddress).getComponentSet(fullTokenAddress);
    address[] memory constituentTokens = new address[](3);
    constituentTokens[0] = componentSet.yieldToken;
    constituentTokens[1] = componentSet.capitalToken;
    constituentTokens[2] = quoteTokenAddress;
    uint256[] memory tokenBalances = new uint256[](3);
    tokenBalances[0] = 0;
    tokenBalances[1] = 0;
    tokenBalances[2] = 0;
    uint256[] memory tokenWeights = new uint256[](3);
    tokenBalances[0] = 1;
    tokenBalances[1] = 1;
    tokenBalances[2] = 1;
    return
      ConfigurableRightsPool.PoolParams({
        poolTokenSymbol: poolTokenSymbol,
        poolTokenName: poolTokenName,
        constituentTokens: constituentTokens,
        tokenBalances: tokenBalances,
        tokenWeights: tokenWeights,
        swapFee: 0
      });
  }

  /**
   * @notice Construct a new Configurable Rights Pool (wrapper around BPool)
   * @param poolTokenSymbol – token symbol for the balancer pool
   * @param poolTokenName – token name for the balancer pool
   * @param splitVaultAddress – address of a SplitVault deployment
   * @param fullTokenAddress – address of the fullToken which the split represent
   * @param quoteTokenAddress – address of the token which the splits trade against
   * @param factoryAddress - the BPoolFactory used to create the underlying pool
   * @param rightsParams - Set of permissions we are assigning to this smart pool
   */
  constructor(
    string memory poolTokenSymbol,
    string memory poolTokenName,
    address splitVaultAddress,
    address fullTokenAddress,
    address quoteTokenAddress,
    address factoryAddress,
    RightsManager.Rights memory rightsParams
  )
    public
    ConfigurableRightsPool(
      factoryAddress,
      constructPoolParams(poolTokenSymbol, poolTokenName, splitVaultAddress, fullTokenAddress, quoteTokenAddress),
      rightsParams
    )
  {
    splitVault = SplitVault(splitVaultAddress);
    fullToken = fullTokenAddress;
  }

  // TODO: How to extract the accumulated yield from the underlying BPool?

  /// Specify the amount of pool tokens desired and have the contract pull the correct tokens from you.
  /// Find the ratios required
  /// Amount of full token vs. quote token to take depends on the value of swapWithQuoteToken
  /// Split the full tokens
  /// Swap the component tokens with each other, or with the quote token to get the correct ratio
  /// Supply and return LP tokens
  function joinswapAndSplitPoolAmountOut(
    uint256 poolAmountOut,
    uint256[] calldata maxAmountsIn,
    bool swapWithQuoteToken
  ) external returns (uint256 fullTokenAmountIn) {}

  /// Specify the amount of full tokens to deposit
  /// Split the full tokens
  /// Find the correct ratio of component tokens in the pool
  /// Swap the component tokens, either with each other or with the quote token to achieve the right ratio
  /// Supply and return LP tokens
  function joinswapAndSplitExternAmountIn(
    uint256 fullTokenAmountIn,
    uint256 minPoolAmountOut,
    bool swapWithQuoteToken
  ) external returns (uint256 poolAmountOut) {}

  /// Redeem some amount of LP tokens to receive component tokens and quote tokens.
  /// Swap the component tokens to make the amounts equal
  /// Combine the component tokens
  /// Return fullTokens, quoteTokens
  function exitswapAndCombinePoolAmountIn(
    uint256 poolAmountIn,
    uint256[] calldata minAmountsOut,
    bool swapWithQuoteToken
  ) external returns (uint256 fullTokenAmountOut) {}

  /// Specify the amount of full tokens you want back and have the contract withdraw a correponding amount of LP tokens.
  /// Find the amount of component tokens required
  /// Withdraw an equal amount
  /// Combine them
  /// Return fullTokens, quoteTokens
  function exitswapAndCombineExternAmountOut(
    uint256 fullTokenAmountOut,
    uint256 maxPoolAmountIn,
    bool swapWithQuoteToken
  ) external returns (uint256 poolAmountIn) {}
}
