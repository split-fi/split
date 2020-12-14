//SPDX-License-Identifier: AGPL-3.0
pragma solidity 0.6.12;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/GSN/Context.sol";

import "./SplitVault.sol";

contract VaultControlled is Context {
  address private _owner;
  SplitVault internal splitVault;

  event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

  constructor(address splitVaultAddress) internal {
    splitVault = SplitVault(splitVaultAddress);
    address msgSender = _msgSender();
    _owner = msgSender;
    emit OwnershipTransferred(address(0), msgSender);
  }

  /// @dev Throws if called by any account other than the SplitVault or Owner.
  modifier onlyVaultOrOwner() {
    require(address(splitVault) == _msgSender() || _owner == _msgSender(), "Caller is not the SplitVault or Owner");
    _;
  }

  /// @dev Returns the address of the current owner.
  function owner() public view returns (address) {
    return _owner;
  }

  /// @dev Throws if called by any account other than the owner.
  modifier onlyOwner() {
    require(_owner == _msgSender(), "Ownable: caller is not the owner");
    _;
  }

  /// @dev Leaves the contract without owner. It will not be possible to call
  /// `onlyOwner` functions anymore. Can only be called by the current owner.
  function renounceOwnership() public virtual onlyOwner {
    emit OwnershipTransferred(_owner, address(0));
    _owner = address(0);
  }

  /// @dev Transfers ownership of the contract to a new account (`newOwner`).
  /// Can only be called by the current owner.
  function transferOwnership(address newOwner) public virtual onlyOwner {
    require(newOwner != address(0), "Ownable: new owner is the zero address");
    emit OwnershipTransferred(_owner, newOwner);
    _owner = newOwner;
  }
}
