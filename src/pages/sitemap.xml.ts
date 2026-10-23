import type { APIRoute } from 'astro';
import { getPosts, getProjects, isoDate } from '../lib';

export const GET: APIRoute = async ({ site }) => {
  const posts = await getPosts();
  const projects = await getProjects();
  const urls = [
    ['/', posts[0]?.data.date],
    ['/projects'],
    ['/writing', posts[0]?.data.date],
    ['/privacy'],
    ['/terms'],
    ...projects.map((p) => [`/projects/${p.id}`]),
    ...posts.map((p) => [`/writing/${p.id}`, p.data.updated ?? p.data.date]),
  ] as [string, Date?][];
  const body = urls
    .map(([path, d]) => `<url><loc>${new URL(path, site).href}</loc>${d ? `<lastmod>${isoDate(d)}</lastmod>` : ''}</url>`)
    .join('');
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}</urlset>`,
    { headers: { 'Content-Type': 'application/xml' } },
  );
};
