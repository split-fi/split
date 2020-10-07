//SPDX-License-Identifier: Unlicense
pragma solidity ^0.6.8;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/access/Ownable.sol";

contract SplitVaultComp is Ownable {
  /*
   *  Storage
   */
  struct ComponentSet {
    address yieldToken;
    address capitalToken;
  }
  mapping(address => ComponentSet) public tokensToComponents;

  constructor() public {}

  /// @dev Retrieve the componentSet for a given CToken
  /// @param cTokenAddress for which to fetch the associated componentSet
  function getComponentSet(address cTokenAddress) public view returns (ComponentSet memory) {
    return tokensToComponents[cTokenAddress];
  }

  /// @dev Allows Split protocol governance to add support for new Compound tokens
  /// @param cTokenAddress the address of CToken to support
  /// @param yieldTokenAddress the corresponding yieldERC20Comp token address
  /// @param capitalTokenAddress the corresponding capitalERC20Comp token address
  function add(
    address cTokenAddress,
    address yieldTokenAddress,
    address capitalTokenAddress
  ) public onlyOwner {
    tokensToComponents[cTokenAddress] = ComponentSet({
      yieldToken: yieldTokenAddress,
      capitalToken: capitalTokenAddress
    });
  }

  /// @dev Allows a holder of a whitelisted Compound token to split it into it's corresponding Yield and Capital tokens
  /// @param amount of CTokens to split
  /// @param cTokenAddress the address of CToken to split
  function split(uint256 amount, address cTokenAddress) public {
    ComponentSet memory componentSet = tokensToComponents[cTokenAddress];
    if (componentSet.yieldToken == address(0) || componentSet.capitalToken == address(0)) {
      revert("Attempted to split unsupported token");
    }
    // TODO(fabio): Withdraw C-token from msg.sender to vault
    // TODO(fabio): Mint YieldERC20 & CapitalERC20 tokens to msg.sender
  }

  /// @dev Allows a holder of both Yield and Capital tokens to recombine them into the underlying Compound tokens
  /// @param amount of CTokens to recombine
  /// @param cTokenAddress is the address of CToken to recombine
  function recombine(uint256 amount, address cTokenAddress) public {
    ComponentSet memory componentSet = tokensToComponents[cTokenAddress];
    if (componentSet.yieldToken == address(0) || componentSet.capitalToken == address(0)) {
      revert("Attempted to recombine unsupported token");
    }
    // TODO(fabio): burn `amount` YieldERC20 & CapitalERC20 tokens
    // TODO(fabio): Transfer `amount` C-tokens from vault to msg.sender
  }

  /// @dev Allows the YieldERC20 token to request a payout to a specific YieldTokenHolder of their accrued C-tokens
  /// @param amount of CTokens to payout
  /// @param recipient address of payout recipient
  function payout(
    uint256 amount,
    address cTokenAddress,
    address recipient
  ) public {
    ComponentSet memory componentSet = tokensToComponents[cTokenAddress];
    if (componentSet.yieldToken == address(0) || componentSet.capitalToken == address(0)) {
      revert("Attempted to request a payout for an unsupported token");
    }
    if (msg.sender != componentSet.yieldToken) {
      revert("Payout can only be called by the corresponding yield token");
    }
    // TODO(fabio): Transfer `amount` C-tokens from vault to recipient
  }
}
