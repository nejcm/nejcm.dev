import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

export default defineConfig({
  site: 'https://nejcm.com',
  trailingSlash: 'never',
  build: { format: 'file' },
  integrations: [mdx()],
});
