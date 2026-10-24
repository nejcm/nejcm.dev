// Commit-graph style block grid; cells near the cursor darken fast and fade back slowly.
const grid = document.getElementById('bg-grid')!;
const MAX = 9;
const R = 5.5;
const STRENGTH = 4;
const TRAIL = 1100;
const shade = (lvl: number) => `var(--g${lvl})`;

function hash(n: number) {
  n = (n ^ 61) ^ (n >>> 16);
  n = n + (n << 3);
  n = n ^ (n >>> 4);
  n = Math.imul(n, 0x27d4eb2d);
  n = n ^ (n >>> 15);
  return (n >>> 0) / 4294967296;
}

let cols = 0;
let rows = 0;
let pitch = 18;
let cells: HTMLDivElement[] = [];
let levels: number[] = [];
let active = new Map<number, number>();

function build() {
  // Grow cells on huge screens so the grid stays under ~25.6k nodes.
  const p = Math.max(18, Math.ceil(Math.sqrt((innerWidth * innerHeight) / 25600)));
  const c = Math.ceil(innerWidth / p) + 1;
  const r = Math.ceil(innerHeight / p) + 1;
  if (c === cols && r === rows && p === pitch) return;
  pitch = p;
  cols = c;
  rows = r;
  active = new Map();
  levels = [];
  const frag = document.createDocumentFragment();
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const noise = hash(y * 7919 + x * 104729 + 17);
      const wave = (Math.sin(x * 0.19 + y * 0.07) * Math.sin(y * 0.23 - x * 0.05) + 1) / 2;
      const v = noise * 0.72 + wave * 0.34;
      const lvl = v > 0.98 ? 4 : v > 0.88 ? 3 : v > 0.74 ? 2 : v > 0.56 ? 1 : 0;
      levels.push(lvl);
      const el = document.createElement('div');
      el.style.backgroundColor = shade(lvl);
      frag.append(el);
    }
  }
  grid.style.setProperty('--cell', `${pitch - 4}px`);
  grid.style.gridTemplateColumns = `repeat(${cols}, var(--cell))`;
  grid.replaceChildren(frag);
  cells = [...grid.children] as HTMLDivElement[];
}

let mx: number | null = null;
let my = 0;
let raf = 0;

function paint() {
  raf = 0;
  const next = new Map<number, number>();
  if (mx !== null) {
    const fc = (mx - (pitch - 4) / 2) / pitch;
    const fr = (my - (pitch - 4) / 2) / pitch;
    for (let r = Math.max(0, Math.floor(fr - R)); r <= Math.min(rows - 1, Math.ceil(fr + R)); r++) {
      for (let c = Math.max(0, Math.floor(fc - R)); c <= Math.min(cols - 1, Math.ceil(fc + R)); c++) {
        const d = Math.hypot(c - fc, r - fr);
        if (d > R) continue;
        let t = 1 - d / R;
        t = t * t * (3 - 2 * t);
        const idx = r * cols + c;
        const jitter = (hash(idx * 31 + 5) - 0.5) * 1.3;
        const boost = Math.round(t * STRENGTH + jitter * t + (t > 0.15 ? 0.2 : -0.6));
        if (boost > 0) next.set(idx, Math.min(MAX, levels[idx] + boost));
      }
    }
  }
  next.forEach((lvl, idx) => {
    if (active.get(idx) === lvl) return;
    cells[idx].style.transition = 'background-color 120ms cubic-bezier(.2,.8,.2,1)';
    cells[idx].style.backgroundColor = shade(lvl);
  });
  active.forEach((_, idx) => {
    if (next.has(idx)) return;
    cells[idx].style.transition = reduced.matches ? "none" : `background-color ${TRAIL}ms cubic-bezier(.3,0,.2,1)`;
    cells[idx].style.backgroundColor = shade(levels[idx]);
  });
  active = next;
}

const schedule = () => {
  if (!raf) raf = requestAnimationFrame(paint);
};

build();
addEventListener('resize', build);
// Lingering inline transitions would make every touched cell animate on theme switch.
grid.addEventListener('transitionend', (e) => ((e.target as HTMLElement).style.transition = ''));
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const clear = () => {
  mx = null;
  schedule();
};
addEventListener('pointermove', (e) => {
  if (reduced.matches) return;
  mx = e.clientX;
  my = e.clientY;
  schedule();
});
document.documentElement.addEventListener('pointerleave', clear);
reduced.addEventListener('change', clear);
