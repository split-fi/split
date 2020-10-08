// //SPDX-License-Identifier: MIT
pragma solidity ^0.6.8;
pragma experimental ABIEncoderV2;

interface PriceOracle {
  /// @dev Get the price of token in another token (eg. cBAT / BAT) with 18 decimal places
  function getPrice(address token) external view returns (uint256);
}
