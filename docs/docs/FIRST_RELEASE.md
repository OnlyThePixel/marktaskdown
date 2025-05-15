# First Release Process (v0.1.0)

This document outlines the steps required to create the first release (v0.1.0) of the MarkTaskDown CLI tool.

## Prerequisites

Before proceeding with the first release, ensure you have:

1. **GitHub Repository Access**: You need write access to the repository.
2. **NPM Account**: You need an account on npmjs.com with publish permissions for the package.
3. **Required Tokens**:
   - `GITHUB_TOKEN`: For creating GitHub releases
   - `NPM_TOKEN`: For publishing to npm registry

## Setting Up Tokens

### GitHub Token

The `GITHUB_TOKEN` is automatically provided by GitHub Actions. No additional setup is required.

### NPM Token

To set up the NPM token:

1. Generate an NPM token as described in [NPM_PUBLISHING.md](./NPM_PUBLISHING.md)
2. Add the token to GitHub repository secrets:
   - Go to your GitHub repository
   - Navigate to "Settings" > "Secrets and variables" > "Actions"
   - Click "New repository secret"
   - Name: `NPM_TOKEN`
   - Value: Your npm token
   - Click "Add secret"

## First Release Steps

For the first release, follow these steps:

1. **Verify Configuration**:

   - Ensure package.json has version set to "0.0.0"
   - Verify all required fields in package.json are correctly set
   - Check that .releaserc.json is properly configured
   - Ensure the build process runs before tests in the GitHub Actions workflow
   - Verify that the pretest script is set up to run the build command

2. **Test Release Configuration**:

   ```bash
   npm run release:dry-run
   ```

   This will show what would happen during a release without making any changes.

3. **Create Feature Commits**:
   Ensure you have at least one commit with a gitmoji that triggers a minor version bump (e.g., ✨ for new features).

4. **Trigger the Release**:
   Push your changes to the main branch to trigger the GitHub Actions workflow:

   ```bash
   git push origin main
   ```

5. **Verify Release**:
   - Check the GitHub Actions workflow to ensure it completed successfully
   - Verify the GitHub release was created with the correct version (v0.1.0)
   - Confirm the package was published to npm

## Troubleshooting

If the release fails:

1. **Check GitHub Actions Logs**:
   Review the logs for any error messages.

2. **Verify Commit Messages**:
   Ensure your commit messages follow the gitmoji convention and include at least one commit that triggers a version bump.

3. **Check Environment Variables**:
   Verify that the NPM_TOKEN secret is correctly set in GitHub repository secrets.

4. **Manual Testing**:
   Run the dry-run command locally to test the configuration:
   ```bash
   npm run release:dry-run
   ```

## Post-Release Steps

After the first release is complete:

1. **Update Documentation**:
   Update any documentation that references the version number.

2. **Plan Next Release**:
   Begin planning for the next release cycle.
