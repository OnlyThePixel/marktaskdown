# NPM Publishing Guide

This document provides instructions for generating and using NPM tokens for publishing the MarkTaskDown package.

## Generating an NPM Token

To publish packages to npm, you need to create an access token:

1. Create an npm account if you don't have one already at [npmjs.com](https://www.npmjs.com/signup)
2. Log in to your npm account
3. Navigate to your profile settings by clicking on your avatar and selecting "Access Tokens"
4. Click "Generate New Token"
5. Select the token type:
   - For CI/CD: Choose "Automation" (provides full access to publish packages)
   - For individual use: Choose "Publish" (limited to publishing packages)
6. Set a token name that identifies its purpose (e.g., "MarkTaskDown CI/CD")
7. Click "Generate Token"
8. Copy the token immediately - npm will only show it once!

## Storing NPM Tokens Securely

### Local Development

For local development, you can store your token in your npm configuration:

```bash
npm login  # Interactive login that stores credentials
```

Or set the token directly:

```bash
npm config set //registry.npmjs.org/:_authToken=YOUR_TOKEN
```

**IMPORTANT**: Never commit your npm token to version control!

### CI/CD Environment

For CI/CD environments, store the token as a secret environment variable:

#### GitHub Actions

1. Go to your GitHub repository
2. Navigate to "Settings" > "Secrets and variables" > "Actions"
3. Click "New repository secret"
4. Name: `NPM_TOKEN`
5. Value: Your npm token
6. Click "Add secret"

For more information on using secrets in GitHub Actions, refer to the [official GitHub documentation on encrypted secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets).

When setting up your workflow file, you'll need to use the `NPM_TOKEN` secret as an environment variable named `NODE_AUTH_TOKEN` for the npm publishing step.

For detailed information on publishing to npm registries from GitHub Actions, see the [GitHub documentation on publishing Node.js packages](https://docs.github.com/en/actions/publishing-packages/publishing-nodejs-packages).

## Best Practices for Token Security

1. **Use Scoped Access Tokens**: Create tokens with the minimum required permissions
2. **Rotate Tokens Regularly**: Generate new tokens periodically (every 3-6 months)
3. **Use Secrets Management**: Never hardcode tokens in scripts or configuration files
4. **Audit Token Usage**: Regularly review which tokens exist and revoke unused ones
5. **Set Expiration Dates**: For manually created tokens, set an expiration date
6. **Use npmrc Files Carefully**: If using `.npmrc` files, add them to `.gitignore`
7. **CI/CD Security**:
   - Use masked/secret variables in CI/CD systems
   - Limit exposure of tokens to only the necessary jobs
   - Consider using dedicated CI/CD user accounts

## Using semantic-release for Publishing

MarkTaskDown uses semantic-release to automate the package publishing process. The configuration in `.releaserc.json` includes the `@semantic-release/npm` plugin, which handles:

1. Verifying npm authentication
2. Updating the `package.json` version based on commits
3. Publishing the package to the npm registry

To trigger a release:

```bash
npm run release
```

In CI/CD environments, this command is typically run after successful builds on the main branch.

## Dry Run Testing

To test the npm publishing process without actually publishing:

```bash
# Install semantic-release CLI globally if not already installed
npm install -g semantic-release-cli

# Run in dry-run mode
npx semantic-release --dry-run

# Or use the npm script with dry-run flag
npm run release -- --dry-run
```

This will simulate the release process without making any changes to the npm registry or Git repository.
