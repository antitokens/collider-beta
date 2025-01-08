/* Inverter v1.0-alpha */

export const calculateInversion = (baryon, photon, sign) => {
  // Step 1: Calculate anti
  const anti =
    baryon > 0
      ? baryon >= 1
        ? photon > 0
          ? photon >= 1
            ? 0.5 * baryon * (photon + 1 * sign)
            : 0
          : 0
        : 0.5 * baryon
      : 0.5 * photon;

  // Step 2: Calculate pro
  const pro =
    baryon > 0
      ? baryon >= 1
        ? photon > 0
          ? photon >= 1
            ? 0.5 * baryon * (photon - 1 * sign)
            : 0
          : 0
        : 0.5 * baryon
      : 0.5 * photon;

  return { anti, pro };
};
