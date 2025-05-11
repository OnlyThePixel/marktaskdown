When working on the MarkTaskDown project:

# Project Architecture

1. CRITICAL: Follow the Domain-Driven Design architecture outlined in architecture-plan.md
2. Respect the separation between layers (domain, application, infrastructure, UI)
3. Implement interfaces before concrete implementations to ensure proper abstraction
4. Ensure domain entities encapsulate both data and behavior
5. Use value objects for immutable concepts with no identity
6. IMPORTANT: For data flow between layers:
   - Query use cases should return domain entities directly (not DTOs) when possible
   - Command use cases typically return the affected domain entity or void
   - DTOs are primarily used for input to use cases, not for return values
   - UI layer is responsible for transforming domain entities to presentation format

# Project Documentation

1. Always refer to docs/README.md for the most up-to-date project requirements
2. Check architecture-plan.md for the detailed system design and component relationships
3. Review existing code in src/ directory to understand patterns and conventions
4. Consult task files in tasks/ directory for specific implementation requirements
5. IMPORTANT: Update ALL relevant documentation when implementing new features

# Development Guidelines

1. CRITICAL: Follow the Red-Green-Refactor TDD workflow:
   - RED: Write failing tests first that define the expected behavior
   - GREEN: Implement the minimal code needed to make tests pass
   - REFACTOR: Clean up the code while keeping tests passing
2. TypeScript best practices:
   - Leverage interfaces for defining contracts between components
   - Use private fields with getters/setters to encapsulate state
   - Add JSDoc comments to explain complex logic or design decisions
3. Include file extensions in import paths (e.g., './commands/init.js' not './commands/init') since the project uses ECMAScript modules
4. IMPORTANT: Before modifying existing code, thoroughly analyze it to understand project-specific implementations and custom extensions
5. Don't assume standard library behavior - check how the project uses libraries and custom extensions
6. When enhancing CLI commands:
   - Maintain backward compatibility with existing functionality
   - Follow consistent patterns for argument and option handling
   - Provide clear error messages and user feedback
   - Update command help text to reflect new functionality

# Git Workflow

1. Make atomic commits (one logical change per commit)
2. CRITICAL: Use the appropriate gitmoji in commit messages according to .gitmessage file
3. Pay special attention to selecting the correct gitmoji based on the nature of the change:
   - ✨ (sparkles): ONLY for end-user visible features
   - 👔 (necktie): For business logic implementation (use cases, domain logic)
   - ♻️ (recycle): For code refactoring
   - 🐛 (bug): For bug fixes
   - ✅ (white_check_mark): For adding or updating tests
   - 🏗️ (building_construction): For architectural changes
   - 📝 (memo): For documentation updates
   - Consult .gitmessage file for the complete list of gitmojis and their intended uses
