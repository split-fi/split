pragma solidity ^0.6.8;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/math/SafeMath.sol";

import "./DSMath.sol";

library PriceUtils {
  using SafeMath for uint256;

  /// @dev Calculate the value of the full token in the underlying and convert that value to wads.
  ///      A wad is a decimal number with 18 digits of precision.
  /// @param fullTokenPrice The current price of a full token in an underlying token, expressed in 18 decimals
  /// @param amountOfFull The number of full tokens
  /// @param fullTokenDecimals The decimals of the full token ERC20
  function fullTokenValueInWads(
    uint256 fullTokenPrice,
    uint256 amountOfFull,
    uint8 fullTokenDecimals
  ) internal pure returns (uint256) {
    if (18 >= fullTokenDecimals) {
      uint256 decimalAdjustment = 18 - fullTokenDecimals;
      uint256 adjustedFullAmount = amountOfFull.mul(10**decimalAdjustment);
      return DSMath.wmul(fullTokenPrice, adjustedFullAmount);
    } else {
      uint256 decimalAdjustment = fullTokenDecimals - 18;
      uint256 adjustedFullAmount = amountOfFull.div(10**decimalAdjustment);
      return DSMath.wmul(fullTokenPrice, adjustedFullAmount);
    }
  }

  function fromWadToDecimals(uint256 wadAmount, uint256 targetDecimals) internal pure returns (uint256) {
    if (targetDecimals >= 18) {
      uint256 decimalAdjustment = targetDecimals - 18;
      return wadAmount.mul(10**decimalAdjustment);
    } else {
      uint256 decimalAdjustment = 18 - targetDecimals;
      return wadAmount.div(10**decimalAdjustment);
    }
  }
}
