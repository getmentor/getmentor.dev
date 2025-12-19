# Project Overview

This is a full-stack web application built with Next.js that serves as a platform for connecting mentors with mentees. The project is named "getmentor".

## Key Technologies

- **Frontend:**
  - Next.js (React framework)
  - TypeScript
  - Tailwind CSS for styling
  - `react-hook-form` and `yup` for forms and validation
  - `@tiptap/react` for rich text editing
- **Backend:**
  - Next.js API routes act as a proxy to a Go backend.
  - The Go backend seems to handle the core business logic, including mentor data management and user authentication.
- **Testing:**
  - Jest for unit and integration tests
  - React Testing Library for component testing
- **Observability:**
  - Grafana Faro for frontend monitoring
  - OpenTelemetry for tracing
- **Linting:**
  - ESLint with TypeScript, React, and Next.js plugins.

## Architecture

The application follows a two-tier architecture:

1.  **Next.js Frontend:** A Next.js application serves the user interface and handles user interactions.
2.  **Go Backend:** A separate Go application (not present in this repository) exposes a REST API that the Next.js application communicates with. The Next.js API routes act as a proxy to this Go backend, providing an additional layer of security and abstraction.

Mentor data and other application data are managed by the Go backend.

# Building and Running

## Prerequisites

- Node.js (v22.x)
- yarn

## Development

To run the development server:

```bash
yarn dev
```

The application will be available at `http://localhost:3000`.

## Production

To build the application for production:

```bash
yarn build
```

To start the production server:

```bash
yarn start
```

# Testing

To run the tests:

```bash
yarn test
```

# Development Conventions

## Linting

The project uses ESLint to enforce code style and catch potential errors. To run the linter:

```bash
yarn lint
```

## Pre-commit Hooks

The project uses `lint-staged` and `simple-git-hooks` to automatically run Prettier and ESLint on staged files before committing.

## Environment Variables

The project uses a `.env.example` file to document the required environment variables. These include credentials for the Go API backend and other services.
