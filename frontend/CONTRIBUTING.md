# Contributing Guide

Welcome to the frontend project! This guide will help you get started with the project structure, setup, and development workflow.

## Table of Contents

- [Introduction](#introduction)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Configuration Files](#configuration-files)
- [Development Workflow](#development-workflow)
- [Code Style & Formatting](#code-style--formatting)
- [Available Scripts](#available-scripts)
- [Troubleshooting](#troubleshooting)

## Introduction

This is a modern React frontend application built with:

- **TypeScript** for type safety
- **Vite** for fast development and building
- **Bun** as the package manager and runtime
- **Tailwind CSS** for styling
- **ESLint** and **Prettier** for code quality

## Tech Stack

| Technology   | Purpose                 | Version |
| ------------ | ----------------------- | ------- |
| React        | UI Framework            | 19.2.0  |
| TypeScript   | Type Safety             | 5.7.2   |
| Vite         | Build Tool & Dev Server | 7.2.4   |
| Bun          | Package Manager         | 1.1.38  |
| Tailwind CSS | Styling                 | 4.1.18  |
| ESLint       | Linting                 | 9.39.1  |
| Prettier     | Code Formatting         | 3.7.4   |

## Prerequisites

Before you begin, ensure you have the following installed:

1. **Bun** (v1.1.38 or higher)

    ```bash
    curl -fsSL https://bun.sh/install | bash
    ```

2. **Node.js** (v22.17.1 - specified in `.nvmrc`)

    ```bash
    # If using nvm
    nvm install 22.17.1
    nvm use
    ```

3. **VS Code** (recommended) with extensions:
    - Prettier - Code formatter
    - ESLint
    - Tailwind CSS IntelliSense
    - TypeScript and JavaScript Language Features

    > **Tip**: VS Code will automatically prompt you to install recommended extensions when you open the project.

## Project Structure

```
frontend/
├── src/                    # Source code directory
│   ├── App.tsx            # Main React component
│   ├── main.tsx          # Application entry point
│   ├── index.css         # Global styles
│   └── assets/           # Static assets (images, icons, etc.)
│       └── react.svg
│
├── public/                # Public static files (served as-is)
│   └── vite.svg
│
├── .vscode/               # VS Code workspace settings
│   ├── settings.json     # Editor configuration
│   └── extensions.json   # Recommended extensions
│
├── node_modules/          # Dependencies (auto-generated)
│
├── index.html             # HTML template
├── package.json           # Project dependencies and scripts
├── tsconfig.json          # TypeScript configuration
├── vite.config.ts         # Vite build configuration
├── eslint.config.js       # ESLint configuration
├── .prettierrc            # Prettier formatting rules
├── .prettierignore        # Files to ignore for Prettier
├── .editorconfig          # Editor configuration
├── .gitignore             # Git ignore rules
├── .bun-version           # Bun version specification
├── .nvmrc                 # Node.js version specification
├── bunfig.toml            # Bun configuration
└── README.md              # Project documentation
```

### Key Directories Explained

- **`src/`**: All your application code lives here
    - `App.tsx`: Root component of your React app
    - `main.tsx`: Entry point that renders the app to the DOM
    - `index.css`: Global CSS styles
    - `assets/`: Images, icons, and other static files

- **`public/`**: Files that are copied to the build output as-is (e.g., favicon, robots.txt)

- **`.vscode/`**: VS Code workspace settings that ensure consistent development experience

## Getting Started

### Step 1: Clone the Repository

```bash
git clone git@github.com:repo-kts/atari.git
cd atari/frontend
```

### Step 2: Install Dependencies

Using Bun (recommended):

```bash
bun install
```

Or using npm:

```bash
npm install
```

### Step 3: Verify Installation

Check that everything is set up correctly:

```bash
# Type check
bun run type-check

# Lint check
bun run lint

# Format check
bun run format:check
```

### Step 4: Start Development Server

```bash
# Using Bun (recommended)
bun run dev

# Or using Bun's native runtime
bun run dev:bun
```

The development server will start at `http://localhost:5173` (or the next available port).

> **Note**: The server supports Hot Module Replacement (HMR), so changes will reflect immediately without a full page reload.

## Configuration Files

### TypeScript (`tsconfig.json`)

- **Purpose**: TypeScript compiler configuration
- **Key Settings**:
    - Strict mode enabled for type safety
    - Path aliases: `@/*` maps to `./src/*`
    - JSX support for React
    - Target: ES2020

**Usage Example**:

```typescript
// Instead of: import Button from '../../../components/Button'
import Button from '@/components/Button'
```

### ESLint (`eslint.config.js`)

- **Purpose**: Code linting and quality checks
- **Features**:
    - Separate rules for JavaScript and TypeScript
    - React Hooks rules
    - React Refresh support for Vite
    - Prettier integration (no conflicts)

### Prettier (`.prettierrc`)

- **Purpose**: Code formatting
- **Key Rules**:
    - 4-space indentation
    - Single quotes (except JSX attributes)
    - No semicolons
    - 80 character line width
    - Trailing commas

### Vite (`vite.config.ts`)

- **Purpose**: Build tool configuration
- **Plugins**:
    - React plugin for JSX/TSX support
    - Tailwind CSS plugin for styling

### Editor Config (`.editorconfig`)

- **Purpose**: Consistent editor settings across different IDEs
- **Settings**: 4-space indentation, LF line endings

## Development Workflow

### 1. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### 2. Make Your Changes

- Write your code in TypeScript (`.tsx` for React components)
- Follow the project's code style (see [Code Style](#code-style--formatting))
- Use path aliases (`@/`) for imports

### 3. Format Your Code

Before committing, format your code:

```bash
bun run format
```

This will automatically format all files with 4-space indentation.

### 4. Check for Linting Errors

```bash
# Check for errors
bun run lint

# Auto-fix errors
bun run lint:fix
```

### 5. Type Check

Ensure TypeScript is happy:

```bash
bun run type-check
```

### 6. Test Your Changes

Start the dev server and test your changes:

```bash
bun run dev
```

### 7. Commit Your Changes

```bash
git add .
git commit -m "feat: add new feature"
```

**Commit Message Format**:

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `style:` - Formatting
- `refactor:` - Code refactoring
- `test:` - Tests
- `chore:` - Maintenance

## Code Style & Formatting

### Indentation

- **4 spaces** (not tabs) for all files
- Configured in `.prettierrc`, `.editorconfig`, and VS Code settings

### Quotes

- **Single quotes** for strings: `'hello'`
- **Double quotes** for JSX attributes: `<div className="foo">`

### Semicolons

- **No semicolons** at the end of statements

### Line Length

- Maximum **80 characters** per line

### TypeScript Best Practices

1. **Use explicit types** when the type isn't obvious:

    ```typescript
    function greet(name: string): string {
        return `Hello, ${name}!`
    }
    ```

2. **Use interfaces** for object shapes:

    ```typescript
    interface User {
        id: number
        name: string
        email: string
    }
    ```

3. **Leverage type inference** when types are obvious:
    ```typescript
    const count = 0 // TypeScript infers: number
    ```

## Available Scripts

| Command                | Description                                |
| ---------------------- | ------------------------------------------ |
| `bun run dev`          | Start development server                   |
| `bun run dev:bun`      | Start dev server with Bun's native runtime |
| `bun run build`        | Build for production                       |
| `bun run build:bun`    | Build with Bun's native runtime            |
| `bun run preview`      | Preview production build locally           |
| `bun run lint`         | Check for linting errors                   |
| `bun run lint:fix`     | Auto-fix linting errors                    |
| `bun run format`       | Format all code files                      |
| `bun run format:check` | Check if files are formatted               |
| `bun run type-check`   | Run TypeScript type checking               |

## Troubleshooting

### Port Already in Use

If port 5173 is already in use, Vite will automatically use the next available port. Check the terminal output for the actual port.

### Type Errors

If you see TypeScript errors:

1. Run `bun run type-check` to see all errors
2. Check that you're using correct types
3. Ensure all imports are correct

### Formatting Issues

If files aren't formatting correctly:

1. Ensure Prettier extension is installed in VS Code
2. Run `bun run format` manually
3. Check `.prettierignore` to ensure file isn't ignored

### Dependency Issues

If you encounter dependency errors:

```bash
# Clear cache and reinstall
rm -rf node_modules bun.lockb
bun install
```

### ESLint Errors

If ESLint shows errors:

1. Run `bun run lint:fix` to auto-fix
2. Check `eslint.config.js` for rule configurations
3. Ensure you're following the project's code style

## VS Code Setup

The project includes VS Code settings for optimal development:

- **Auto-format on save**: Enabled
- **ESLint auto-fix on save**: Enabled
- **4-space indentation**: Enforced
- **Single quotes**: Enforced for JS/TS

When you open the project, VS Code will:

1. Prompt you to install recommended extensions
2. Apply workspace settings automatically
3. Enable format on save

## Next Steps

1. ✅ Install dependencies: `bun install`
2. ✅ Start dev server: `bun run dev`
3. ✅ Open `http://localhost:5173` in your browser
4. ✅ Read the code in `src/App.tsx` to understand the structure
5. ✅ Make your first change and see it hot-reload!
