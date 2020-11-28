// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity 0.6.12;

contract Migrations {
  address public owner;
  uint256 public lastCompletedMigration;

  constructor() public {
    owner = msg.sender;
  }

  modifier restricted() {
    if (msg.sender == owner) _;
  }

  /**
   * @notice set lastCompletedMigration variable
   * @param completed - id of the desired migration level
   */
  function setCompleted(uint256 completed) external restricted {
    lastCompletedMigration = completed;
  }
}
