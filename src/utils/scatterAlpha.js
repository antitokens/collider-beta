import { calculateCollision } from "../utils/colliderAlpha";

export const calculateScattering = (
  baryonBags,
  photonBags,
  baryonPool,
  photonPool,
  antiBags,
  proBags,
  antiPool,
  proPool,
  prices,
  wallets,
  flag = false
) => {
  // Calculate absolute overlap with truth
  const overlap = baryonBags.map((baryon, i) => {
    const photon = photonBags[i];
    return (
      Math.exp(
        -Math.pow(Math.log10(2e9 - baryon), 2) /
          (2 * Math.pow(photon <= 0 ? 1 : Math.log10(photon), 2))
      ) /
      (flag
        ? Math.sqrt(2 * Math.PI) * (photon <= 0 ? 1 : Math.log10(photon))
        : 1)
    );
  });

  // Calculate normalised overlap with truth (inverse-log-normalised)
  const overlapShifted = baryonBags
    .map((baryon, i) => {
      const photon = photonBags[i];
      return (
        Math.exp(
          -Math.pow(
            Math.log10(2e9) - (baryon <= 0 ? 0 : Math.log10(baryon)),
            2
          ) /
            (2 * Math.pow(photon <= 0 ? 1 : Math.log10(photon), 2))
        ) /
        (flag
          ? Math.sqrt(2 * Math.PI) * (photon <= 0 ? 1 : Math.log10(photon))
          : 1)
      );
    })
    .map((value) =>
      value === 0
        ? 0
        : value === 1
        ? 1
        : 1 / Math.abs(value <= 0 ? 1 : Math.log10(value))
    );

  // Calculate forward distribution
  const forward = calculateDistribution(overlap, [], [], antiBags, proBags);

  // Calculate returns
  const scatter = {
    anti: distributeCountOverBins(forward.distribution, antiPool),
    pro: distributeCountOverBins(forward.distribution, proPool),
    baryon: [],
    photon: [],
  };

  const returns = [
    distributeValuesInBins(scatter.anti.resampled, forward.index),
    distributeValuesInBins(scatter.pro.resampled, forward.index),
    [],
    [],
  ];

  // Calculate inversions
  const invert = { anti: [], pro: [], baryon: [], photon: [], wallet: [] };
  for (let i = 0; i < returns[0].length; i++) {
    for (let j = 0; j < returns[0][i].length; j++) {
      invert.anti.push(returns[0][i][j]);
      invert.pro.push(returns[1][i][j]);
      invert.baryon.push(0);
      invert.photon.push(0);
      invert.wallet.push(wallets[j]);
    }
  }

  // Calculate changes
  const change = {
    baryon: [],
    photon: [],
    anti: antiBags.map((value, index) => invert.anti[index] - value),
    pro: proBags.map((value, index) => invert.pro[index] - value),
    gain: antiBags.map(
      (value, index) =>
        (invert.anti[index] - value) * prices[0] +
        (invert.pro[index] - proBags[index]) * prices[1]
    ),
    original: antiBags.map(
      (value, index) => value * prices[0] + proBags[index] * prices[1]
    ),
    wallets: wallets,
  };
  return { overlap: overlapShifted, invert, change };
};

export const implementScattering = (
  baryonBags,
  photonBags,
  baryonPool,
  photonPool,
  antiBags,
  proBags,
  antiPool,
  proPool,
  prices,
  wallets,
  flag = false
) => {
  // Calculate absolute overlap with truth
  const overlap = baryonBags.map((baryon, i) => {
    const photon = photonBags[i];
    return (
      Math.exp(
        -Math.pow(Math.log10(2e9 - baryon), 2) /
          (2 * Math.pow(Math.log10(photon), 2))
      ) / (flag ? Math.sqrt(2 * Math.PI) * Math.log10(photon) : 1)
    );
  });

  // Calculate normalised overlap with truth (inverse-log-normalised)
  const overlapShifted = baryonBags
    .map((baryon, i) => {
      const photon = photonBags[i];
      return (
        Math.exp(
          -Math.pow(Math.log10(2e9) - Math.log10(baryon), 2) /
            (2 * Math.pow(Math.log10(photon), 2))
        ) / (flag ? Math.sqrt(2 * Math.PI) * photon : 1)
      );
    })
    .map((value) =>
      value === 0 ? 0 : value === 1 ? 1 : 1 / Math.abs(Math.log10(value))
    );

  // Calculate forward distribution
  const forward = calculateDistribution(overlap, [], [], antiBags, proBags);

  // Calculate returns
  const scatter = {
    anti: distributeCountOverBins(forward.distribution, antiPool),
    pro: distributeCountOverBins(forward.distribution, proPool),
    baryon: [],
    photon: [],
  };

  const returns = [
    distributeValuesInBins(scatter.anti.resampled, forward.index),
    distributeValuesInBins(scatter.pro.resampled, forward.index),
    [],
    [],
  ];

  // Calculate inversions
  const invert = { anti: [], pro: [], baryon: [], photon: [], wallet: [] };
  for (let i = 0; i < returns[0].length; i++) {
    for (let j = 0; j < returns[0][i].length; j++) {
      const _anti = returns[0][i][j];
      const _pro = returns[1][i][j];
      invert.anti.push(_anti);
      invert.pro.push(_pro);
      const collide = calculateCollision(_anti, _pro);
      const _baryon = collide.u;
      const _photon = collide.s;
      invert.baryon.push(_baryon);
      invert.photon.push(_photon);
      invert.wallet.push(wallets[j]);
    }
  }

  // Calculate changes
  const change = {
    baryon: baryonBags.map((value, index) => invert.baryon[index] - value),
    photon: photonBags.map((value, index) => invert.photon[index] - value),
    anti: antiBags.map((value, index) => invert.anti[index] - value),
    pro: proBags.map((value, index) => invert.pro[index] - value),
    gain: antiBags.map(
      (value, index) =>
        (invert.anti[index] - value) * prices[0] +
        (invert.pro[index] - proBags[index]) * prices[1]
    ),
    original: antiBags.map(
      (value, index) => value * prices[0] + proBags[index] * prices[1]
    ),
    wallets: wallets,
  };
  return { overlap: overlapShifted, invert, change };
};

// Distribute indexed values over bins
function calculateDistribution(
  values,
  baryonBags,
  photonBags,
  antiBags,
  proBags,
  numBins = 100
) {
  // Step 1: Initialise bins
  const bins = Array(numBins).fill(0);
  const binSize = 1 / numBins;
  const itemsInBins = Array(numBins)
    .fill(null)
    .map(() => []);
  const valueInBins = Array(numBins)
    .fill(null)
    .map(() => []);

  // Step 2: Populate bins based on the values
  values.forEach((value, index) => {
    if (value >= 0 && value <= 1) {
      const binIndex = Math.min(Math.floor(value / binSize), numBins - 1);
      bins[binIndex] += 1; // Increment the corresponding bin
      itemsInBins[binIndex].push(index);
      valueInBins[binIndex].push([
        baryonBags[index],
        photonBags[index],
        antiBags[index],
        proBags[index],
      ]);
    }
  });

  // Step 3: Normalise the distribution
  const totalValues = values.length;
  const distribution = bins.map((count) => count / totalValues);

  // Calculate piecewise sums for each bin separately
  const valueSums = valueInBins.map((binArray) => {
    return binArray.reduce(
      (binTotals, fourArray) => {
        return [
          binTotals[0] + fourArray[0],
          binTotals[1] + fourArray[1],
          binTotals[2] + fourArray[2],
          binTotals[3] + fourArray[3],
        ];
      },
      [0, 0, 0, 0]
    );
  });

  return {
    distribution: bins,
    normalised: distribution,
    index: itemsInBins,
    value: valueSums,
  };
}

// Distribute values across bins
function distributeCountOverBins(bins, totalCount) {
  // Find indices of non-zero bins
  const nonZeroBinIndices = bins
    .map((value, index) => ({ value, index }))
    .filter((item) => item.value > 0)
    .map((item) => item.index);

  // Initialise result array with zeros
  const resampled = new Array(bins.length).fill(0);
  // Calculate values for non-zero bins before normalisation
  const totalBinValues = nonZeroBinIndices.length + 1;
  const unnormalised = nonZeroBinIndices.map(
    (index) => (index + 1) / totalBinValues
  );
  // Calculate sum of unnormalised values
  const totalUnnormalised = unnormalised.reduce((sum, val) => sum + val, 0);
  // Normalise and assign only to non-zero bin positions
  nonZeroBinIndices.forEach((binIndex, i) => {
    resampled[binIndex] = (unnormalised[i] / totalUnnormalised) * totalCount;
  });

  return { resampled };
}

// Distribute values within one bin
function distributeValuesInBins(valueSums, indicesInBins) {
  return valueSums.map((sums, binIndex) => {
    const count = indicesInBins[binIndex].length;
    if (count === 0) return [];
    return Array(count).fill(sums / count);
  });
}
