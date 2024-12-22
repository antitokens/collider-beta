export const calculateInversion = (baryon, photon) => {
  if (baryon === 0 && photon === 0) {
    throw new Error("BOTH_BARYON_AND_PHOTON_CANNOT_BE_ZERO");
  }

  /*
  if (Math.abs(baryon - photon) < 1 && Math.abs(baryon - photon) !== 0) {
    throw new Error("TOKEN_DIFFERENCE_CANNOT_BE_SMALLER_THAN_ONE_UNLESS_ZERO");
  }
  if (baryon + photon < 1 && baryon + photon !== 0) {
    throw new Error("TOKEN_SUM_CANNOT_BE_SMALLER_THAN_ONE_UNLESS_ZERO");
  }
  if (photon < 0.5 && photon !== 0) {
    throw new Error("PHOTON_COUNT_CANNOT_BE_SMALLER_THAN_HALF_UNLESS_ZERO");
  }
  */

  // Step 1: Calculate u (= mean)
  const u = baryon * (photon + 0.5);

  // Step 2: Calculate s (= standard deviation)
  const s = baryon * (photon - 0.5);

  // Step 3: Generate a normal distribution in -5s to 5s range
  const distribution = [];
  const range = Array.from(
    { length: 100 },
    (_, i) => u - 5 * s + (i / 99) * 10 * s
  );

  for (let x of range) {
    const value =
      baryon === photon
        ? 0
        : Math.exp(-Math.pow(x - u, 2) / (2 * Math.pow(s, 2))) /
          (Math.sqrt(2 * Math.PI) * s);
    distribution.push({ x, value });
  }

  // Step 4: Generate a normal distribution within the range [0, 1]
  const curve = [];
  const short = Array.from({ length: 100 }, (_, i) => i / 99); // Generate 100 points evenly spaced between 0 and 1

  for (let x of short) {
    const value =
      baryon === photon
        ? 0
        : Math.exp(-Math.pow(x - u, 2) / (2 * Math.pow(s, 2))) /
          (Math.sqrt(2 * Math.PI) * s);
    curve.push({ x, value });
  }

  return { u, s, range, distribution, short, curve };
};

export function formatCount(value) {
  return value >= 1e6
    ? (value / 1e6).toFixed(1).replace(/\.0$/, "") + "m"
    : value >= 1e3
    ? (value / 1e3).toFixed(0).replace(/\.0$/, "") + "k"
    : value.toString();
}
