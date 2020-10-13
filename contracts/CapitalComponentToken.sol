//SPDX-License-Identifier: MIT
pragma solidity ^0.6.8;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

import "./interfaces/PriceOracle.sol";
import "./lib/PriceUtils.sol";

contract CapitalComponentToken is ERC20, Ownable {
  using SafeMath for uint256;

  address public fullToken;
  uint8 private fullTokenDecimals;
  PriceOracle private priceOracle;

  constructor(
    string memory name,
    string memory symbol,
    address _fullToken,
    address priceOracleAddress
  ) public ERC20(name, symbol) {
    priceOracle = PriceOracle(priceOracleAddress);
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
    // TODO(fragosti): tell vault to return the corresponding amount of full tokens.
  }
}
