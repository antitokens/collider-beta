/* Inverter v1.0-beta */

export const invert = (baryon, photon, parity) => {
  // Step 1: Calculate anti
  const anti =
    baryon > 0
      ? photon > 0 && baryon >= 1 && photon >= 1
        ? 0.5 * baryon * (photon + parity)
        : baryon >= 1
        ? 0
        : 0.5 * baryon
      : 0.5 * photon;

  // Step 2: Calculate pro
  const pro =
    baryon > 0
      ? photon > 0 && baryon >= 1 && photon >= 1
        ? 0.5 * baryon * (photon - parity)
        : baryon >= 1
        ? 0
        : 0.5 * baryon
      : 0.5 * photon;

  return { anti, pro };
};
