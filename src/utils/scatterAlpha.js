import { calculateInversion } from "./inverterAlpha";

export function calculateDistribution(
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
  const totalBinValues = bins.reduce((sum, bin) => sum + bin, 0);

  if (totalBinValues === 0) {
    throw new Error("BAD_INPUT_IN_SCATTERING");
  }

  const resampled = bins.map(
    (binValue) => (binValue / totalBinValues) * totalCount
  );

  return { resampled };
}

function distributeValuesInBins(valueSums, indicesInBins) {
  return valueSums.map((sums, binIndex) => {
    const count = indicesInBins[binIndex].length;
    if (count === 0) return [];
    return Array(count).fill(sums / count);
  });
}

export const calculateScattering = (
  baryonBags,
  photonBags,
  baryonPool,
  photonPool,
  antiBags,
  proBags,
  flag = false
) => {
  // Calculate overlap values
  const overlap = baryonBags.map((baryon, i) => {
    const photon = photonBags[i];
    return (
      Math.exp(-Math.pow(baryonPool - baryon, 2) / (2 * Math.pow(photon, 2))) /
      (flag ? Math.sqrt(2 * Math.PI) * photon : 1)
    );
  });

  // Calculate forward distribution
  const forward = calculateDistribution(
    overlap,
    baryonBags,
    photonBags,
    antiBags,
    proBags
  );

  // Calculate returns
  const _returns = {
    baryon: distributeCountOverBins(forward.distribution, baryonPool),
    photon: distributeCountOverBins(forward.distribution, photonPool),
  };

  const returns = [
    distributeValuesInBins(_returns.baryon.resampled, forward.index),
    distributeValuesInBins(_returns.photon.resampled, forward.index),
  ];

  // Calculate inversions
  const invert = { anti: [], pro: [], baryon: [], photon: [] };
  for (let i = 0; i < returns[0].length; i++) {
    for (let j = 0; j < returns[0][i].length; j++) {
      const _revert = calculateInversion(returns[0][i][j], returns[1][i][j]);
      invert.anti.push(_revert.u);
      invert.pro.push(_revert.s);
      invert.baryon.push(returns[0][i][j]);
      invert.photon.push(returns[1][i][j]);
    }
  }

  // Calculate changes
  const change = {
    baryon: baryonBags.map((value, index) => value - invert.baryon[index]),
    photon: photonBags.map((value, index) => value - invert.photon[index]),
    anti: antiBags.map((value, index) => value - invert.anti[index]),
    pro: proBags.map((value, index) => value - invert.pro[index]),
  };

  return { overlap, returns, change };
};
