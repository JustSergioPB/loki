# Contributing to Our Monorepo

Welcome to our project! This guide will help you understand our development process and conventions.

## Getting Started

1. Fork and clone the repository
2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```
3. The prepare script will automatically set up Husky git hooks

## Development Workflow

### Branch Naming Convention

All branches must follow this naming pattern:
```
<type>/<JIRA-ID>-<description>
```

Where:
- `type` must be one of:
  - `feature`: New features
  - `bugfix`: Bug fixes
  - `hotfix`: Critical fixes for production
  - `release`: Release preparation
- `JIRA-ID`: The associated JIRA ticket (e.g., PROJ-123)
- `description`: Brief, hyphen-separated description

Examples:
- `feature/PROJ-123-add-user-authentication`
- `bugfix/PROJ-456-fix-login-validation`
- `hotfix/PROJ-789-fix-security-vulnerability`

### Commit Message Convention

We follow the Conventional Commits specification. Each commit message must be structured as follows:

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

Where:
- `type`: Must be one of:
  - `feat`: New feature
  - `fix`: Bug fix
  - `docs`: Documentation changes
  - `style`: Code style changes (formatting, etc.)
  - `refactor`: Code refactoring
  - `test`: Adding or updating tests
  - `chore`: Maintenance tasks
- `scope`: Must be one of:
  - `app`: Changes to applications
  - `pkg`: Changes to shared packages
  - `deps`: Dependency updates
  - `ci`: CI/CD changes
  - `chore`: General maintenance
- `subject`: Short description in present tense, lowercase, no period at the end

Examples:
```
feat(app): add user authentication system
fix(pkg): resolve memory leak in cache module
docs(app): update API documentation
```

## Git Hooks

We use Husky to enforce quality standards. The following hooks are configured:

### Pre-commit Hook
Runs automatically before each commit and:
- Lints modified files using ESLint
- Formats code using Prettier
- Validates branch naming convention

To skip in emergencies:
```bash
git commit --no-verify -m "your message"
```

### Pre-push Hook
Runs automatically before pushing and:
- Runs tests for affected workspaces
- Performs type checking
- Ensures build success

To skip in emergencies:
```bash
git push --no-verify
```

### Commit Message Hook
Validates that your commit messages follow the conventional commits specification.

## Testing

### Running Tests
```bash
# Run all tests
npm run test

# Run tests for specific workspace
npm run test --filter=@your-org/workspace-name
```

### Writing Tests
- Place tests in `__tests__` directories or with `.test.ts` extension
- Each feature should have corresponding tests
- Aim for high test coverage, especially in shared packages

## Type Checking

We use TypeScript for type safety. Run type checking:
```bash
# Check all workspaces
npm run typecheck

# Check specific workspace
npm run typecheck --filter=@your-org/workspace-name
```

## Linting and Formatting

### ESLint
```bash
# Lint all files
npm run lint

# Lint specific workspace
npm run lint --filter=@your-org/workspace-name

# Fix automatic issues
npm run lint -- --fix
```

### Prettier
```bash
# Format all files
npm run format

# Check formatting without fixing
npm run format:check
```

## Working with Workspaces

### Structure
```
.
├── apps/
│   ├── web/
│   └── api/
├── packages/
│   ├── ui/
│   └── utils/
└── package.json
```

### Adding Dependencies
```bash
# Add to specific workspace
npm install package-name --filter=@your-org/workspace-name

# Add to all workspaces
npm install package-name -w
```

## CI/CD Pipeline

Our CI pipeline runs:
1. Linting and type checking
2. Unit tests
3. Integration tests
4. Build verification

Ensure all these checks pass locally before pushing.

## Release Process

1. Create a release branch: `release/v1.2.3`
2. Update version numbers and CHANGELOG.md
3. Create a pull request
4. After approval and merge, tag the release

## Getting Help

- Check existing issues before creating new ones
- Use appropriate labels when creating issues
- For questions, use the Discussions tab
- For security issues, see SECURITY.md

## Code of Conduct

Please read our [Code of Conduct](./CODE_OF_CONDUCT.md) before contributing.

Thank you for contributing to our project! 🎉# Contributing to Our Monorepo

Welcome to our project! This guide will help you understand our development process and conventions.

## Getting Started

1. Fork and clone the repository
2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```
3. The prepare script will automatically set up Husky git hooks

## Development Workflow

### Branch Naming Convention

All branches must follow this naming pattern:
```
<type>/<JIRA-ID>-<description>
```

Where:
- `type` must be one of:
  - `feature`: New features
  - `bugfix`: Bug fixes
  - `hotfix`: Critical fixes for production
  - `release`: Release preparation
- `JIRA-ID`: The associated JIRA ticket (e.g., PROJ-123)
- `description`: Brief, hyphen-separated description

Examples:
- `feature/PROJ-123-add-user-authentication`
- `bugfix/PROJ-456-fix-login-validation`
- `hotfix/PROJ-789-fix-security-vulnerability`

### Commit Message Convention

We follow the Conventional Commits specification. Each commit message must be structured as follows:

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

Where:
- `type`: Must be one of:
  - `feat`: New feature
  - `fix`: Bug fix
  - `docs`: Documentation changes
  - `style`: Code style changes (formatting, etc.)
  - `refactor`: Code refactoring
  - `test`: Adding or updating tests
  - `chore`: Maintenance tasks
- `scope`: Must be one of:
  - `app`: Changes to applications
  - `pkg`: Changes to shared packages
  - `deps`: Dependency updates
  - `ci`: CI/CD changes
  - `chore`: General maintenance
- `subject`: Short description in present tense, lowercase, no period at the end

Examples:
```
feat(app): add user authentication system
fix(pkg): resolve memory leak in cache module
docs(app): update API documentation
```

## Git Hooks

We use Husky to enforce quality standards. The following hooks are configured:

### Pre-commit Hook
Runs automatically before each commit and:
- Lints modified files using ESLint
- Formats code using Prettier
- Validates branch naming convention

To skip in emergencies:
```bash
git commit --no-verify -m "your message"
```

### Pre-push Hook
Runs automatically before pushing and:
- Runs tests for affected workspaces
- Performs type checking
- Ensures build success

To skip in emergencies:
```bash
git push --no-verify
```

### Commit Message Hook
Validates that your commit messages follow the conventional commits specification.

## Testing

### Running Tests
```bash
# Run all tests
npm run test

# Run tests for specific workspace
npm run test --filter=@your-org/workspace-name
```

### Writing Tests
- Place tests in `__tests__` directories or with `.test.ts` extension
- Each feature should have corresponding tests
- Aim for high test coverage, especially in shared packages

## Type Checking

We use TypeScript for type safety. Run type checking:
```bash
# Check all workspaces
npm run typecheck

# Check specific workspace
npm run typecheck --filter=@your-org/workspace-name
```

## Linting and Formatting

### ESLint
```bash
# Lint all files
npm run lint

# Lint specific workspace
npm run lint --filter=@your-org/workspace-name

# Fix automatic issues
npm run lint -- --fix
```

### Prettier
```bash
# Format all files
npm run format

# Check formatting without fixing
npm run format:check
```

## Working with Workspaces

### Structure
```
.
├── apps/
│   ├── web/
│   └── api/
├── packages/
│   ├── ui/
│   └── utils/
└── package.json
```

### Adding Dependencies
```bash
# Add to specific workspace
npm install package-name --filter=@your-org/workspace-name

# Add to all workspaces
npm install package-name -w
```

## CI/CD Pipeline

Our CI pipeline runs:
1. Linting and type checking
2. Unit tests
3. Integration tests
4. Build verification

Ensure all these checks pass locally before pushing.

## Release Process

1. Create a release branch: `release/v1.2.3`
2. Update version numbers and CHANGELOG.md
3. Create a pull request
4. After approval and merge, tag the release

## Getting Help

- Check existing issues before creating new ones
- Use appropriate labels when creating issues
- For questions, use the Discussions tab
- For security issues, see SECURITY.md

## Code of Conduct

Please read our [Code of Conduct](./CODE_OF_CONDUCT.md) before contributing.

Thank you for contributing to our project! 🎉