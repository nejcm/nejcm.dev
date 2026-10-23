export type Scene = (x: number, y: number, t: number, seed: number, cols: number, rows: number) => number;

export function hash(n: number) {
  n = (n ^ 61) ^ (n >>> 16);
  n = n + (n << 3);
  n = n ^ (n >>> 4);
  n = Math.imul(n, 0x27d4eb2d);
  n = n ^ (n >>> 15);
  return (n >>> 0) / 4294967296;
}

export const seedOf = (s: string) => [...s].reduce((h, c) => Math.imul(h ^ c.charCodeAt(0), 16777619), 2166136261) >>> 0;

const grain = (x: number, y: number, seed: number) => hash(x * 104729 + y * 7919 + seed) * 0.12;

const field: Scene = (x, y, t, seed) => {
  const a = hash(seed) * 6.28;
  const b = hash(seed + 1) * 6.28;
  const v =
    Math.sin(x * 0.11 + t * 0.4 + a) * Math.sin(y * 0.17 - t * 0.3 + b) +
    Math.sin((x + y) * 0.07 + t * 0.25 + a * b) * 0.6;
  return Math.max(0, (v + 1.6) / 3.2) ** 2.2 * 0.8 + grain(x, y, seed);
};

const toolbar: Scene = (x, y, t, seed, cols, rows) => {
  const barTop = rows - 4;
  if (y >= barTop && y < rows - 1 && x > 1 && x < cols - 2) {
    const seg = Math.floor((x - 2) / 7);
    if ((x - 2) % 7 === 6) return 0.1;
    const shown = Math.floor(t * 2) % (Math.ceil(cols / 7) + 6);
    return seg < shown ? (y === barTop ? 0.95 : 0.65) : 0.08;
  }
  if (y === barTop - 3 && x % 6 === 3 && x < cols - 2) return hash(x * 31 + Math.floor(t / 0.7) * 977 + seed) > 0.5 ? 1 : 0.25;
  return grain(x, y, seed);
};

const market: Scene = (x, y, t, seed, cols, rows) => {
  const u = x + Math.floor(t * 4);
  const price = (k: number) => rows / 2 + Math.sin(k * 0.13 + seed) * rows * 0.22 + Math.sin(k * 0.41 + seed * 2) * rows * 0.1 + (hash(k + seed) - 0.5) * 1.5;
  const now = Math.floor(cols * 0.72);
  if (u % 9 === 0) {
    const guess = Math.round(price(u) + (hash(u * 7 + seed) - 0.5) * 4);
    if (y === guess) return x < now ? 1 : 0.4;
  }
  if (x === now) return y % 2 ? 0.3 : 0.05;
  if (x > now) return grain(x, y, seed) * 0.5;
  const p = price(u);
  const d = Math.abs(y - p);
  return d < 0.7 ? 0.85 : y > p ? 0.12 : grain(x, y, seed) * 0.5;
};

const ulis: Scene = (x, y, t, seed, cols, rows) => {
  const sx = Math.round(cols * 0.14);
  const sy = Math.floor(rows / 2);
  const tx = Math.round(cols * 0.86);
  if (Math.abs(x - sx) <= 1 && Math.abs(y - sy) <= 1) return 1;
  let v = grain(x, y, seed);
  for (let i = 0; i < 5; i++) {
    const ty = Math.round((rows * (i + 1)) / 6);
    if (Math.abs(x - tx) <= 1 && Math.abs(y - ty) <= 1) return 0.9;
    if (x <= sx || x >= tx) continue;
    const s = (x - sx) / (tx - sx);
    if (Math.abs(y - (sy + (ty - sy) * s)) > 0.5) continue;
    const pulse = (t * 0.45 + i * 0.07) % 1;
    v = Math.max(v, 0.22 + Math.max(0, 1 - Math.abs(s - pulse) * 12) * 0.78);
  }
  return v;
};

export const scenes: Record<string, Scene> = { field, 'dev-toolbar': toolbar, 'market-bot': market, ulis };
