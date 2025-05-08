---
title: Increase Description Content Size Limit
is_done: true
---

# Increase Description Content Size Limit

## Objective

Refactor the code to increase the maximum content size limit for task descriptions from 1000 characters to 5000 characters.

## Current Implementation

Currently, the `Description` value object in `src/domain/valueObjects/Description.ts` enforces a maximum length of 1000 characters through its validation method. This limitation restricts users from creating detailed task descriptions that might be necessary for complex tasks.

## Requirements

1. **Update the Description value object:**

   - Modify the validation logic in `src/domain/valueObjects/Description.ts` to allow up to 5000 characters
   - Update the error message to reflect the new limit

2. **Update tests:**

   - Modify the tests in `src/domain/valueObjects/Description.test.ts` to verify the new limit
   - Ensure all tests pass with the new implementation

3. **Maintain backward compatibility:**
   - Ensure existing functionality continues to work with the new limit
   - No changes should be required to other parts of the application

## Success Criteria

- The Description value object accepts descriptions up to 5000 characters
- The Description value object rejects descriptions longer than 5000 characters
- All tests pass, including updated tests for the new limit
- Existing functionality continues to work with the new limit
