// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity 0.6.12;

// Needed to handle structures externally
pragma experimental ABIEncoderV2;

// Imports
import "./SplitPool.sol";
import "./SplitVault.sol";

// Contracts

contract SplitPoolFactory {
  // State variables

  // Keep a list of all Elastic Supply Pools
  mapping(address => bool) private _isSplitPool;

  // Event declarations

  // Log the address of each new smart pool, and its creator
  event LogNewSplitPool(address indexed caller, address indexed pool);

  // Function declarations

  /**
   * @notice Create a new SplitPool
   * @dev emits a LogNewSplitPool event
   * @param poolTokenSymbol – token symbol for the balancer pool
   * @param poolTokenName – token name for the balancer pool
   * @param splitVaultAddress – address of a SplitVault deployment
   * @param fullTokenAddress – address of the fullToken which the split represent
   * @param quoteTokenAddress – address of the token which the splits trade against
   * @param factoryAddress - the BFactory instance used to create the underlying pool
   * @param rights - struct of permissions, configuring this CRP instance (see above for definitions)
   */
  function newSplitPool(
    string memory poolTokenSymbol,
    string memory poolTokenName,
    address splitVaultAddress,
    address fullTokenAddress,
    address quoteTokenAddress,
    address factoryAddress,
    RightsManager.Rights calldata rights
  ) external returns (SplitPool) {
    SplitPool splitPool = new SplitPool(
      poolTokenSymbol,
      poolTokenName,
      splitVaultAddress,
      fullTokenAddress,
      quoteTokenAddress,
      factoryAddress,
      rights
    );

    emit LogNewSplitPool(msg.sender, address(splitPool));

    _isSplitPool[address(splitPool)] = true;
    splitPool.setController(msg.sender);

    return splitPool;
  }

  /**
   * @notice Check to see if a given address is an SplitPool
   * @param addr - address to check
   * @return boolean indicating whether it is an SplitPool
   */
  function isSplitPool(address addr) external view returns (bool) {
    return _isSplitPool[addr];
  }
}
