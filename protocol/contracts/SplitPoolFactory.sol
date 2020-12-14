//SPDX-License-Identifier: AGPL-3.0
pragma solidity 0.6.12;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "./lib/balancer/configurable-rights-pool/contracts/ConfigurableRightsPool.sol";
import "./lib/balancer/configurable-rights-pool/contracts/CRPFactory.sol";
import "./lib/balancer/configurable-rights-pool/libraries/RightsManager.sol";
import "./SplitVault.sol";

/**
 * A wrapper around a CRPFactory to create pools configured for Split tokens.
 */
contract SplitPoolFactory is Ownable {
  address private _crpFactoryAddress;
  mapping(address => bool) private _isSplitPool;

  event LogNewSplitPool(address indexed caller, address indexed pool);

  /// @notice Create a new ConfigurableRightsPool using the underlying factory
  /// @param factoryAddress BFactory instance used to create the underlying pool
  /// @param poolParams struct containing the names, tokens, weights, balances, and swap fee
  /// @param rights struct of permissions, configuring this CRP instance (see above for definitions)
  /// @return configurable rights pool address
  function newSplitPool(
    address factoryAddress,
    ConfigurableRightsPool.PoolParams calldata poolParams,
    RightsManager.Rights calldata rights
  ) external onlyOwner returns (ConfigurableRightsPool) {
    ConfigurableRightsPool crp = CRPFactory(_crpFactoryAddress).newCrp(factoryAddress, poolParams, rights);
    emit LogNewSplitPool(msg.sender, address(crp));
    _isSplitPool[address(crp)] = true;
    crp.setController(msg.sender);
    return crp;
  }

  /// @notice Construct a wrapper around a CRPFactory
  /// @param crpFactoryAddress address of the underlying Configuring Rights Pool Factory
  constructor(address crpFactoryAddress) public {
    _crpFactoryAddress = crpFactoryAddress;
  }

  /// @notice A shortcut to split tokens and to supply the splits to an underlying balancer pool
  /// @param crpPoolAddress address of a deployed and active Configurable Rights Pool
  /// @param splitVaultAddress address of the SplitVault to query for component tokens
  /// @param fullTokenAddress address of the token to pull and split
  /// @param fullTokenAmountIn amount of the token to pull in
  /// @param minPoolAmountOut a check to ensure that enough balancer pool tokens will be received
  /// @return The amount of pool tokens received
  function joinPoolBySplitting(
    address crpPoolAddress,
    address splitVaultAddress,
    address fullTokenAddress,
    uint256 fullTokenAmountIn,
    uint256 minPoolAmountOut
  ) external returns (uint256 poolAmountOut) {
    // Get the full tokens from msg.sender
    require(
      IERC20(fullTokenAddress).transferFrom(msg.sender, address(this), fullTokenAmountIn),
      "Failed to transfer tokens to SplitPool"
    );
    require(_isSplitPool[crpPoolAddress], "Can only join Split pools");
    // Split the full tokens that are now in custody
    IERC20(fullTokenAddress).approve(splitVaultAddress, fullTokenAmountIn);
    uint256 componentTokenAmount = SplitVault(splitVaultAddress).split(fullTokenAmountIn, fullTokenAddress);

    // Find the component tokens and add them to the balancer pool by swapping them each in.
    SplitVault.ComponentSet memory componentSet = SplitVault(splitVaultAddress).getComponentSet(fullTokenAddress);
    IERC20(componentSet.yieldToken).approve(crpPoolAddress, componentTokenAmount);
    IERC20(componentSet.capitalToken).approve(crpPoolAddress, componentTokenAmount);
    uint256 yieldPoolAmountOut = ConfigurableRightsPool(crpPoolAddress).joinswapExternAmountIn(
      componentSet.yieldToken,
      componentTokenAmount,
      0
    );
    uint256 capitalPoolAmountOut = ConfigurableRightsPool(crpPoolAddress).joinswapExternAmountIn(
      componentSet.capitalToken,
      componentTokenAmount,
      0
    );
    uint256 amountOut = yieldPoolAmountOut + capitalPoolAmountOut;
    require(amountOut >= minPoolAmountOut, "ERR_LIMIT_OUT");
    // Transfer the balancer pool tokens back to msg.sender
    require(IERC20(crpPoolAddress).transfer(msg.sender, amountOut), "Failed to transfer BP tokens back to msg.sender");
    return amountOut;
  }

  /// @notice Check to see if a given address is a SplitPool
  /// @param addr - address to check
  /// @return boolean indicating whether it is a SplitPool
  function isSplitPool(address addr) external view returns (bool) {
    return _isSplitPool[addr];
  }
}
