# Kalnet FS3 Dashboard

Production-ready starter repository for a full-stack dashboard built with Next.js 14, TypeScript, Tailwind CSS, App Router, Prisma, and Recharts.

## Branch strategy

- `main`: protected production branch
- `develop`: shared integration branch
- `feature/*`: short-lived developer branches merged into `develop`

## Local setup

```bash
npm install
copy .env.example .env
npm run prisma:generate
npm run dev
```

Open `http://localhost:3000`.

## Required GitHub protections

Apply these rules in GitHub Settings > Branches:

- `main`
  - Require a pull request before merging
  - Require at least 1 approval
  - Dismiss force pushes
  - Prevent branch deletion
  - Restrict direct pushes
- `develop`
  - Require a pull request before merging

## Recommended developer workflow

```bash
git checkout main
git pull origin main
git checkout develop
git pull origin develop
git checkout -b feature/<ticket-or-scope>
# work, commit, push
git push -u origin feature/<ticket-or-scope>
```

Open a pull request from `feature/*` into `develop`. Promote tested work from `develop` into `main` through a reviewed pull request.
