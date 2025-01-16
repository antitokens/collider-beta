/**
 * Advanced compression utilities for metadata
 */

// Utility functions
const compressDecimals = (number, precision = 4) => {
  return Math.round(number * (10 ** precision));
};

const decompressDecimals = (number, precision = 4) => {
  return number / (10 ** precision);
};

const compressTimes = (timestamps) => {
  if (!timestamps.length) return [];
  const deltas = [];
  const firstTime = timestamps[0];
  for (let i = 1; i < timestamps.length; i++) {
    deltas.push(timestamps[i] - timestamps[i - 1]);
  }
  return [firstTime, ...deltas];
};

const decompressTimes = (deltas) => {
  if (!deltas.length) return [];
  const timestamps = [deltas[0]];
  for (let i = 1; i < deltas.length; i++) {
    timestamps.push(timestamps[i - 1] + deltas[i]);
  }
  return timestamps;
};

const compressWithRLE = (arr) => {
  if (!arr.length) return [];
  const result = [];
  let count = 1;
  let current = arr[0];

  for (let i = 1; i < arr.length; i++) {
    if (arr[i] === current) {
      count++;
    } else {
      result.push([current, count]);
      current = arr[i];
      count = 1;
    }
  }
  result.push([current, count]);
  return result;
};

const decompressRLE = (compressed) => {
  const result = [];
  for (const [value, count] of compressed) {
    result.push(...Array(count).fill(value));
  }
  return result;
};

const compressNumbers = (numbers) => {
  return btoa(numbers.join(','));
};

const decompressNumbers = (compressed) => {
  return atob(compressed).split(',').map(Number);
};

const compressBinaryStates = (states) => {
  return states.reduce((acc, state, i) => acc | (state ? 1 : 0) << i, 0);
};

const decompressBinaryStates = (compressed, length) => {
  return Array.from({ length }, (_, i) => !!(compressed & (1 << i)));
};

// Main compression functions
const compressMetadata = (metadata) => {
  // Create dictionary for string compression
  const strings = new Set();
  const addToDict = (obj) => {
    Object.values(obj).forEach(val => {
      if (typeof val === 'string' && val.length > 3) strings.add(val);
      else if (Array.isArray(val)) val.forEach(v => typeof v === 'string' && v.length > 3 && strings.add(v));
      else if (typeof val === 'object' && val !== null) addToDict(val);
    });
  };
  addToDict(metadata);
  const dictionary = Array.from(strings);

  // Helper to replace strings with dictionary indices
  const compressString = (str) => {
    const index = dictionary.indexOf(str);
    return index !== -1 ? `#${index}` : str;
  };

  // Compress the actual data using array structure
  const compressed = [
    metadata.startTime,
    metadata.endTime,
    [
      compressDecimals(metadata.colliderDistribution.u),
      compressDecimals(metadata.colliderDistribution.s)
    ],
    [
      compressDecimals(metadata.totalDistribution.u),
      compressDecimals(metadata.totalDistribution.s),
      [
        compressNumbers(metadata.totalDistribution.bags.pro.map(n => compressDecimals(n))),
        compressNumbers(metadata.totalDistribution.bags.anti.map(n => compressDecimals(n))),
        compressDecimals(metadata.totalDistribution.bags.photon),
        compressDecimals(metadata.totalDistribution.bags.baryon)
      ],
      metadata.totalDistribution.wallets.map(compressString)
    ],
    [
      compressDecimals(metadata.emissionsData.total),
      compressDecimals(metadata.emissionsData.baryonTokens),
      compressDecimals(metadata.emissionsData.photonTokens)
    ],
    [
      compressDecimals(metadata.collisionsData.total),
      compressDecimals(metadata.collisionsData.antiTokens),
      compressDecimals(metadata.collisionsData.proTokens)
    ],
    [
      compressTimes(metadata.eventsOverTime.timestamps),
      {
        p: compressWithRLE(metadata.eventsOverTime.events.pro.map(n => compressDecimals(n))),
        a: compressWithRLE(metadata.eventsOverTime.events.anti.map(n => compressDecimals(n))),
        ph: compressWithRLE(metadata.eventsOverTime.events.photon.map(n => compressDecimals(n))),
        br: compressWithRLE(metadata.eventsOverTime.events.baryon.map(n => compressDecimals(n)))
      },
      {
        p: compressNumbers(metadata.eventsOverTime.ranges.pro.map(n => compressDecimals(n))),
        a: compressNumbers(metadata.eventsOverTime.ranges.anti.map(n => compressDecimals(n))),
        ph: compressNumbers(metadata.eventsOverTime.ranges.photon.map(n => compressDecimals(n))),
        br: compressNumbers(metadata.eventsOverTime.ranges.baryon.map(n => compressDecimals(n)))
      },
      {
        t: compressTimes(metadata.eventsOverTime.cumulative.timestamps),
        p: compressNumbers(metadata.eventsOverTime.cumulative.pro.map(n => compressDecimals(n))),
        a: compressNumbers(metadata.eventsOverTime.cumulative.anti.map(n => compressDecimals(n))),
        ph: compressNumbers(metadata.eventsOverTime.cumulative.photon.map(n => compressDecimals(n))),
        br: compressNumbers(metadata.eventsOverTime.cumulative.baryon.map(n => compressDecimals(n)))
      }
    ]
  ];

  return {
    d: dictionary,
    c: compressed
  };
};

const decompressMetadata = (compressed) => {
  const { d: dictionary, c: data } = compressed;

  // Helper to decompress strings
  const decompressString = (str) => {
    if (typeof str === 'string' && str.startsWith('#')) {
      return dictionary[parseInt(str.slice(1))];
    }
    return str;
  };

  return {
    startTime: data[0],
    endTime: data[1],
    colliderDistribution: {
      u: decompressDecimals(data[2][0]),
      s: decompressDecimals(data[2][1])
    },
    totalDistribution: {
      u: decompressDecimals(data[3][0]),
      s: decompressDecimals(data[3][1]),
      bags: {
        pro: decompressNumbers(data[3][2][0]).map(n => decompressDecimals(n)),
        anti: decompressNumbers(data[3][2][1]).map(n => decompressDecimals(n)),
        photon: decompressDecimals(data[3][2][2]),
        baryon: decompressDecimals(data[3][2][3])
      },
      wallets: data[3][3].map(decompressString)
    },
    emissionsData: {
      total: decompressDecimals(data[4][0]),
      baryonTokens: decompressDecimals(data[4][1]),
      photonTokens: decompressDecimals(data[4][2])
    },
    collisionsData: {
      total: decompressDecimals(data[5][0]),
      antiTokens: decompressDecimals(data[5][1]),
      proTokens: decompressDecimals(data[5][2])
    },
    eventsOverTime: {
      timestamps: decompressTimes(data[6][0]),
      events: {
        pro: decompressRLE(data[6][1].p).map(n => decompressDecimals(n)),
        anti: decompressRLE(data[6][1].a).map(n => decompressDecimals(n)),
        photon: decompressRLE(data[6][1].ph).map(n => decompressDecimals(n)),
        baryon: decompressRLE(data[6][1].br).map(n => decompressDecimals(n))
      },
      ranges: {
        pro: decompressNumbers(data[6][2].p).map(n => decompressDecimals(n)),
        anti: decompressNumbers(data[6][2].a).map(n => decompressDecimals(n)),
        photon: decompressNumbers(data[6][2].ph).map(n => decompressDecimals(n)),
        baryon: decompressNumbers(data[6][2].br).map(n => decompressDecimals(n))
      },
      cumulative: {
        timestamps: decompressTimes(data[6][3].t),
        pro: decompressNumbers(data[6][3].p).map(n => decompressDecimals(n)),
        anti: decompressNumbers(data[6][3].a).map(n => decompressDecimals(n)),
        photon: decompressNumbers(data[6][3].ph).map(n => decompressDecimals(n)),
        baryon: decompressNumbers(data[6][3].br).map(n => decompressDecimals(n))
      }
    }
  };
};

export {
  compressMetadata,
  decompressMetadata,
  compressDecimals,
  decompressDecimals,
  compressTimes,
  decompressTimes,
  compressWithRLE,
  decompressRLE,
  compressNumbers,
  decompressNumbers,
  compressBinaryStates,
  decompressBinaryStates
};