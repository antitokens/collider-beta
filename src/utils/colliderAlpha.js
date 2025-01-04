export const calculateCollision = (anti, pro, flag = false, norm = false) => {
  // Step 1: Calculate u (= mean)
  const u = flag
    ? anti
    : anti + pro >= 0 && anti + pro < 1
    ? 0
    : Math.abs(anti - pro) > 0 && Math.abs(anti - pro) < 1
    ? Math.abs(anti - pro)
    : Math.abs(anti - pro);

  // Step 2: Calculate s (= standard deviation)
  const s = flag
    ? pro
    : anti + pro >= 0 && anti + pro < 1
    ? 0
    : Math.abs(anti - pro) === anti + pro
    ? 0
    : Math.abs(anti - pro) > 0 && Math.abs(anti - pro) < 1
    ? (anti + pro) * 1.0
    : Math.abs(anti - pro) === 0
    ? anti + pro
    : (anti + pro) / Math.abs(anti - pro);

  // Step 3: Generate a normal distribution in -5s to 5s range
  const distribution = [];
  const range = Array.from(
    { length: 100 },
    (_, i) => u - 5 * s + (i / 99) * 10 * s
  );

  for (let x of range) {
    const value =
      s > 0
        ? Math.exp(-Math.pow(x - u, 2) / (2 * Math.pow(s, 2))) /
          (norm ? Math.sqrt(2 * Math.PI) * s : 1)
        : 1 / 2;
    distribution.push({ x, value });
  }

  // Step 4: Generate a normal distribution within range > 0
  const curve = [];
  const short = Array.from(
    { length: 100 },
    (_, i) => u - 5 * s + (i / 99) * 10 * s
  ).filter((value) => value >= 0);

  for (let x of short) {
    const value =
      s > 0
        ? Math.exp(-Math.pow(x - u, 2) / (2 * Math.pow(s, 2))) /
          (norm ? Math.sqrt(2 * Math.PI) * s : 1)
        : 1 / 2;
    curve.push({ x, value });
  }

  return { u, s, range, distribution, short, curve };
};
