const { createHash } = require("crypto");

/**
 * Rational approximation of the inverse normal CDF (Beasley-Springer-Moro).
 * Maps a uniform [0,1] value to a standard normal variate.
 */
function invNormalCDF(p) {
  const a = [0, -3.969683028665376e+01,  2.209460984245205e+02,
               -2.759285104469687e+02,  1.383577518672690e+02,
               -3.066479806614716e+01,  2.506628277459239e+00];
  const b = [0, -5.447609879822406e+01,  1.615858368580409e+02,
               -1.556989798598866e+02,  6.680131188771972e+01,
               -1.328068155288572e+01];
  const c = [0, -7.784894002430293e-03, -3.223964580411365e-01,
               -2.400758277161838e+00, -2.549732539343734e+00,
                4.374664141464968e+00,  2.938163982698783e+00];
  const d = [0,  7.784695709041462e-03,  3.224671290700398e-01,
                2.445134137142996e+00,  3.754408661907416e+00];

  const pLow = 0.02425, pHigh = 1 - pLow;
  let q;

  if (p < pLow) {
    q = Math.sqrt(-2 * Math.log(p));
    return (((((c[1]*q+c[2])*q+c[3])*q+c[4])*q+c[5])*q+c[6]) /
           ((((d[1]*q+d[2])*q+d[3])*q+d[4])*q+1);
  } else if (p <= pHigh) {
    q = p - 0.5;
    const r = q * q;
    return (((((a[1]*r+a[2])*r+a[3])*r+a[4])*r+a[5])*r+a[6])*q /
           (((((b[1]*r+b[2])*r+b[3])*r+b[4])*r+b[5])*r+1);
  } else {
    q = Math.sqrt(-2 * Math.log(1 - p));
    return -(((((c[1]*q+c[2])*q+c[3])*q+c[4])*q+c[5])*q+c[6]) /
             ((((d[1]*q+d[2])*q+d[3])*q+d[4])*q+1);
  }
}

/**
 * Deterministic normal variate derived from a seed + tick via BLAKE2b-512.
 * Produces the same value for the same (seed, tick) pair.
 */
function getSeededReturn(seed, tick, volatility) {
  const input     = Buffer.from(seed + String(tick), "ascii");
  const hashBytes = createHash("blake2b512").update(input).digest();
  const view      = new DataView(hashBytes.buffer, hashBytes.byteOffset, 8);
  const unsigned  = view.getBigUint64(0, true);
  const unitFloat = Number(unsigned) / Number(2n ** 64n - 1n);
  return invNormalCDF(unitFloat) * volatility;
}

module.exports = { invNormalCDF, getSeededReturn };
