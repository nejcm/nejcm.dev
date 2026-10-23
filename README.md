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

- Site details (name, bio, location, role, links): `src/site.ts`.
- Add a project: create `src/content/projects/<slug>.mdx` with frontmatter
  `title`, `description`, `tags`, optional `featured` (shown on home, max 4), `order`, `url` (app), `repo`, `docs`, `example`.
- Add a post: create `src/content/posts/<slug>.mdx` with `title`, `date` (YYYY-MM-DD), optional `description`, `draft`.
  Home shows the 4 latest non-draft posts.

### MDX components

Available in every post without imports (`src/components/mdx/`):

- `<RepoCard repo="owner/name" description="…" language="TS" />`
- `<LinkCard href="…" title="…" description="…" kind="docs|demo|link" />`
- `<Callout type="note|tip|warn" title="…">…</Callout>`
- `<Figure src="/img.png|/clip.mp4" alt="…" caption="…" />`
- `<Chart type="bar|line" title="…" unit="ms" data={[{ label: 'a', value: 1 }]} />`
- `<Kbd>Ctrl</Kbd>`
- `<Steps>` wrapping a markdown ordered list `</Steps>`

Schemas live in `src/content.config.ts`.

## License

Code is [MIT](LICENSE). Posts and project write-ups in `src/content/` are © nejcm, all rights reserved.
