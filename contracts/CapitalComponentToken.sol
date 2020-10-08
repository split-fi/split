//SPDX-License-Identifier: MIT
pragma solidity ^0.6.8;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

import "./interfaces/PriceOracle.sol";
import "./lib/math.sol";

contract CapitalComponentToken is ERC20, Ownable {
  using SafeMath for uint256;

  address public fullToken;
  PriceOracle private priceOracle;

  constructor(
    string memory name,
    string memory symbol,
    address _fullToken,
    address priceOracleAddress
  ) public ERC20(name, symbol) {
    priceOracle = PriceOracle(priceOracleAddress);
    fullToken = _fullToken;
  }

  /// @dev Mint new capital component tokens, but compute the amount from an amount of full tokens.
  /// @param account address of account to mint tokens to
  /// @param amountOfFull amount of full tokens to use for the calculation
  function mintFromFull(address account, uint256 amountOfFull) public onlyOwner {
    uint256 price = priceOracle.getPrice(fullToken);
    // convert amountOfFull to 18 decimal places if not already
    uint8 fullTokenDecimals = ERC20(fullToken).decimals();
    require(super.decimals() >= fullTokenDecimals, "fullTokenDecimals greater than decimals");
    uint256 decimalAdjustment = super.decimals() - fullTokenDecimals;
    uint256 adjustedFullAmount = amountOfFull.mul(10 ** decimalAdjustment);
    _mint(account, DSMath.wmul(price, adjustedFullAmount));
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
  }
}
