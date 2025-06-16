# Monorepo Scaffold

This is a scaffold for a modern web application using a monorepo architecture. It's designed to provide a solid foundation for new projects, with a focus on type-safety, developer experience, and scalability.

## What's inside?

This monorepo includes:

- `apps/web`: An [Astro](https://astro.build/) application for the frontend.
- `packages/api`: A [tRPC](https://trpc.io/) API for type-safe client-server communication.
- `packages/db`: Database schemas, migrations, and query utilities using [Kysely](https://kysely.dev/).
- `packages/utils`: Shared utilities used across the monorepo.
- **Authentication**: Example implementation using [better-auth](https://github.com/BetterAuth/better-auth) with GitHub as an OAuth provider.
- **UI**: Basic UI setup with [Tailwind CSS](https://tailwindcss.com/) and [shadcn/ui](https://ui.shadcn.com/).
- **Tooling**:
  - [Turborepo](https://turbo.build/repo) for high-performance builds.
  - [PNPM](https://pnpm.io/) for efficient package management.
  - [TypeScript](https://www.typescriptlang.org/) for static typing.
  - [ESLint](https://eslint.org/) and [Prettier](https://prettier.io/) for code quality.

## Getting Started

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/your-repo/monorepo-scaffold.git
    cd monorepo-scaffold
    ```

2.  **Install dependencies:**

    ```bash
    pnpm install
    ```

3.  **Set up environment variables:**

    Create a `.env` file in `apps/web` and add the following variables:

    ```env
    # Generate a secret with `openssl rand -base64 32`
    AUTH_SECRET="your_auth_secret"

    # From your GitHub OAuth application
    GITHUB_CLIENT_ID="your_github_client_id"
    GITHUB_CLIENT_SECRET="your_github_client_secret"

    # Your local PostgreSQL connection string
    DATABASE_URL="postgres://user:password@localhost:5432/monorepo-scaffold"
    ```

4.  **Set up the database:**

    Make sure you have a PostgreSQL server running. Then, run the migrations:

    ```bash
    DATABASE_URL="postgres://user:password@localhost:5432/monorepo-scaffold" pnpm --filter @app/db db:migrate
    ```

5.  **Run the development server:**

    ```bash
    pnpm dev
    ```

    The web application will be available at `http://localhost:3001`.

## Development

- `pnpm build`: Build all apps and packages.
- `pnpm lint`: Lint all code.
- `pnpm typecheck`: Run TypeScript to check for type errors.
- `pnpm test`: Run tests.
