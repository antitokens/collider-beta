export const calculateInversion = (baryon, photon, sign) => {
  // Step 1: Calculate anti
  const anti = baryon * (photon + 1 * sign);

  // Step 2: Calculate pro
  const pro = baryon * (photon - 1 * sign);

  return { anti, pro };
};
