import { scenes, seedOf } from './scenes';

const RAMP = ' .:-=+*#%@';
const MAX_CELLS = 3600;
const FRAME_MS = 1000 / 30;

for (const canvas of document.querySelectorAll<HTMLCanvasElement>('canvas.post-hero')) {
  const { scene = '', slug = '', style = 'pixel' } = canvas.dataset;
  const f = scenes[scene] ?? scenes.field;
  const seed = seedOf(slug);
  const ascii = style === 'ascii';
  const ctx = canvas.getContext('2d')!;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let cols = 0, rows = 0, cw = 0, ch = 0, dpr = 1;
  let palette: string[] = [];
  let visible = true;
  let raf = 0;
  let last = 0;
  const start = performance.now();

  const readPalette = () => {
    const cs = getComputedStyle(document.documentElement);
    palette = ascii ? [cs.getPropertyValue('--text-3')] : Array.from({ length: 10 }, (_, i) => cs.getPropertyValue(`--g${i}`));
  };

  const resize = () => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    dpr = devicePixelRatio || 1;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    const base = ascii ? 9 : 12;
    const pitch = Math.max(base, Math.sqrt((w * h) / MAX_CELLS));
    cw = pitch;
    ch = ascii ? pitch * 1.6 : pitch;
    cols = Math.floor(w / cw);
    rows = Math.floor(h / ch);
  };

  const draw = (t: number) => {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (ascii) {
      ctx.font = `${ch * 0.8}px ${getComputedStyle(canvas).fontFamily}`;
      ctx.textBaseline = 'top';
      ctx.fillStyle = palette[0];
    }
    const ox = (canvas.clientWidth - cols * cw) / 2;
    const oy = (canvas.clientHeight - rows * ch) / 2;
    const gap = Math.max(2, cw * 0.22);
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const v = Math.min(1, Math.max(0, f(x, y, t, seed, cols, rows)));
        if (ascii) {
          const c = RAMP[Math.round(v * (RAMP.length - 1))];
          if (c !== ' ') ctx.fillText(c, ox + x * cw, oy + y * ch);
        } else {
          ctx.fillStyle = palette[Math.round(v * 9)];
          ctx.beginPath();
          ctx.roundRect(ox + x * cw, oy + y * ch, cw - gap, ch - gap, 2);
          ctx.fill();
        }
      }
    }
  };

  const loop = (now: number) => {
    raf = requestAnimationFrame(loop);
    if (now - last < FRAME_MS) return;
    last = now;
    draw((now - start) / 1000);
  };

  const update = () => {
    cancelAnimationFrame(raf);
    raf = 0;
    if (reduced.matches || !visible || document.hidden) draw(reduced.matches ? 4 : (performance.now() - start) / 1000);
    else raf = requestAnimationFrame(loop);
  };

  readPalette();
  resize();
  new ResizeObserver(() => (resize(), update())).observe(canvas);
  new MutationObserver(() => (readPalette(), update())).observe(document.documentElement, { attributeFilter: ['data-theme'] });
  new IntersectionObserver(([e]) => ((visible = e.isIntersecting), update())).observe(canvas);
  document.addEventListener('visibilitychange', update);
  reduced.addEventListener('change', update);
  document.fonts?.ready.then(update);
}
