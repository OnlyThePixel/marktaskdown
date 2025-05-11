# Semantic Versioning with Gitmojis

This directory contains custom plugins for semantic-release that enable automatic versioning based on gitmojis in commit messages.

## How it Works

The system uses the `gitmojis.json` file in the project root to determine which semantic version bump (major, minor, patch) should be applied based on the gitmojis used in commit messages.

### Commit Analyzer

The custom commit analyzer (`commit-analyzer.js`) reads the `gitmojis.json` file and maps each gitmoji to its corresponding semantic version bump:

- **Major version bump** (1.0.0 → 2.0.0): Breaking changes

  - 💥 `:boom:` - Introduce breaking changes

- **Minor version bump** (1.0.0 → 1.1.0): New features

  - ✨ `:sparkles:` - Introduce new features

- **Patch version bump** (1.0.0 → 1.0.1): Bug fixes and improvements
  - 🐛 `:bug:` - Fix a bug
  - 🚑️ `:ambulance:` - Critical hotfix
  - ⚡️ `:zap:` - Improve performance
  - 💄 `:lipstick:` - Add or update the UI and style files
  - 🔒️ `:lock:` - Fix security or privacy issues
  - ⬇️ `:arrow_down:` - Downgrade dependencies
  - ⬆️ `:arrow_up:` - Upgrade dependencies
  - 📌 `:pushpin:` - Pin dependencies to specific versions
  - 📈 `:chart_with_upwards_trend:` - Add or update analytics or track code
  - ➕ `:heavy_plus_sign:` - Add a dependency
  - ➖ `:heavy_minus_sign:` - Remove a dependency
  - 🔧 `:wrench:` - Add or update configuration files
  - 🌐 `:globe_with_meridians:` - Internationalization and localization
  - ✏️ `:pencil2:` - Fix typos
  - ⏪️ `:rewind:` - Revert changes
  - 📦️ `:package:` - Add or update compiled files or packages
  - 👽️ `:alien:` - Update code due to external API changes
  - 🍱 `:bento:` - Add or update assets
  - ♿️ `:wheelchair:` - Improve accessibility
  - 💬 `:speech_balloon:` - Add or update text and literals
  - 🗃️ `:card_file_box:` - Perform database related changes
  - 🚸 `:children_crossing:` - Improve user experience / usability
  - 📱 `:iphone:` - Work on responsive design
  - 🥚 `:egg:` - Add or update an easter egg
  - ⚗️ `:alembic:` - Perform experiments
  - 🔍️ `:mag:` - Improve SEO
  - 🏷️ `:label:` - Add or update types
  - 🚩 `:triangular_flag_on_post:` - Add, update, or remove feature flags
  - 🥅 `:goal_net:` - Catch errors
  - 💫 `:dizzy:` - Add or update animations and transitions
  - 🗑️ `:wastebasket:` - Deprecate code that needs to be cleaned up
  - 🛂 `:passport_control:` - Work on code related to authorization, roles and permissions

## Usage

When making commits, use the appropriate gitmoji at the beginning of your commit message to trigger the correct version bump:

```
✨ Add new feature for task management
```

The semantic-release system will automatically determine the next version number based on the gitmojis in the commit messages since the last release.

To manually trigger a release, run:

```
npm run release
```

This will:

1. Analyze commits since the last release
2. Determine the next version number
3. Generate release notes
4. Update the CHANGELOG.md file
5. Update the version in package.json
6. Create a git tag
7. Push the changes to the repository
