/**
 * Metadata de-compression utilities
 */

const decompressMetadata = (compressed) => {
  if (!compressed) return metadataInit;

  // Helper function to decompress numbers
  const decompressNumber = (num) => (num || 0) / 10000;

  // Helper to decompress arrays or single numbers
  const decompressArray = (arr) => {
    if (!arr) return [];
    if (Array.isArray(arr)) return arr.map(decompressNumber);
    if (typeof arr === "number") return [decompressNumber(arr)];
    return [];
  };

  // Helper to ensure array
  const ensureArray = (val) => {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    return [val];
  };

  return {
    startTime: compressed.t?.s || "-",
    endTime: compressed.t?.e || "-",
    colliderDistribution: {
      u: decompressNumber(compressed.c?.u),
      s: decompressNumber(compressed.c?.s),
      range: ensureArray(compressed.c?.range),
      distribution: ensureArray(compressed.c?.distribution),
      short: ensureArray(compressed.c?.short),
      curve: ensureArray(compressed.c?.curve),
    },
    totalDistribution: {
      u: decompressNumber(compressed.d?.u),
      s: decompressNumber(compressed.d?.s),
      bags: {
        pro: decompressArray(compressed.d?.b?.p),
        anti: decompressArray(compressed.d?.b?.a),
        photon: decompressArray(compressed.d?.b?.h),
        baryon: decompressArray(compressed.d?.b?.b),
      },
      wallets: ensureArray(compressed.d?.w),
    },
    emissionsData: {
      total: decompressNumber(compressed.e?.t),
      baryonTokens: decompressNumber(compressed.e?.b),
      photonTokens: decompressNumber(compressed.e?.p),
    },
    collisionsData: {
      total: decompressNumber(compressed.l?.t) || 1e9,
      antiTokens: decompressNumber(compressed.l?.a),
      proTokens: decompressNumber(compressed.l?.p),
    },
    eventsOverTime: {
      timestamps: ensureArray(compressed.o?.t) || ["", "", "", "", ""],
      events: {
        pro: decompressArray(compressed.o?.e?.p),
        anti: decompressArray(compressed.o?.e?.a),
        photon: decompressArray(compressed.o?.e?.h),
        baryon: decompressArray(compressed.o?.e?.b),
      },
      ranges: {
        pro: compressed.o?.r?.p || {
          "0-100k": 0,
          "100k-1m": 0,
          "1-10m": 0,
        },
        anti: compressed.o?.r?.a || {
          "0-100k": 0,
          "100k-1m": 0,
          "1-10m": 0,
        },
        photon: compressed.o?.r?.h || {
          "0-100k": 0,
          "100k-1m": 0,
          "1-10m": 0,
        },
        baryon: compressed.o?.r?.b || {
          "0-100k": 0,
          "100k-1m": 0,
          "1-10m": 0,
        },
      },
      cumulative: {
        timestamps: ensureArray(compressed.o?.c?.t),
        pro: decompressArray(compressed.o?.c?.p),
        anti: decompressArray(compressed.o?.c?.a),
        photon: decompressArray(compressed.o?.c?.h),
        baryon: decompressArray(compressed.o?.c?.b),
      },
    },
  };
};

export { decompressMetadata };
