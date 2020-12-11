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
  address private _splitVaultAddress;
  mapping(address => bool) private _isSplitPool;

  event LogNewSplitPool(address indexed caller, address indexed pool);

  function newSplitPool(
    address factoryAddress,
    ConfigurableRightsPool.PoolParams calldata poolParams,
    RightsManager.Rights calldata rights
  ) external onlyOwner returns (ConfigurableRightsPool) {
    ConfigurableRightsPool crp = CRPFactory(_crpFactoryAddress).newCrp(factoryAddress, poolParams, rights);
    emit LogNewSplitPool(msg.sender, address(crp));
    _isSplitPool[address(crp)] = true;
    return crp;
  }

  /**
   * @notice Construct a wrapper around a CRPFactory
   * @param crpFactoryAddress – address of the underlying Configuring Rights Pool Factory
   */
  constructor(address crpFactoryAddress) public {
    _crpFactoryAddress = crpFactoryAddress;
  }

  /// Specify the amount of full tokens to deposit
  /// Split the full tokens
  /// Find the correct ratio of component tokens in the pool
  /// Swap the component tokens, either with each other or with the quote token to achieve the right ratio
  /// Supply and return LP tokens
  function joinswapAndSplitExternAmountIn(
    address crpPoolAddress,
    address splitVaultAddress,
    address fullTokeAddress,
    uint256 fullTokenAmountIn,
    uint256 minPoolAmountOut
  ) external returns (uint256 poolAmountOut) {
    require(
      IERC20(fullTokeAddress).transferFrom(msg.sender, address(this), fullTokenAmountIn),
      "Failed to transfer tokens to SplitPool"
    );
    require(_isSplitPool[crpPoolAddress], "Can only join Split pools");
    uint256 componentTokenAmount = SplitVault(splitVaultAddress).split(fullTokenAmountIn, fullTokeAddress);
    SplitVault.ComponentSet memory componentSet = SplitVault(splitVaultAddress).getComponentSet(fullTokeAddress);
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
    require(minPoolAmountOut >= amountOut, "ERR_LIMIT_OUT");
    return amountOut;
  }

  /**
   * @notice Check to see if a given address is a CRP
   * @param addr - address to check
   * @return boolean indicating whether it is a CRP
   */
  function isSplitPool(address addr) external view returns (bool) {
    return _isSplitPool[addr];
  }
}
