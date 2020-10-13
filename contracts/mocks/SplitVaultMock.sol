// //SPDX-License-Identifier: MIT
pragma solidity ^0.6.8;
pragma experimental ABIEncoderV2;

contract SplitVaultMock {
  constructor() public {}

  struct PayoutCall {
    uint256 amount;
    address tokenAddress;
    address recipient;
  }

  PayoutCall[] public payoutCalls;

  function payout(
    uint256 amount,
    address tokenAddress,
    address recipient
  ) public {
    payoutCalls.push(PayoutCall({ amount: amount, tokenAddress: tokenAddress, recipient: recipient }));
  }

  function getPayoutCalls() public view returns (PayoutCall[] memory) {
    return payoutCalls;
  }

  function reset() public {
    delete payoutCalls;
  }
}
