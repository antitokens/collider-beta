import { AreaChart } from "lucide-react";
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
  const _overlapAbsolute = baryonBags.map((baryon, i) => {
    const photon = photonBags[i];
    return (
      Math.exp(
        -Math.pow(Math.log(2e9 - baryon), 2) /
          (2 * Math.pow(photon <= 1 ? 1 : 1 + Math.log(photon), 2))
      ) /
      (flag
        ? Math.sqrt(2 * Math.PI) * (photon <= 1 ? 1 : 1 + Math.log(photon))
        : 1)
    );
  });

  // Calculate normalised overlap with truth (inverse-log-normalised)
  const overlapNormalised = baryonBags
    .map((baryon, i) => {
      const photon = photonBags[i];
      return (
        Math.exp(
          -Math.pow(Math.log(2e9 - baryon), 2) /
            (2 * Math.pow(photon <= 1 ? 1 : 1 + Math.log(photon), 2))
        ) /
        (flag
          ? Math.sqrt(2 * Math.PI) * (photon <= 1 ? 1 : 1 + Math.log(photon))
          : 1)
      );
    })
    .map((value) =>
      value === 0
        ? 0
        : value === 1
        ? 1
        : 1 / Math.abs(value <= 0 ? 1 : 1 + Math.log(value))
    );

  // Calculate forward distribution
  const forward = calculateDistribution(
    overlapNormalised,
    [],
    [],
    antiBags,
    proBags
  );

  // Calculate returns
  const scatter = {
    anti: distributeCountOverBins(forward.distribution, antiPool),
    pro: distributeCountOverBins(forward.distribution, proPool),
    baryon: [],
    photon: [],
  };
  const returns = [
    distributeValuesInBins(scatter.anti.resampled, forward.indices, antiBags),
    distributeValuesInBins(scatter.pro.resampled, forward.indices, proBags),
    [],
    [],
  ];

  // Calculate inversions
  const invert = {
    anti: [],
    pro: [],
    baryon: [],
    photon: [],
    wallet: [],
    indices: [],
  };
  let _counter_ = 0;
  for (let i = 0; i < returns[0].length; i++) {
    for (let j = 0; j < returns[0][i].length; j++) {
      invert.anti.push(returns[0][i][j]);
      invert.pro.push(returns[1][i][j]);
      invert.baryon.push(0);
      invert.photon.push(0);
      invert.wallet.push(wallets[_counter_]);
      _counter_ += 1;
      invert.indices.push(forward.indices[i]);
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
  return { overlap: overlapNormalised, invert, change };
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
  truth = [],
  flag = false
) => {
  // Calculate absolute overlap with truth (log-normalised)
  const _overlapAbsolute = baryonBags.map((baryon, i) => {
    const photon = photonBags[i];
    const sign =
      truth[0] > truth[1] && antiBags[i] > proBags[i]
        ? 1
        : truth[0] < truth[1] && antiBags[i] > proBags[i]
        ? -1
        : truth[0] > truth[1] && antiBags[i] < proBags[i]
        ? -1
        : truth[0] < truth[1] && antiBags[i] < proBags[i]
        ? 1
        : 1;
    return (
      (sign *
        Math.exp(
          -Math.pow(Math.log(2e9 - baryon), 2) /
            (2 * Math.pow(photon <= 1 ? 1 : 1 + Math.log(photon), 2))
        )) /
      (flag
        ? Math.sqrt(2 * Math.PI) * (photon <= 1 ? 1 : 1 + Math.log(photon))
        : 1)
    );
  });

  // Calculate normalised overlap with truth (piecewise-inverse-log-normalised)
  const overlapNormalised = baryonBags
    .map((baryon, i) => {
      const photon = photonBags[i];
      const sign =
        truth[0] > truth[1] && antiBags[i] > proBags[i]
          ? 1
          : truth[0] < truth[1] && antiBags[i] > proBags[i]
          ? -1
          : truth[0] > truth[1] && antiBags[i] < proBags[i]
          ? -1
          : truth[0] < truth[1] && antiBags[i] < proBags[i]
          ? 1
          : 1;

      return (
        (sign *
          Math.exp(
            -Math.pow(Math.log(2e9 - baryon), 2) /
              (2 * Math.pow(photon <= 1 ? 1 : 1 + Math.log(photon), 2))
          )) /
        (flag
          ? Math.sqrt(2 * Math.PI) * (photon <= 1 ? 1 : 1 + Math.log(photon))
          : 1)
      );
    })
    .map((value) =>
      value === 0
        ? 0
        : value === 1
        ? 1
        : 1 / Math.abs(value <= 0 ? 1 : 1 + Math.log(value))
    );

  // Calculate forward distribution
  const forward = calculateDistribution(
    overlapNormalised,
    [],
    [],
    antiBags,
    proBags
  );

  // Calculate returns
  const scatter = {
    anti: distributeCountOverBins(forward.distribution, antiPool),
    pro: distributeCountOverBins(forward.distribution, proPool),
    baryon: [],
    photon: [],
  };

  const returns = [
    distributeValuesInBins(scatter.anti.resampled, forward.indices, antiBags),
    distributeValuesInBins(scatter.pro.resampled, forward.indices, proBags),
    [],
    [],
  ];

  // Calculate inversions
  const invert = {
    anti: Array(wallets.length).fill(0),
    pro: Array(wallets.length).fill(0),
    baryon: Array(wallets.length).fill(0),
    photon: Array(wallets.length).fill(0),
    wallet: Array(wallets.length).fill(0),
    indices: Array(wallets.length).fill(0),
  };
  let _counter_ = 0;
  for (let i = 0; i < returns[0].length; i++) {
    for (let j = 0; j < returns[0][i].length; j++) {
      const _anti = returns[0][i][j];
      const _pro = returns[1][i][j];
      invert.anti[forward.indices[i][j]] = _anti;
      invert.pro[forward.indices[i][j]] = _pro;
      const collide = calculateCollision(_anti, _pro);
      const _baryon = collide.u;
      const _photon = collide.s;
      invert.baryon[forward.indices[i][j]] = _baryon;
      invert.photon[forward.indices[i][j]] = _photon;
      invert.wallet[forward.indices[i][j]] = wallets[_counter_];
      _counter_ += 1;
      invert.indices.push(forward.indices[i][j]);
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
  return { overlap: overlapNormalised, invert, change };
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

  // Calculate piecewise sums of all tokens in each bin separately
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
    indices: itemsInBins,
    values: valueSums,
  };
}

// Distribute values across bins based on another distribution
function distributeCountOverBins(distribution, totalCount) {
  // Find indices of non-zero bins
  const nonZeroBinIndices = distribution
    .map((value, index) => ({ value, index }))
    .filter((item) => item.value > 0)
    .map((item) => item.index);

  // Initialise result array with zeros
  const resampled = new Array(distribution.length).fill(0);
  // Calculate values for non-zero bins before normalisation
  const totalBinValues = nonZeroBinIndices.length + 1;
  const unnormalised = nonZeroBinIndices.map(
    (index) => (index + 1) / totalBinValues
  );

  // Calculate sum of unnormalised values distribution
  const totalUnnormalised = unnormalised.reduce((sum, val) => sum + val, 0);

  // Normalise and assign only to non-zero bin positions
  nonZeroBinIndices.forEach((binIndex, i) => {
    resampled[binIndex] =
      (unnormalised[nonZeroBinIndices.length - 1 - i] / totalUnnormalised) *
      totalCount;
  });

  return { resampled };
}

// Distribute values within one bin
function distributeValuesInBins(valueSums, indicesInBins, orderBy) {
  return valueSums.map((sums, binIndex) => {
    const count = indicesInBins[binIndex].length;
    if (count === 0) return [];
    if (count > 1) {
      const binIndices = indicesInBins[binIndex];
      const orderValues = binIndices.map((i) => orderBy[i]);
      const total = orderValues.reduce((a, b) => a + b, 0);
      return orderValues.map((v) => (v / total) * sums);
    }
    return Array(count).fill(sums / count);
  });
}
