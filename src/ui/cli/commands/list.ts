import fs from "fs";
import path from "path";
import { render } from "ink";
import React from "react";
import { Table } from "../../Table.js";
import { GetAllTasksUseCase } from "../../../application/useCases/queries/GetAllTasksUseCase.js";
import { FileSystemTaskRepository } from "../../../infrastructure/repositories/FileSystemTaskRepository.js";
import { TaskPresenter } from "../../presenters/TaskPresenter.js";

/**
 * List all tasks
 *
 * Retrieves all tasks using the GetAllTasksUseCase and displays them in a table
 */
export async function listCommand(): Promise<void> {
  const cwd = process.cwd();
  const tasksDir = path.join(cwd, "tasks");

  if (!fs.existsSync(tasksDir)) {
    console.log("❌ Tasks directory does not exist. Run 'mtd init' first.");
    return;
  }

  // Create repository and use case
  const taskRepository = new FileSystemTaskRepository(tasksDir);
  const getAllTasksUseCase = new GetAllTasksUseCase(taskRepository);

  // Execute use case to get all tasks
  const tasks = await getAllTasksUseCase.execute();

  if (tasks.length === 0) {
    console.log("📝 No tasks found.");
    return;
  }

  // Use TaskPresenter to format tasks for table display
  const tableData = TaskPresenter.toTableDataList(tasks);

  // Render the table
  render(React.createElement(Table, { data: tableData }));
}
