import { getCollection } from 'astro:content';

export const getProjects = async () =>
  (await getCollection('projects')).sort((a, b) => a.data.order - b.data.order);

export const getPosts = async () =>
  (await getCollection('posts', (p) => !p.data.draft)).sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf(),
  );

export const isoDate = (d: Date) => d.toISOString().slice(0, 10);
