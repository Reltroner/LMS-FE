# Reltroner Learning Academy

Engineering foundation for `lms.reltroner.com`, a future content-driven learning platform for engineering skills, AI skills, and project-based learning.

This first chunk intentionally avoids LMS product features. It establishes a clean Next.js App Router baseline that can grow into courses, paths, authors, MDX content, and Vercel deployment later.

## Stack

- Next.js 16 App Router
- React 19
- TypeScript with strict mode
- Tailwind CSS 4
- ESLint 9 with Next.js config
- Prettier
- Husky
- Commitlint with conventional commits
- Vercel-ready Next.js defaults

## Folder Structure

```text
src/
  app/
  components/
    layout/
    marketing/
    ui/
  content/
    authors/
    courses/
    paths/
  lib/
    constants/
    mdx/
    seo/
    utils/
  types/
docs/
public/
  icons/
  images/
```

## Local Development

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open `http://localhost:3000`.

Run quality checks:

```bash
npm run lint
npm run format:check
npm run build
```

Format files:

```bash
npm run format
```

## Git Hooks

Husky is configured with:

- `pre-commit`: runs ESLint and Prettier check
- `commit-msg`: validates conventional commit messages with Commitlint
