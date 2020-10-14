//SPDX-License-Identifier: MIT
pragma solidity ^0.6.8;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

import "./interfaces/PriceOracle.sol";
import "./SplitVault.sol";
import "./VaultControlled.sol";
import "./lib/PriceUtils.sol";
import "./lib/ERC20Base.sol";
import "./lib/DSMath.sol";

contract YieldComponentToken is ERC20Base, VaultControlled {
  using SafeMath for uint256;

  /*
   *  Storage
   */
  address public fullToken;
  uint8 private fullTokenDecimals;
  PriceOracle private priceOracle;

  /// @dev The yield component token balances
  mapping(address => uint256) public balances;
  /// @dev The price from the last yield payout for an address
  mapping(address => uint256) public lastPrices;

  constructor(
    string memory name,
    string memory symbol,
    address _fullToken,
    address priceOracleAddress,
    address splitVaultAddress
  ) public ERC20Base(name, symbol) VaultControlled(splitVaultAddress) {
    priceOracle = PriceOracle(priceOracleAddress);
    fullToken = _fullToken;
    // Make sure the fullToken has implemented the decimals method before allowing init.
    fullTokenDecimals = ERC20(fullToken).decimals();
  }

  /// @dev Mint new yield component tokens, computing the amount from an amount of full tokens
  /// @param account address of account to mint tokens to
  /// @param amountOfFull amount of full tokens to use for the calculation
  function mintFromFull(address account, uint256 amountOfFull) public onlyVaultOrOwner {
    uint256 currPrice = priceOracle.getPrice(fullToken);
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
    balances[account] = balances[account].add(amount);

    // Update the total supply
    _totalSupply = _totalSupply.add(amount);

    // A mint is effectively a transfer
    emit Transfer(address(0), account, amount);
  }

  /// @dev Returns the amount of tokens owned by `account`.
  function balanceOf(address account) public override view returns (uint256) {
    return balances[account];
  }

  /// @dev Burn tokens if the contract owner
  /// @param account address of account to burn tokens from
  /// @param amount amount of tokens to burn
  function burn(address account, uint256 amount) public onlyVaultOrOwner {
    require(account != address(0), "ERC20: burn from the zero address");

    // First payout any accrued yield
    _payoutYield(account);

    // Then update balances.
    balances[account] = balances[account].sub(amount, "ERC20: burn amount exceeds balance");

    // Update the total supply
    _totalSupply = _totalSupply.sub(amount);

    // A burn is effectively a transfer
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

    balances[sender] = balances[sender].sub(amount, "ERC20: transfer amount exceeds balance");
    balances[recipient] = balances[recipient].add(amount);

    emit Transfer(sender, recipient, amount);
  }

  /// @dev Internal yield payout function that computes the yield and transfers it to the owner
  /// @param owner Owner and recipient of the accrued yield
  function _payoutYield(address owner) private {
    uint256 lastPrice = lastPrices[owner];
    uint256 currPrice = priceOracle.getPrice(fullToken);
    // Make sure the last price is always updated when paying out yield.
    lastPrices[owner] = currPrice;
    uint256 payoutAmount = calculatePayoutAmount(owner, currPrice, lastPrice);
    if (payoutAmount == 0) {
      return;
    }
    // Call the payout function on the SplitVault contract, just for the yield
    splitVault.payout(payoutAmount, fullToken, owner);
  }

  /// @dev Simplest public method for calculating the outstanding yield for a yield token holder
  /// @param owner Owner and future recipient of the accrued yield
  /// @return The payout amount denoted in fullToken
  function calculatePayoutAmount(address owner) public view returns (uint256) {
    uint256 lastPrice = lastPrices[owner];
    uint256 currPrice = priceOracle.getPrice(fullToken);
    return calculatePayoutAmount(owner, currPrice, lastPrice);
  }

  /// @dev Public method for calculating the outstanding yield for a yield token holder and a new fullToken price
  /// @param owner Owner and future recipient of the accrued yield
  /// @param currPrice The price of fullToken to use for the calculation. Must be more than internally stored lastPrice
  /// @return The payout amount denoted in fullToken
  function calculatePayoutAmount(
    address owner,
    uint256 currPrice,
    uint256 lastPrice
  ) public view returns (uint256) {
    uint256 balance = balances[owner];
    if (balance == 0 || lastPrice == 0) {
      return 0;
    }
    uint256 payoutAmount = calculatePayoutAmount(balance, currPrice, lastPrice, fullTokenDecimals);
    return payoutAmount;
  }

  /// @dev Pure function for calculating the outstanding yield for a yield token holder and a new fullToken price
  /// @param balance The balance of yield component tokens for this address.
  /// @param currPrice The current price of fullToken to use for the calculation. Must be more than `lastPrice`.
  /// @param lastPrice The last price of fullToken to use for the calculation. Must be less than `currPrice`.
  /// @param tokenDecimals The decimal precision of the fullToken `balance`.
  /// @return The payout amount denoted in fullToken
  function calculatePayoutAmount(
    uint256 balance,
    uint256 currPrice,
    uint256 lastPrice,
    uint8 tokenDecimals
  ) public pure returns (uint256) {
    // Compare to old price
    uint256 priceDiff = currPrice.sub(lastPrice, "Price has decreased");
    if (priceDiff == 0) {
      return 0;
    }
    uint256 increasePercentage = DSMath.wdiv(priceDiff, lastPrice);
    uint256 fullTokenPayoutWads = DSMath.wdiv(DSMath.wmul(increasePercentage, balance), currPrice);
    uint256 payoutAmount = PriceUtils.fromWadToDecimals(fullTokenPayoutWads, tokenDecimals);
    return payoutAmount;
  }
}
