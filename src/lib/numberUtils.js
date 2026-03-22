export function formatRating(value, fallback = '0') {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return fallback;
  }

  const rounded = Math.round((numericValue + Number.EPSILON) * 100) / 100;
  return rounded.toFixed(2).replace(/(?:\.0+|(\.\d*?[1-9])0+)$/, '$1');
}
