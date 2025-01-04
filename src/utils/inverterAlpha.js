export const calculateInversion = (baryon, photon, sign) => {
  // Step 1: Calculate anti
  const anti = 0.5 * baryon * (photon + 1 * sign);

  // Step 2: Calculate pro
  const pro = 0.5 * baryon * (photon - 1 * sign);

  return { anti, pro };
};
