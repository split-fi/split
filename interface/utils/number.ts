import Decimal from "decimal.js";
import { Asset } from "../types/split";

export const convertToUnitAmount = (amount: Decimal, decimals: number) => {
  const unit = new Decimal(10).pow(decimals);
  return amount.dividedBy(unit);
};

export const convertToBaseAmount = (amount: string, decimals: number) => {
  const unit = new Decimal(10).pow(decimals);
  return unit.mul(amount);
};

// Split tokens are always 18 decimal places
// cTokens are always 8 decimal places
// The price from the price oracle is scaled by 18 decimal places.
export const fullTokenAmountToComponentTokenAmount = (baseAmount: Decimal, price: Decimal) => {
  const adjustment = new Decimal(10).pow(10);
  return baseAmount.mul(adjustment).div(price);
};

export const componentTokenAmountToFullTokenAmount = (baseAmount: Decimal, price: Decimal) => {
  const adjustment = new Decimal(10).pow(36);
  return baseAmount.mul(price).div(adjustment);
};

export interface FormattedTokenAmount {
  full: string;
  minimized: string;
  fullWithUnits: string;
  minimizedWithUnits: string;
}

export const formatTokenAmount = (amount: Decimal, token: Asset): FormattedTokenAmount => {
  const fullValue = convertToUnitAmount(amount, token.decimals);
  const minimizedValue = fullValue.toSignificantDigits(4);
  return {
    full: fullValue.toString(),
    minimized: minimizedValue.toString(),
    fullWithUnits: `${fullValue.toString()} ${token.symbol}`,
    minimizedWithUnits: `${minimizedValue.toString()} ${token.symbol}`,
  };
};
