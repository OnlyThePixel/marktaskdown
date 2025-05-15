# GitHub Release Process

This document describes how GitHub releases are configured and managed for the MarkTaskDown project.

## Overview

The MarkTaskDown project uses [semantic-release](https://github.com/semantic-release/semantic-release) to automate the GitHub release process. Releases are created automatically based on commit messages following the [gitmoji](https://gitmoji.dev/) convention.

## Release Configuration

The release process is configured in the `.releaserc.json` file and includes:

1. **Version Determination**: Analyzes commit messages to determine the next version number based on gitmoji semantics:

   - 💥 (`:boom:`) - Major version bump (breaking changes)
   - ✨ (`:sparkles:`) - Minor version bump (new features)
   - Various other gitmojis - Patch version bump (bug fixes, improvements)

2. **Changelog Generation**: Automatically generates a changelog based on commit messages, categorized by type of change.

3. **GitHub Release Creation**: Creates a GitHub release with:

   - Version tag with 'v' prefix (e.g., `v0.1.0`)
   - Release notes generated from the changelog
   - Distribution assets attached to the release

4. **NPM Publishing**: Publishes the package to npm registry.

5. **Git Updates**: Updates the package.json version and commits the changelog.

## Release Tags

All releases are tagged with a 'v' prefix followed by the semantic version number:

```
v0.1.0
v1.0.0
v1.2.3
```

## Testing the Release Configuration

You can test the release configuration without actually creating a release by running:

```bash
npm run release:dry-run
```

This will show what would happen during a release, including:

- The next version number
- The type of release (major, minor, patch)
- The git tag that would be created
- The plugins that would run

## Manual Release Trigger

While releases are typically triggered automatically by CI/CD pipelines, you can manually trigger a release by running:

```bash
npm run release
```

Note: This should generally be avoided in favor of the automated process to ensure consistency.

## Release Assets

Each GitHub release includes:

- The compiled distribution files
- The changelog for the release
- Links to the npm package

## Troubleshooting

If a release fails:

1. Check the CI/CD logs for error messages
2. Verify that commit messages follow the gitmoji convention
3. Ensure all required environment variables are set (e.g., `GITHUB_TOKEN`, `NPM_TOKEN`)
4. Run the dry-run command to test the configuration
