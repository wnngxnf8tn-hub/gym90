type Rng = () => number;

export const mulberry32 = (seed: number): Rng => {
  let t = seed;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
};

export const createRng = (seed?: number) => {
  if (typeof seed === "number" && !Number.isNaN(seed)) {
    return mulberry32(seed);
  }
  return Math.random;
};

export const pickWeighted = <T,>(items: Array<{ value: T; weight: number }>, rng: Rng) => {
  const total = items.reduce((sum, item) => sum + item.weight, 0);
  let roll = rng() * total;
  for (const item of items) {
    if (roll < item.weight) return item.value;
    roll -= item.weight;
  }
  return items[items.length - 1]?.value;
};

export const pickN = <T,>(items: T[], count: number, rng: Rng) => {
  const copy = [...items];
  const result: T[] = [];
  while (copy.length && result.length < count) {
    const index = Math.floor(rng() * copy.length);
    result.push(copy.splice(index, 1)[0]);
  }
  return result;
};
