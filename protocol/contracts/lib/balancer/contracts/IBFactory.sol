// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity 0.6.12;

interface IBPool {
  function rebind(
    address token,
    uint256 balance,
    uint256 denorm
  ) external;

  function setSwapFee(uint256 swapFee) external;

  function setPublicSwap(bool publicSwap) external;

  function bind(
    address token,
    uint256 balance,
    uint256 denorm
  ) external;

  function unbind(address token) external;

  function gulp(address token) external;

  function isBound(address token) external view returns (bool);

  function getBalance(address token) external view returns (uint256);

  function totalSupply() external view returns (uint256);

  function getSwapFee() external view returns (uint256);

  function isPublicSwap() external view returns (bool);

  function getDenormalizedWeight(address token) external view returns (uint256);

  function getTotalDenormalizedWeight() external view returns (uint256);

  // solhint-disable-next-line func-name-mixedcase
  function EXIT_FEE() external view returns (uint256);

  function calcPoolOutGivenSingleIn(
    uint256 tokenBalanceIn,
    uint256 tokenWeightIn,
    uint256 poolSupply,
    uint256 totalWeight,
    uint256 tokenAmountIn,
    uint256 swapFee
  ) external pure returns (uint256 poolAmountOut);

  function calcSingleInGivenPoolOut(
    uint256 tokenBalanceIn,
    uint256 tokenWeightIn,
    uint256 poolSupply,
    uint256 totalWeight,
    uint256 poolAmountOut,
    uint256 swapFee
  ) external pure returns (uint256 tokenAmountIn);

  function calcSingleOutGivenPoolIn(
    uint256 tokenBalanceOut,
    uint256 tokenWeightOut,
    uint256 poolSupply,
    uint256 totalWeight,
    uint256 poolAmountIn,
    uint256 swapFee
  ) external pure returns (uint256 tokenAmountOut);

  function calcPoolInGivenSingleOut(
    uint256 tokenBalanceOut,
    uint256 tokenWeightOut,
    uint256 poolSupply,
    uint256 totalWeight,
    uint256 tokenAmountOut,
    uint256 swapFee
  ) external pure returns (uint256 poolAmountIn);

  function getCurrentTokens() external view returns (address[] memory tokens);
}

interface IBFactory {
  function newBPool() external returns (IBPool);

  function setBLabs(address b) external;

  function collect(IBPool pool) external;

  function isBPool(address b) external view returns (bool);

  function getBLabs() external view returns (address);
}
