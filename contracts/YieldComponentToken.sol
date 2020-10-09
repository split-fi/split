//SPDX-License-Identifier: MIT
pragma solidity ^0.6.8;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

import "./interfaces/PriceOracle.sol";
import "./SplitVault.sol";
import "./lib/PriceUtils.sol";

contract YieldComponentToken is ERC20, Ownable {
  using SafeMath for uint256;

  /*
   *  Storage
   */
  address public fullToken;
  PriceOracle private priceOracle;
  SplitVault private splitVault;
  struct Account {
    uint256 balance;
    uint256 lastPrice;
  }
  mapping(address => Account) public accounts;

  constructor(
    string memory name,
    string memory symbol,
    address _fullToken,
    address priceOracleAddress,
    address splitVaultAddress
  ) public ERC20(name, symbol) {
    priceOracle = PriceOracle(priceOracleAddress);
    splitVault = SplitVault(splitVaultAddress);
    fullToken = _fullToken;
  }

  /// @dev Mint new yield component tokens, computing the amount from an amount of full tokens
  /// @param account address of account to mint tokens to
  /// @param amountOfFull amount of full tokens to use for the calculation
  function mintFromFull(address account, uint256 amountOfFull) public onlyOwner {
    uint256 currPrice = priceOracle.getPrice(fullToken);
    uint8 fullTokenDecimals = ERC20(fullToken).decimals();
    uint256 yieldTokenAmount = PriceUtils.fullTokenValueInWads(currPrice, amountOfFull, fullTokenDecimals);
  }

  /// @dev Mint new tokens if the contract owner
  /// @param account address of account to mint tokens to
  /// @param amount amount of tokens to mint
  function mint(address account, uint256 amount) public onlyOwner {
    uint256 currPrice = priceOracle.getPrice(fullToken);
    // First payout any accrued yield
    _payoutYield(account, currPrice);

    // Update account information with updated balance and lastPrice
    Account memory acc = accounts[account];
    accounts[account] = Account({ balance: acc.balance.add(amount), lastPrice: currPrice });

    _mint(account, amount);
  }

  /// @dev Burn tokens if the contract owner
  /// @param account address of account to burn tokens from
  /// @param amount amount of tokens to burn
  function burn(address account, uint256 amount) public onlyOwner {
    // TODO(fabio): Call _payoutYield(owner)
    // TODO(fabio): Set lastPrice for account
    _burn(account, amount);
  }

  /// @dev Withdraw any yield accrued to msg.sender since the last withdrawal
  function withdrawYield() public {
    // TODO(fabio): Check msg.sender
    // TODO(fabio): Call _payoutYield()
  }

  /*
   * Override the default ERC20 imtplementations of transfer & transferFrom
   */

  /// @dev Moves `amount` tokens from the caller's account to `recipient`.
  /// @param recipient The receiver of the transfer
  /// @param amount The amount to transfer
  /// @return Returns a boolean value indicating whether the operation succeeded.
  function transfer(address recipient, uint256 amount) public virtual override returns (bool) {
    // TODO(fabio): Call _payoutYield(msg.sender)
    // TODO(fabio): Call _payoutYield(to)
    return super.transfer(recipient, amount);
  }

  /// @dev Moves `amount` tokens from `sender` to `recipient` using the
  /// allowance mechanism. `amount` is then deducted from the caller's
  /// allowance.
  /// @param sender The sender of the funds being transferred
  /// @param recipient The receiver of the transfer
  /// @param amount The amount to transfer
  /// @return Returns a boolean value indicating whether the operation succeeded.
  function transferFrom(
    address sender,
    address recipient,
    uint256 amount
  ) public virtual override returns (bool) {
    // TODO(fabio): Call _payoutYield(sender)
    // TODO(fabio): Call _payoutYield(to)
    return super.transferFrom(sender, recipient, amount);
  }

  /// @dev Internal yield payout function that computes the yield and transfers it to the owner
  /// @param owner Owner and recipient of the accrued yield
  function _payoutYield(address owner, uint256 currPrice) private {
    Account memory acc = accounts[owner];

    // Compare to old price
    // NOTE(fabio): We assume here that if the price changed, it is strictly increasing
    uint256 priceDiff = currPrice.sub(acc.lastPrice);
    if (priceDiff == 0) {
      return; // Noop if the price hasn't changed
    }

    uint256 payoutAmount = priceDiff.mul(acc.balance);
    uint256 newBalance = acc.balance.sub(payoutAmount);

    // Update account
    accounts[owner] = Account({ balance: newBalance, lastPrice: currPrice });

    // Call the payout function on the SplitVault contract
    splitVault.payout(payoutAmount, fullToken, owner);
  }
}
