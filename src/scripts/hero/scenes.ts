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

const ease = (p: number) => (p <= 0 ? 0 : p >= 1 ? 1 : p * p * (3 - 2 * p));

const toolbar: Scene = (x, y, t, seed, cols, rows) => {
  const barH = rows >= 20 ? 2 : 1;
  const barTop = rows - 1 - barH;
  const L = 1, R = cols - 2;
  const slot = 2.5;
  const active = Math.floor(t / slot) % 4;
  const p = (t % slot) / slot;
  const open = ease(p / 0.2) * (1 - ease((p - 0.8) / 0.2));
  const weights = [3, 5, 4, 4];
  const unit = Math.max(2, Math.floor((R - L - 6) * 0.75 / 16));
  const chips: [number, number][] = [];
  let cx = L + 2;
  for (const w of weights) chips.push([cx, cx + w * unit - 1]), (cx += w * unit + 1);
  if (y >= barTop && y < barTop + barH && x >= L && x <= R) {
    const i = chips.findIndex(([a, b]) => x >= a && x <= b);
    if (i < 0) return x >= R - 1 ? 0.6 : 0.18;
    return i === active ? 0.55 + 0.45 * open : 0.55;
  }
  const [ca, cb] = chips[active];
  const pw = Math.min(R - L - 1, Math.max(cb - ca + 1, Math.round(cols * 0.32)));
  const px0 = Math.min(ca, R - pw + 1);
  const ph = Math.round((barTop - 3) * 0.7 * open);
  const top = barTop - 1 - ph;
  if (ph > 1 && x >= px0 && x < px0 + pw && y > top && y < barTop) {
    const ix = x - px0, iy = y - top - 1, iw = pw - 2, ih = ph - 1;
    if (ix === 0 || ix === pw - 1 || iy === 0) return 0.7;
    const cx = ix - 1, cy = iy - 1;
    const fade = ease((open - 0.7) / 0.3);
    let v = 0;
    if (active === 0) v = cy === 1 && cx >= 1 && cx < Math.min(iw - 1, 6) ? 0.95 : cy === 1 && cx === iw - 2 ? (Math.sin(t * 6) > 0 ? 1 : 0.4) : cy % 2 && cy > 2 && cx >= 1 && cx < iw * (0.3 + hash(cy + seed) * 0.5) ? 0.4 : 0;
    else if (active === 1) {
      const hgt = (0.35 + 0.3 * Math.sin(cx * 0.7 + t * 2.2) + 0.25 * Math.sin(cx * 0.31 - t * 1.3)) * (ih - 2);
      v = cx >= 1 && cx < iw - 1 && ih - 2 - cy < hgt ? (cx === iw - 2 ? 1 : 0.75) : 0;
    } else {
      const row = Math.floor((cy - 1) / 2);
      if ((cy - 1) % 2 || cy < 1 || row > 5) v = 0;
      else if (active === 2) {
        const on = Math.sin(t * 1.4 + row * 1.9 + seed) > 0;
        v = cx >= 1 && cx < iw - 5 && cx < 1 + iw * (0.25 + hash(row + seed) * 0.3) ? 0.4 : cx >= iw - 4 && cx < iw - 1 ? (cx - (iw - 4) === (on ? 2 : 0) ? 1 : on ? 0.7 : 0.3) : 0;
      } else {
        const done = row < (p - 0.2) * 12;
        v = cx === 1 ? (done ? 1 : 0.35) : cx >= 3 && cx < 3 + iw * (0.3 + hash(row * 3 + seed) * 0.4) ? 0.4 : 0;
      }
    }
    return 0.1 + v * fade * 0.9;
  }
  if (x >= L && x <= R && y >= 1 && y < barTop) {
    if (y === 1) return x < L + 4 ? 0.32 : 0.2;
    const col = x < L + Math.round(cols * 0.18) ? 0 : 1;
    if (col === 0) return y % 2 && y > 2 && x > L && x < L + Math.round(cols * 0.18) - 2 ? 0.18 : grain(x, y, seed) * 0.5;
    const by = y - 3;
    if (by >= 0 && by < 4 && x > L + Math.round(cols * 0.2) && x < R - 1) return 0.16;
    if (by > 5 && by % 2 && x > L + Math.round(cols * 0.2) && x < L + Math.round(cols * (0.5 + 0.3 * hash(y + seed)))) return 0.16;
    return grain(x, y, seed) * 0.5;
  }
  return grain(x, y, seed) * 0.4;
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
