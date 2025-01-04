export const calculateInversion = (baryon, photon, sign) => {
  // Step 1: Calculate anti
  const anti = baryon > 0 ? 0.5 * baryon * (photon + 1 * sign) : photon / 2;

  // Step 2: Calculate pro
  const pro = baryon > 0 ? 0.5 * baryon * (photon - 1 * sign) : photon / 2;

  return { anti, pro };
};
