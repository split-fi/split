//SPDX-License-Identifier: AGPL-3.0
pragma solidity 0.6.12;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

import "./interfaces/PriceOracle.sol";
import "./interfaces/CTokenInterface.sol";

contract CTokenPriceOracle is PriceOracle {
  using SafeMath for uint256;

  constructor() public {}

  /// @dev Get the exchange rate of one cToken to one underlying token in wads
  function getPrice(address cTokenAddress) external view override returns (uint256) {
    CTokenInterface cToken = CTokenInterface(cTokenAddress);
    return cToken.exchangeRateStored();
  }
}
