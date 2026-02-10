# Contributing to Safe Events Service

Thank you for your interest in contributing to the Safe Events Service! This document provides guidelines and instructions for contributing to this project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)
- [Coding Standards](#coding-standards)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Enhancements](#suggesting-enhancements)

## Code of Conduct

This project adheres to a code of conduct that all contributors are expected to follow. By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

## Getting Started

Before you begin contributing, please ensure you have:

1. Read the [README.md](README.md) to understand the project's purpose and architecture
2. Reviewed existing issues and pull requests to avoid duplicate work
3. Set up your development environment as described below

## Development Setup

### Prerequisites

- **Node.js**: Version 22 LTS is required
- **Docker**: Required for running RabbitMQ and PostgreSQL
- **Git**: For version control

### Installation Steps

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/safe-events-service.git
   cd safe-events-service
   ```

3. Add the upstream repository:
   ```bash
   git remote add upstream https://github.com/poise116/safe-events-service.git
   ```

4. Install dependencies:
   ```bash
   npm install
   ```

5. Set up environment variables:
   ```bash
   cp .env.sample .env
   ```

6. Start the required services:
   ```bash
   docker compose up -d
   ```

7. Run the application in development mode:
   ```bash
   npm run start:dev
   ```

## Making Changes

### Branching Strategy

1. Create a new branch from `main` for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Use descriptive branch names:
   - `feature/` for new features
   - `fix/` for bug fixes
   - `docs/` for documentation changes
   - `refactor/` for code refactoring
   - `test/` for test additions or modifications

### Commit Messages

Write clear and meaningful commit messages following these guidelines:

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Reference issues and pull requests when relevant

Example:
```
Add webhook retry mechanism

- Implement exponential backoff strategy
- Add retry configuration options
- Update documentation

Fixes #123
```

## Testing

All contributions must include appropriate tests. The project uses Jest for testing.

### Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run e2e tests
npm run test:e2e

# Generate coverage report
npm run test:cov
```

### Test Requirements

- **Unit tests**: Required for all new functions and methods
- **Integration tests**: Required for new modules and services
- **E2E tests**: Required for new API endpoints
- **Coverage**: Aim to maintain or improve existing coverage levels

### Writing Tests

- Place unit tests alongside the code they test (e.g., `service.spec.ts`)
- Place e2e tests in the `test/` directory
- Use descriptive test names that explain what is being tested
- Follow the Arrange-Act-Assert pattern
- Mock external dependencies appropriately

## Submitting Changes

### Before Submitting

1. Ensure all tests pass:
   ```bash
   npm run test
   npm run test:e2e
   ```

2. Run the linter and fix any issues:
   ```bash
   npm run lint
   ```

3. Format your code:
   ```bash
   npm run format
   ```

4. Update documentation if needed

### Pull Request Process

1. Push your changes to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

2. Open a pull request against the `main` branch of the upstream repository

3. Fill out the pull request template completely

4. Ensure the following:
   - All CI checks pass
   - Code has been reviewed by at least one maintainer
   - Documentation is updated if necessary
   - Tests are included and passing

5. Be responsive to feedback and make requested changes promptly

### Pull Request Guidelines

- Keep pull requests focused on a single concern
- Link related issues in the PR description
- Include screenshots or GIFs for UI changes
- Update the CHANGELOG if applicable
- Ensure backward compatibility unless explicitly breaking

## Coding Standards

### TypeScript Guidelines

- Use TypeScript strict mode
- Provide explicit types for function parameters and return values
- Avoid using `any` type; use `unknown` or proper types instead
- Use interfaces for object shapes
- Follow the existing code style in the project

### NestJS Best Practices

- Use dependency injection properly
- Follow the module-based architecture
- Use DTOs for data validation
- Implement proper error handling with custom exceptions
- Use decorators appropriately

### Code Style

This project uses ESLint and Prettier for code formatting:

- Follow the existing ESLint configuration
- Run `npm run format` before committing
- Use meaningful variable and function names
- Keep functions small and focused
- Add comments for complex logic
- Document public APIs with JSDoc comments

### Database Migrations

When making database changes:

1. Create a new migration:
   ```bash
   bash ./scripts/db_generate_migrations.sh MIGRATION_NAME
   ```

2. Review the generated migration file
3. Test the migration both up and down
4. Include the migration in your pull request

## Reporting Bugs

When reporting bugs, please include:

1. **Description**: Clear and concise description of the bug
2. **Steps to Reproduce**: Detailed steps to reproduce the issue
3. **Expected Behavior**: What you expected to happen
4. **Actual Behavior**: What actually happened
5. **Environment**: 
   - Node.js version
   - Operating system
   - Docker version
   - Any relevant configuration
6. **Logs**: Relevant error messages or logs
7. **Screenshots**: If applicable

Use the bug report issue template when available.

## Suggesting Enhancements

We welcome suggestions for enhancements! When suggesting features:

1. **Use Case**: Describe the use case and problem you're trying to solve
2. **Proposed Solution**: Explain your proposed solution
3. **Alternatives**: Describe any alternative solutions you've considered
4. **Additional Context**: Add any other context, screenshots, or examples

Use the feature request issue template when available.

## Questions?

If you have questions about contributing, feel free to:

- Open an issue with the "question" label
- Reach out to the maintainers
- Check existing documentation and issues first

## License

By contributing to Safe Events Service, you agree that your contributions will be licensed under the same license as the project (MIT License).

---

Thank you for contributing to Safe Events Service! Your efforts help make this project better for everyone.
