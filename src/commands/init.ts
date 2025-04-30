import { InitializeProjectUseCase } from "../application/useCases/commands/InitializeProjectUseCase.js";

/**
 * Initialize the tasks directory
 *
 * Creates a tasks directory in the current working directory
 */
export async function initCommand(): Promise<void> {
  // Use the InitializeProjectUseCase to create the tasks directory
  const initializeProjectUseCase = new InitializeProjectUseCase();
  const result = await initializeProjectUseCase.execute();

  // Log the result
  if (result.created) {
    console.log("✅ Created tasks directory");
  } else {
    console.log("✅ Tasks directory already exists");
  }

  console.log(
    '🚀 Initialization complete! You can now add tasks with "mtd add"'
  );
}
