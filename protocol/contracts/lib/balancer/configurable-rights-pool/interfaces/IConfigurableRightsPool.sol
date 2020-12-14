// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity 0.6.12;

// Interface declarations

// Introduce to avoid circularity (otherwise, the CRP and SmartPoolManager include each other)
// Removing circularity allows flattener tools to work, which enables Etherscan verification
interface IConfigurableRightsPool {
  function mintPoolShareFromLib(uint256 amount) external;

  function pushPoolShareFromLib(address to, uint256 amount) external;

  function pullPoolShareFromLib(address from, uint256 amount) external;

  function burnPoolShareFromLib(uint256 amount) external;

  function totalSupply() external view returns (uint256);

  function getController() external view returns (address);
}
