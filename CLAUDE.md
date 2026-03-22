# CLAUDE.md — Agents 特区

## What this project is

Community website for Agents 特区 (agentszone.ai). Most members interact in WeChat groups. The website is the public-facing content hub — articles, author profiles, discussions, and event records.

## Community context

- Members are AI practitioners from various industries (finance, healthcare, education, cloud, open source)
- Primary communication happens in WeChat groups
- Regular Saturday evening online meeting via Tencent Meeting (商业版)
  - Meetings can be free or paid
  - Meetings can be internal (members only) or public-facing
- Content is bilingual: Chinese (default) + English mirror

## Content workflow for each sharing session

Each Saturday meeting typically produces:

1. **Before the meeting** — create a promotional post/article and event record
2. **Publish externally** — cross-post to Zhihu (知乎) and/or WeChat public account (公众号)
3. **After the meeting** — generate a summary article from the meeting content
4. **Video** — sometimes published, not always

## Content types and their purpose

### Articles (`src/content/articles/`)
Written by community members. Practitioner experience — how they use agents in real teams, quality control, process design. Members are encouraged to write and submit via PR.

### Authors (`src/content/authors/`)
Community members introducing themselves to the public. This serves two purposes: community identity and visibility to potential customers or collaborators. Encourage every contributing member to create a profile.

### Discussions (`src/content/discussions/`)
Key concepts distilled from community conversations. These are not articles — they are short, focused concept pages linked to Playbook chapters and related articles. Encourage members to propose new concepts when recurring themes emerge in group chats.

### Events (`src/content/events/`)
Records of the Saturday sharing sessions. Include speaker info, topic, date, and optionally a poster image.

### Poster generator (`/poster`, `/en/poster`)
Tool for creating promotional posters for upcoming events. Used before each Saturday session.

## Tech stack

- Astro 5 static site, Tailwind CSS v4, deployed on Vercel
- Content is Markdown with Zod-validated frontmatter
- `npm run build` validates all content schemas

## Development conventions

- Content files use kebab-case naming
- Files prefixed with `_` are ignored by collections
- Chinese content goes in `src/content/<collection>/`, English in `src/content/<collection>/en/`
- See CONTRIBUTING.md for frontmatter schemas and submission instructions
