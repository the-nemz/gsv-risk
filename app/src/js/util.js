export const MAX_GSV = 50;
export const MIN_GSV = 0.1;

export function calculateGsv(factors) {
  let baseFactorValues = {};
  let compareFactorValues = {};
  for (const factor of factors) {
    baseFactorValues[factor.id] = factor.default;
    compareFactorValues[factor.id] = factor.input || factor.input === 0 ? factor.input : factor.default;
  }

  const baseInner = 1 - ((baseFactorValues.infected / 100) * (baseFactorValues.transmission / 100));
  const baseValue = 1 - (baseInner ** baseFactorValues.interactions);
  const compareInner = 1 - ((compareFactorValues.infected / 100) * (compareFactorValues.transmission / 100));
  const compareValue = 1 - (compareInner ** compareFactorValues.interactions);

  const gsv = Math.log(1 - compareValue) / Math.log(1 - baseValue);

  let cleanValue = Math.min(gsv || gsv, MAX_GSV);
  return Math.max(cleanValue, MIN_GSV);

  // if (cleanValue < 5) {
  //   return Math.round(cleanValue * 10) / 10;
  //   // return cleanValue.toFixed(1);
  // } else {
  //   // return Math.round(cleanValue);
  //   return cleanValue.toFixed(0);
  // }
}
