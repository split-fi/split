import Decimal from "decimal.js";

export const convertToUnitAmount = (amount: Decimal, decimals: number) => {
  const unit = new Decimal(10).pow(decimals);
  return amount.dividedBy(unit);
};

export const convertToBaseAmount = (amount: string, decimals: number) => {
  const unit = new Decimal(10).pow(decimals);
  return unit.mul(amount);
};
