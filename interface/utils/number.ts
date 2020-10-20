import Decimal from "decimal.js";

export const convertToUnitAmount = (amount: Decimal, decimals: number = 18) => {
  const unit = new Decimal(10).pow(decimals);
  return amount.dividedBy(unit);
};
