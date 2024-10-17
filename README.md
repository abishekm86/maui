## Prerequisites

- **Node.js** v20+
- **pnpm v9.12.1+** `npm install -g pnpm`
- **Git** - Rebase Workflow

## Development

1. Clone the Repo
2. Setup

```bash
pnpm install
pnpm prepare # enables automatic linting and formatting code before checkin
```

3. Develop

```bash
pnpm build # builds prod artifact
pnpm dev # runs debug artifact (unminified) with HMR
pnpm preview # runs prod artifact (no HMR)
pnpm test # executes unit tests
pnpm lint # manually lint if required
pnpm format # manually prettify if required
pnpm clean # delete all gitignored (build, cache, etc). Does not delete untracked.
pnpm reset # cleans, installs, builds and starts dev server. Does not delete untracked.
```
