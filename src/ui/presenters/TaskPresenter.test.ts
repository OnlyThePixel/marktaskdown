import { describe, it, expect } from "vitest";
import { Task } from "../../domain/entities/Task.js";
import { Title } from "../../domain/valueObjects/Title.js";
import { Description } from "../../domain/valueObjects/Description.js";
import { TaskPresenter } from "./TaskPresenter.js";

describe("TaskPresenter", () => {
  // Setup test data
  const createTestTask = (isDone = false) => {
    const title = new Title("Test Task");
    const description = new Description("Test Description");
    return new Task(title, description, isDone, "123");
  };

  describe("toViewModel", () => {
    it("should format a task to a view model", () => {
      const task = createTestTask();
      const viewModel = TaskPresenter.toViewModel(task);

      expect(viewModel).toEqual({
        slug: expect.stringContaining("123-test-task"),
        title: "Test Task",
        status: "PENDING",
        description: "Test Description",
      });
    });

    it("should format a done task with correct status", () => {
      const task = createTestTask(true);
      const viewModel = TaskPresenter.toViewModel(task);

      expect(viewModel.status).toBe("DONE");
    });
  });

  describe("toViewModels", () => {
    it("should convert multiple tasks to view models", () => {
      const tasks = [createTestTask(), createTestTask(true)];
      const viewModels = TaskPresenter.toViewModels(tasks);

      expect(viewModels).toHaveLength(2);
      expect(viewModels[0].status).toBe("PENDING");
      expect(viewModels[1].status).toBe("DONE");
    });
  });

  describe("toListItem", () => {
    it("should format a task to a list item", () => {
      const task = createTestTask();
      const listItem = TaskPresenter.toListItem(task);

      expect(listItem).toEqual({
        name: "Test Task (PENDING)",
        value: expect.stringContaining("123-test-task"),
        message: "Test Task (PENDING)",
      });
    });

    it("should format a done task with correct status in list item", () => {
      const task = createTestTask(true);
      const listItem = TaskPresenter.toListItem(task);

      expect(listItem.name).toContain("(DONE)");
      expect(listItem.message).toContain("(DONE)");
    });
  });

  describe("toListItems", () => {
    it("should convert multiple tasks to list items", () => {
      const tasks = [createTestTask(), createTestTask(true)];
      const listItems = TaskPresenter.toListItems(tasks);

      expect(listItems).toHaveLength(2);
      expect(listItems[0].name).toContain("(PENDING)");
      expect(listItems[1].name).toContain("(DONE)");
    });
  });

  describe("toTableData", () => {
    it("should format a task to table data", () => {
      const task = createTestTask();
      const tableData = TaskPresenter.toTableData(task);

      expect(tableData).toEqual({
        slug: expect.stringContaining("123-test-task"),
        title: "Test Task",
        status: "PENDING",
      });
    });
  });

  describe("toTableDataList", () => {
    it("should convert multiple tasks to table data", () => {
      const tasks = [createTestTask(), createTestTask(true)];
      const tableData = TaskPresenter.toTableDataList(tasks);

      expect(tableData).toHaveLength(2);
      expect(tableData[0].status).toBe("PENDING");
      expect(tableData[1].status).toBe("DONE");
    });
  });
});
