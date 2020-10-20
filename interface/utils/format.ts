import Decimal from "decimal.js";
import { Asset } from "../types/split";
import { convertToUnitAmount } from "./number";

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
