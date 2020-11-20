// //SPDX-License-Identifier: AGPL-3.0
pragma solidity ^0.6.8;
pragma experimental ABIEncoderV2;

import "../interfaces/PriceOracle.sol";

contract PriceOracleMock is PriceOracle {
  constructor() public {}

  uint256 private price = 10**18;

  function getPrice(address token) external view override returns (uint256) {
    // make compiler happy.
    token;
    return price;
  }

  function setPrice(uint256 _price) public {
    price = _price;
  }
}
