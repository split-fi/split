//SPDX-License-Identifier: MIT
pragma solidity ^0.6.8;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

import "./interfaces/PriceOracle.sol";
import "./SplitVault.sol";
import "./lib/PriceUtils.sol";
import "./lib/DSMath.sol";

contract CapitalComponentToken is ERC20, Ownable {
  using SafeMath for uint256;

  address public fullToken;
  uint8 private fullTokenDecimals;
  PriceOracle private priceOracle;
  SplitVault private splitVault;

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
    // Make sure the fullToken has implemented the decimals method before allowing init.
    fullTokenDecimals = ERC20(fullToken).decimals();
  }

  /// @dev Mint new capital component tokens, but compute the amount from an amount of full tokens.
  /// @param account address of account to mint tokens to
  /// @param amountOfFull amount of full tokens to use for the calculation
  function mintFromFull(address account, uint256 amountOfFull) public onlyOwner {
    uint256 price = priceOracle.getPrice(fullToken);
    uint256 componentTokenAmount = PriceUtils.fullTokenValueInWads(price, amountOfFull, fullTokenDecimals);
    _mint(account, componentTokenAmount);
  }

  /// @dev Mint new tokens if the contract owner
  /// @param account address of account to mint tokens to
  /// @param amount amount of tokens to mint
  function mint(address account, uint256 amount) public onlyOwner {
    _mint(account, amount);
  }

  /// @dev Burn tokens if the contract owner
  /// @param account address of account to burn tokens from
  /// @param amount amount of tokens to burn
  function burn(address account, uint256 amount) public onlyOwner {
    _burn(account, amount);
    uint256 payoutAmount = calculatePayoutAmount(amount);
    // Call the payout function on the SplitVault contract
    splitVault.payout(payoutAmount, fullToken, account);
  }

  /// @dev Simplest public method for calculating the amount of fullToken due for a given amount of capital token
  /// @param capitalTokenAmount Amount of capital token to calculate the payout from
  /// @return The payout amount denoted in fullToken
  function calculatePayoutAmount(uint256 capitalTokenAmount) public view returns (uint256) {
    uint256 currPrice = priceOracle.getPrice(fullToken);
    return calculatePayoutAmount(capitalTokenAmount, currPrice, fullTokenDecimals);
  }

  /// @dev Pure function for calculating the amount of fullToken due for a given amount of capital token
  /// @param capitalTokenAmount Amount of capital token to calculate the payout from
  /// @param currPrice The current price of the fullToken with respect to the underlying
  /// @param tokenDecimals The decimal precision of the fullTokenn
  /// @return The payout amount denoted in fullToken
  function calculatePayoutAmount(
    uint256 capitalTokenAmount,
    uint256 currPrice,
    uint8 tokenDecimals
  ) public pure returns (uint256) {
    uint256 fullTokenPayoutWads = DSMath.wdiv(capitalTokenAmount, currPrice);
    uint256 payoutAmount = PriceUtils.fromWadToDecimals(fullTokenPayoutWads, tokenDecimals);
    return payoutAmount;
  }
}
