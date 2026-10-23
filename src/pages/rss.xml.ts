import type { APIRoute } from 'astro';
import { getPosts } from '../lib';
import { site } from '../site';

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

export const GET: APIRoute = async ({ site: origin }) => {
  const items = (await getPosts())
    .map((p) => {
      const link = new URL(`/writing/${p.id}`, origin).href;
      return `<item><title>${esc(p.data.title)}</title><link>${link}</link><guid>${link}</guid><pubDate>${(p.data.updated ?? p.data.date).toUTCString()}</pubDate><description>${esc(p.data.description)}</description></item>`;
    })
    .join('');
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${esc(site.name)} — Writing</title><link>${origin!.href}</link><description>${esc(site.bio)}</description>${items}</channel></rss>`,
    { headers: { 'Content-Type': 'application/rss+xml' } },
  );
};
