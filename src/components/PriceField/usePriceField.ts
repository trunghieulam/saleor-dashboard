import { TextFieldProps } from "@material-ui/core";
import { FormChange } from "@saleor/hooks/useForm";
import { useMemo } from "react";

import { SEPARATOR_CHARACTERS } from "./consts";
import { findPriceSeparator, getCurrencyDecimalPoints } from "./utils";

export function usePriceField(currency: string, onChange: FormChange) {
  const minValue = 0;

  const maxDecimalLength = useMemo(() => getCurrencyDecimalPoints(currency), [
    currency
  ]);

  const handleChange: FormChange = e => {
    let value = e.target.value;
    const splitCharacter = findPriceSeparator(value);
    const [integerPart, decimalPart] = value.split(splitCharacter);

    if (maxDecimalLength === 0 && decimalPart) {
      // this shouldn't happen - decimal character should be ignored
      value = integerPart;
    }

    if (decimalPart?.length > maxDecimalLength) {
      const shortenedDecimalPart = decimalPart.slice(0, maxDecimalLength);
      value = `${integerPart}${splitCharacter}${shortenedDecimalPart}`;
    }

    onChange({
      target: {
        name: e.target.name,
        value
      }
    });
  };

  const handleKeyDown: TextFieldProps["onKeyDown"] = e => {
    // disallow entering e (exponent)
    if (e.key === "e" || e.key === "E") {
      e.preventDefault();
    }
    // ignore separator input when currency doesn't support decimal values
    if (
      maxDecimalLength === 0 &&
      SEPARATOR_CHARACTERS.some(separator => e.key === separator)
    ) {
      e.preventDefault();
    }
  };

  const step = 1 / Math.pow(10, maxDecimalLength);

  return {
    onChange: handleChange,
    onKeyDown: handleKeyDown,
    minValue,
    step
  };
}
