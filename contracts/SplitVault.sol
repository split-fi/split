//SPDX-License-Identifier: MIT
pragma solidity ^0.6.8;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "./CapitalComponentToken.sol";
import "./YieldComponentToken.sol";

contract SplitVault is Ownable {
  /*
   *  Storage
   */
  struct ComponentSet {
    address yieldToken;
    address capitalToken;
  }
  mapping(address => ComponentSet) public tokensToComponents;

  constructor() public {}

  /// @dev Retrieve the componentSet for a given token
  /// @param tokenAddress for which to fetch the associated componentSet
  function getComponentSet(address tokenAddress) public view returns (ComponentSet memory) {
    return tokensToComponents[tokenAddress];
  }

  /// @dev Allows Split protocol governance to add support for new tokens
  /// @param tokenAddress the address of token to support
  /// @param yieldTokenAddress the corresponding yieldERC20Comp token address
  /// @param capitalTokenAddress the corresponding capitalERC20Comp token address
  function add(
    address tokenAddress,
    address yieldTokenAddress,
    address capitalTokenAddress
  ) public onlyOwner {
    tokensToComponents[tokenAddress] = ComponentSet({
      yieldToken: yieldTokenAddress,
      capitalToken: capitalTokenAddress
    });
  }

  /// @dev Allows Split protocol governance to remove support for new tokens
  /// @param tokenAddress the address of token to remove support for
  function remove(address tokenAddress) public onlyOwner {
    delete tokensToComponents[tokenAddress];
  }

  /// @dev Allows a holder of a whitelisted Compound token to split it into it's corresponding Yield and Capital tokens
  /// @param amount of tokens to split
  /// @param tokenAddress the address of token to split
  function split(uint256 amount, address tokenAddress) public {
    ComponentSet memory componentSet = tokensToComponents[tokenAddress];
    if (componentSet.yieldToken == address(0) || componentSet.capitalToken == address(0)) {
      revert("Attempted to split unsupported token");
    }
    // Don't mint tokens if the transferFrom was not successful
    require(IERC20(tokenAddress).transferFrom(msg.sender, address(this), amount), "Failed to transfer tokens to SplitVault.");
    CapitalComponentToken(componentSet.capitalToken).mintFromFull(msg.sender, amount);
    YieldComponentToken(componentSet.yieldToken).mintFromFull(msg.sender, amount);
    emit Split(tokenAddress, amount);
  }
  
  /// @dev Allows a holder of both Yield and Capital tokens to combine them into the underlying full tokens
  /// @param amount of tokens to recombine
  /// @param tokenAddress is the address of token to recombine
  function combine(uint256 amount, address tokenAddress) public {
    ComponentSet memory componentSet = tokensToComponents[tokenAddress];
    if (componentSet.yieldToken == address(0) || componentSet.capitalToken == address(0)) {
      revert("Attempted to recombine unsupported token");
    }
    CapitalComponentToken(componentSet.capitalToken).burn(msg.sender, amount);
    YieldComponentToken(componentSet.yieldToken).burn(msg.sender, amount);
    // Payout is calculated and executed by the individual token contracts
    emit Combine(tokenAddress, amount);
  }

  /// @dev Allows component token implementation to send tokens in the vaul
  /// @param amount of tokens to payout
  /// @param tokenAddress the tokens to send
  /// @param recipient address of payout recipient
  function payout(
    uint256 amount,
    address tokenAddress,
    address recipient
  ) public {
    ComponentSet memory componentSet = tokensToComponents[tokenAddress];
    if (componentSet.yieldToken == address(0) || componentSet.capitalToken == address(0)) {
      revert("Attempted to request a payout for an unsupported token");
    }
    if (msg.sender != componentSet.yieldToken && msg.sender != componentSet.capitalToken) {
      revert("Payout can only be called by the corresponding yield or capital token");
    }
    // Revert if the transfer was not successful
    require(IERC20(tokenAddress).transfer(recipient, amount), "Failed to transfer tokens from SplitVault.");
  }

  /// @dev Emitted when component tokens are combined into a full token
  event Combine(address indexed tokenAddress, uint256 amount);

  /// @dev Emitted when full tokens are split into component tokens
  event Split(address indexed tokenAddress, uint256 amount);
}
