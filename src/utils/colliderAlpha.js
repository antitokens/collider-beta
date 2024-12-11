export const calculateDistribution = (Anti, Pro) => {
  if (Anti === 0 && Pro === 0) {
    throw new Error("BOTH_ANTI_AND_PRO_CANNOT_BE_ZERO");
  }

  // Step 1: Calculate u (= mean)
  const u = Math.max(Anti / (Anti + Pro), Pro / (Anti + Pro));

  // Step 2: Calculate s (= standard deviation)
  const s = (Anti + Pro) / Math.abs(Anti - Pro);

  // Step 3: Generate a normal distribution
  const distribution = [];
  const range = Array.from(
    { length: 100 },
    (_, i) => u - 5 * s + (i / 99) * 10 * s
  );

  for (let x of range) {
    const value =
      Math.exp(-Math.pow(x - u, 2) / (2 * Math.pow(s, 2))) /
      (Math.sqrt(2 * Math.PI) * s);
    distribution.push({ x, value });
  }

  return { u, s, range, distribution };
};
