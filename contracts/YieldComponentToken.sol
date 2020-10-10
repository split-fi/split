//SPDX-License-Identifier: MIT
pragma solidity ^0.6.8;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

import "./interfaces/PriceOracle.sol";
import "./SplitVault.sol";
import "./lib/PriceUtils.sol";
import "./lib/ERC20Base.sol";
import "./lib/DSMath.sol";

contract YieldComponentToken is ERC20Base, Ownable {
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
  ) public ERC20Base(name, symbol) {
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
    _mint(account, yieldTokenAmount);
  }

  /// @dev Mint new tokens if the contract owner
  /// @param account address of account to mint tokens to
  /// @param amount amount of tokens to mint
  function mint(address account, uint256 amount) public onlyOwner {
    _mint(account, amount);
  }

  function _mint(address account, uint256 amount) private {
    require(account != address(0), "ERC20: mint to the zero address");
    // First payout any accrued yield
    _payoutYield(account);

    // Update account information with updated balance
    accounts[account].balance = accounts[account].balance.add(amount);

    // Update the total supply
    _totalSupply = _totalSupply.add(amount);

    // A mint is effectively a transfer
    emit Transfer(address(0), account, amount);
  }

  /// @dev Returns the amount of tokens owned by `account`.
  function balanceOf(address account) public override view returns (uint256) {
    return accounts[account].balance;
  }

  /// @dev Burn tokens if the contract owner
  /// @param account address of account to burn tokens from
  /// @param amount amount of tokens to burn
  function burn(address account, uint256 amount) public onlyOwner {
    require(account != address(0), "ERC20: burn from the zero address");

    // First payout any accrued yield
    _payoutYield(account);

    // Then Update balances.
    accounts[account].balance = accounts[account].balance.sub(amount);

    // Update the total supply
    _totalSupply = _totalSupply.sub(amount);

    // A mint is effectively a transfer
    emit Transfer(account, address(0), amount);
  }

  /// @dev Withdraw any yield accrued to msg.sender since the last withdrawal
  function withdrawYield() public {
    _payoutYield(_msgSender());
  }

  /*
   * Override the default ERC20 imtplementations of transfer & transferFrom
   */

  /// @dev Moves `amount` tokens from the caller's account to `recipient`.
  /// @param recipient The receiver of the transfer
  /// @param amount The amount to transfer
  /// @return Returns a boolean value indicating whether the operation succeeded.
  function transfer(address recipient, uint256 amount) public override returns (bool) {
    _transfer(_msgSender(), recipient, amount);
    return true;
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
  ) public override returns (bool) {
    _transfer(sender, recipient, amount);
    _approve(
      sender,
      _msgSender(),
      _allowances[sender][_msgSender()].sub(amount, "ERC20: transfer amount exceeds allowance")
    );
    return true;
  }

  function _transfer(
    address sender,
    address recipient,
    uint256 amount
  ) private {
    require(sender != address(0), "ERC20: transfer from the zero address");
    require(recipient != address(0), "ERC20: transfer to the zero address");

    _payoutYield(sender);
    _payoutYield(recipient);

    accounts[sender].balance = accounts[sender].balance.sub(amount, "ERC20: transfer amount exceeds balance");
    accounts[recipient].balance = accounts[recipient].balance.add(amount);

    emit Transfer(sender, recipient, amount);
  }

  /// @dev Internal yield payout function that computes the yield and transfers it to the owner
  /// @param owner Owner and recipient of the accrued yield
  function _payoutYield(address owner) private {
    Account memory acc = accounts[owner];
    if (acc.lastPrice == 0 || acc.balance == 0) {
      return;
    }
    uint256 currPrice = priceOracle.getPrice(fullToken);
    // Compare to old price
    // NOTE(fabio): We assume here that if the price changed, it is strictly increasing
    uint256 priceDiff = currPrice.sub(acc.lastPrice, "Price has decreased");
    if (priceDiff == 0) {
      return; // Noop if the price hasn't changed
    }
    uint256 increasePercentage = DSMath.wdiv(priceDiff, acc.lastPrice);
    uint256 fullTokenPayoutWads = DSMath.wdiv(DSMath.wmul(increasePercentage, acc.balance), currPrice);
    uint256 payoutAmount = PriceUtils.fromWadToDecimals(fullTokenPayoutWads, ERC20(fullToken).decimals());
    // Call the payout function on the SplitVault contract, just for the yield
    splitVault.payout(payoutAmount, fullToken, owner);
    // Make sure the last price is always update when paying out yield.
    accounts[owner].lastPrice = currPrice;
  }
}
