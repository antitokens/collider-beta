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
  // Calculate overlap values
  const overlap = baryonBags.map((baryon, i) => {
    const photon = photonBags[i];
    return (
      Math.exp(
        -Math.pow(Math.log10(baryonPool - baryon), 2) /
          (2 * Math.pow(Math.log10(photon), 2))
      ) / (flag ? Math.sqrt(2 * Math.PI) * Math.log10(photon) : 1)
    );
  });

  // Calculate overlap values
  const overlapShifted = baryonBags
    .map((baryon, i) => {
      const photon = photonBags[i];
      return (
        Math.exp(
          -Math.pow(Math.log10(Math.max(...baryonBags) - baryon), 2) /
            (2 * Math.pow(Math.log10(photon), 2))
        ) / (flag ? Math.sqrt(2 * Math.PI) * photon : 1)
      );
    })
    .map((value) => (value === 0 ? 1 : 1 / Math.abs(Math.log10(value))));

  // Calculate forward distribution
  const forward = calculateDistribution(
    overlap,
    baryonBags,
    photonBags,
    antiBags,
    proBags
  );

  // Calculate returns
  const scatter = {
    anti: distributeCountOverBins(forward.distribution, antiPool),
    pro: distributeCountOverBins(forward.distribution, proPool),
    baryon: distributeCountOverBins(forward.distribution, baryonPool),
    photon: distributeCountOverBins(forward.distribution, photonPool),
  };

  const returns = [
    distributeValuesInBins(scatter.anti.resampled, forward.index),
    distributeValuesInBins(scatter.pro.resampled, forward.index),
    distributeValuesInBins(scatter.baryon.resampled, forward.index),
    distributeValuesInBins(scatter.photon.resampled, forward.index),
  ];

  // Calculate inversions
  const invert = { anti: [], pro: [], baryon: [], photon: [], wallet: [] };
  for (let i = 0; i < returns[0].length; i++) {
    for (let j = 0; j < returns[0][i].length; j++) {
      invert.anti.push(returns[0][i][j]);
      invert.pro.push(returns[1][i][j]);
      invert.baryon.push(-returns[2][i][j]);
      invert.photon.push(-returns[3][i][j]);
      invert.wallet.push(wallets[j]);
    }
  }

  // Calculate changes
  const change = {
    baryon: baryonBags.map((value, index) => value - invert.baryon[index]),
    photon: photonBags.map((value, index) => value - invert.photon[index]),
    anti: antiBags.map((value, index) => value - invert.anti[index]),
    pro: proBags.map((value, index) => value - invert.pro[index]),
    gain: antiBags.map(
      (value, index) =>
        (value - invert.anti[index]) * prices[0] +
        (proBags[index] - invert.pro[index]) * prices[1]
    ),
    original: antiBags.map(
      (value, index) => value * prices[0] + proBags[index] * prices[1]
    ),
    wallets: wallets,
  };
  return { overlap: overlapShifted, invert, change };
};

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

function distributeCountOverBins(bins, totalCount) {
  // Find indices of non-zero bins
  const nonZeroBinIndices = bins
    .map((value, index) => ({ value, index }))
    .filter((item) => item.value > 0)
    .map((item) => item.index);

  if (nonZeroBinIndices.length === 0) {
    throw new Error("BAD_INPUT_IN_SCATTERING");
  }
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

function distributeValuesInBins(valueSums, indicesInBins) {
  return valueSums.map((sums, binIndex) => {
    const count = indicesInBins[binIndex].length;
    if (count === 0) return [];
    return Array(count).fill(sums / count);
  });
}
