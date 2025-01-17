/**
 * Metadata compression utilities
 */

const compressMetadata = (metadata) => {
  if (!metadata) return null;

  // Helper function to compress numbers to 4 decimals
  const compressNumber = (num) => Math.round(num * 10000) || 0;

  // Helper to compress arrays of numbers
  const compressArray = (arr) => arr.map(compressNumber);

  // Deep clone to avoid mutations
  const compressed = {
    t: {
      // time
      s: metadata.startTime,
      e: metadata.endTime,
    },
    c: {
      // collider
      u: compressNumber(metadata.colliderDistribution.u),
      s: compressNumber(metadata.colliderDistribution.s),
    },
    d: {
      // distribution
      u: compressNumber(metadata.totalDistribution.u),
      s: compressNumber(metadata.totalDistribution.s),
      b: {
        // bags
        p: compressArray(metadata.totalDistribution.bags.pro),
        a: compressArray(metadata.totalDistribution.bags.anti),
        h: compressNumber(metadata.totalDistribution.bags.photon),
        b: compressNumber(metadata.totalDistribution.bags.baryon),
      },
      w: metadata.totalDistribution.wallets, // wallets don't need compression
    },
    e: {
      // emissions
      t: compressNumber(metadata.emissionsData.total),
      b: compressNumber(metadata.emissionsData.baryonTokens),
      p: compressNumber(metadata.emissionsData.photonTokens),
    },
    l: {
      // collisions
      t: compressNumber(metadata.collisionsData.total),
      a: compressNumber(metadata.collisionsData.antiTokens),
      p: compressNumber(metadata.collisionsData.proTokens),
    },
    o: {
      // events over time
      t: metadata.eventsOverTime.timestamps,
      e: {
        p: compressArray(metadata.eventsOverTime.events.pro),
        a: compressArray(metadata.eventsOverTime.events.anti),
        h: compressArray(metadata.eventsOverTime.events.photon),
        b: compressArray(metadata.eventsOverTime.events.baryon),
      },
      r: {
        p: metadata.eventsOverTime.ranges.pro,
        a: metadata.eventsOverTime.ranges.anti,
        h: metadata.eventsOverTime.ranges.photon,
        b: metadata.eventsOverTime.ranges.baryon,
      },
      c: {
        t: metadata.eventsOverTime.cumulative.timestamps,
        p: compressArray(metadata.eventsOverTime.cumulative.pro),
        a: compressArray(metadata.eventsOverTime.cumulative.anti),
        h: compressArray(metadata.eventsOverTime.cumulative.photon),
        b: compressArray(metadata.eventsOverTime.cumulative.baryon),
      },
    },
  };

  return compressed;
};

const decompressMetadata = (compressed) => {
  if (!compressed) return metadataInit;

  // Helper function to decompress numbers
  const decompressNumber = (num) => (num || 0) / 10000;

  // Helper to decompress arrays of numbers with fallback
  const decompressArray = (arr) => (arr ? arr.map(decompressNumber) : []);

  return {
    startTime: compressed.t?.s || "-",
    endTime: compressed.t?.e || "-",
    colliderDistribution: {
      u: decompressNumber(compressed.c?.u),
      s: decompressNumber(compressed.c?.s),
      range: compressed.c?.range || [],
      distribution: compressed.c?.distribution || [],
      short: compressed.c?.short || [],
      curve: compressed.c?.curve || [],
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
      wallets: compressed.d?.w || [],
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
      timestamps: compressed.o?.t || ["", "", "", "", ""],
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
        timestamps: compressed.o?.c?.t || [],
        pro: decompressArray(compressed.o?.c?.p),
        anti: decompressArray(compressed.o?.c?.a),
        photon: decompressArray(compressed.o?.c?.h),
        baryon: decompressArray(compressed.o?.c?.b),
      },
    },
  };
};

export { compressMetadata, decompressMetadata };
