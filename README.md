# nejcm

Personal website. Astro, static output, MDX content, no client framework.

## Run

```sh
bun install
bun run dev      # local dev server
bun run check    # astro check (types + .astro diagnostics)
bun run build    # static site in dist/
bun run preview  # serve dist/
```

## Content

- Site details (name, bio, location, role, email, links): `src/site.ts`.
- Add a project: create `src/content/projects/<slug>.mdx` with frontmatter
  `title`, `description`, `tags`, optional `featured` (shown on home, max 4), `order`, `url`, `repo`.
- Add a post: create `src/content/posts/<slug>.mdx` with `title`, `date` (YYYY-MM-DD), optional `description`, `draft`.
  Home shows the 4 latest non-draft posts.

Schemas live in `src/content.config.ts`. `design/` holds the original design export.
