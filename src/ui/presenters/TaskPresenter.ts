import { Task } from "../../domain/entities/Task.js";

/**
 * View model for a task
 * Used for displaying task data in the UI
 */
export interface TaskViewModel {
  slug: string;
  title: string;
  status: string;
  description: string;
}

/**
 * List item for a task
 * Used for displaying tasks in checkbox/select prompts
 */
export interface TaskListItem {
  name: string;
  value: string;
  message: string;
}

/**
 * TaskPresenter
 *
 * Responsible for formatting Task domain entities into various presentation formats
 * needed by the CLI commands. This centralizes presentation logic and ensures
 * consistent formatting across the application.
 */
export class TaskPresenter {
  /**
   * Format a Task entity to a view model for display
   *
   * @param task - The Task entity to format
   * @returns A view model representation of the task
   */
  static toViewModel(task: Task): TaskViewModel {
    return {
      slug: task.slug.value,
      title: task.title.value,
      status: task.isDone ? "DONE" : "PENDING",
      description: task.description.value,
    };
  }

  /**
   * Format multiple Task entities to view models
   *
   * @param tasks - The Task entities to format
   * @returns An array of view model representations
   */
  static toViewModels(tasks: Task[]): TaskViewModel[] {
    return tasks.map((task) => TaskPresenter.toViewModel(task));
  }

  /**
   * Format a Task entity to a list item for checkbox/select prompts
   *
   * @param task - The Task entity to format
   * @returns A list item representation of the task
   */
  static toListItem(task: Task): TaskListItem {
    const status = task.isDone ? "(DONE)" : "(PENDING)";
    return {
      name: `${task.title.value} ${status}`,
      value: task.slug.value,
      message: `${task.title.value} ${status}`,
    };
  }

  /**
   * Format multiple Task entities to list items
   *
   * @param tasks - The Task entities to format
   * @returns An array of list item representations
   */
  static toListItems(tasks: Task[]): TaskListItem[] {
    return tasks.map((task) => TaskPresenter.toListItem(task));
  }

  /**
   * Format a Task entity to table data for the Table component
   *
   * @param task - The Task entity to format
   * @returns A record with task data formatted for table display
   */
  static toTableData(task: Task): Record<string, string | number | boolean> {
    return {
      slug: task.slug.value,
      title: task.title.value,
      status: task.isDone ? "DONE" : "PENDING",
    };
  }

  /**
   * Format multiple Task entities to table data
   *
   * @param tasks - The Task entities to format
   * @returns An array of records with task data formatted for table display
   */
  static toTableDataList(
    tasks: Task[]
  ): Record<string, string | number | boolean>[] {
    return tasks.map((task) => TaskPresenter.toTableData(task));
  }
}
