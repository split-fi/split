//SPDX-License-Identifier: MIT
pragma solidity ^0.6.8;
pragma experimental ABIEncoderV2;

import "../lib/PriceUtils.sol";

contract PriceUtilsMock {
  function testFullTokenValueInWads(
    uint256 fullTokenPrice,
    uint256 amountOfFull,
    uint8 fullTokenDecimals
  ) external pure returns (uint256) {
    return PriceUtils.fullTokenValueInWads(fullTokenPrice, amountOfFull, fullTokenDecimals);
  }
}
