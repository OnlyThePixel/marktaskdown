import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import fs from "fs";
import path from "path";
import { Task } from "../../domain/entities/Task.js";
import { Title } from "../../domain/valueObjects/Title.js";
import { Description } from "../../domain/valueObjects/Description.js";
import { Slug } from "../../domain/valueObjects/Slug.js";
import { FileSystemTaskRepository } from "./FileSystemTaskRepository.js";
import matter from "gray-matter";

// Mock fs and path modules
vi.mock("fs");
vi.mock("path");
vi.mock("gray-matter");

describe("FileSystemTaskRepository", () => {
  let repository: FileSystemTaskRepository;
  let task1: Task;
  let task2: Task;
  let slug1: Slug;
  let slug2: Slug;
  const testTasksDir = "/test/tasks";

  beforeEach(() => {
    // Reset mocks
    vi.resetAllMocks();

    // Mock path.join to return predictable paths
    vi.mocked(path.join).mockImplementation((...paths) => paths.join("/"));

    // Create a new repository instance for each test
    repository = new FileSystemTaskRepository(testTasksDir);

    // Create test tasks
    task1 = new Task(
      new Title("Test Task 1"),
      new Description("Description for task 1"),
      false,
      "1"
    );

    task2 = new Task(
      new Title("Test Task 2"),
      new Description("Description for task 2"),
      true,
      "2"
    );

    slug1 = task1.slug;
    slug2 = task2.slug;

    // Mock fs.existsSync to return true for the tasks directory
    vi.mocked(fs.existsSync).mockImplementation((path) => {
      if (path === testTasksDir) {
        return true;
      }
      return false;
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("save", () => {
    it("should create the tasks directory if it doesn't exist", async () => {
      // Mock fs.existsSync to return false for the tasks directory
      vi.mocked(fs.existsSync).mockReturnValueOnce(false);

      // Act
      await repository.save(task1);

      // Assert
      expect(fs.mkdirSync).toHaveBeenCalledWith(testTasksDir, {
        recursive: true,
      });
    });

    it("should save a task to a file", async () => {
      vi.mocked(matter.stringify).mockReturnValueOnce("");

      // Act
      await repository.save(task1);

      // Assert
      const expectedFilePath = `${testTasksDir}/${slug1.value}.md`;
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expectedFilePath,
        expect.any(String)
      );
    });
  });

  describe("findBySlug", () => {
    it("should return null if the task file doesn't exist", async () => {
      // Mock fs.existsSync to return false for the task file
      vi.mocked(fs.existsSync).mockReturnValueOnce(false);

      // Act
      const result = await repository.findBySlug(slug1);

      // Assert
      expect(result).toBeNull();
    });

    it("should return a task if the file exists", async () => {
      // Mock fs.existsSync to return true for the task file
      vi.mocked(fs.existsSync).mockReturnValueOnce(true);

      // Mock fs.readFileSync to return a task file content
      vi.mocked(fs.readFileSync).mockReturnValueOnce(
        Buffer.from("file content")
      );

      // Mock gray-matter to return task data
      vi.mocked(matter).mockReturnValueOnce({
        data: {
          title: "Test Task 1",
          is_done: false,
        },
        content: "Description for task 1",
        orig: "original content",
        language: "yaml",
        matter: "---\ntitle: Test Task 1\nis_done: false\n---",
        stringify: () => "stringified content",
      });

      // Act
      const result = await repository.findBySlug(slug1);

      // Assert
      expect(result).not.toBeNull();
      expect(result?.title.value).toBe("Test Task 1");
      expect(result?.description.value).toBe("Description for task 1");
      expect(result?.isDone).toBe(false);
      expect(result?.slug.value).toBe(slug1.value);
    });

    it("should return null if there's an error reading the file", async () => {
      // Mock fs.existsSync to return true for the task file
      vi.mocked(fs.existsSync).mockReturnValueOnce(true);

      // Mock fs.readFileSync to throw an error
      vi.mocked(fs.readFileSync).mockImplementationOnce(() => {
        throw new Error("Test error");
      });

      // Mock console.error to avoid polluting test output
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      // Act
      const result = await repository.findBySlug(slug1);

      // Assert
      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe("findAll", () => {
    it("should return an empty array if the tasks directory doesn't exist", async () => {
      // Mock fs.existsSync to return false for the tasks directory
      vi.mocked(fs.existsSync).mockReturnValueOnce(false);

      // Act
      const result = await repository.findAll();

      // Assert
      expect(result).toEqual([]);
    });

    it("should return all tasks from the directory", async () => {
      // Mock fs.readdirSync to return a list of task files
      const mockDirEntries = [
        {
          name: `${slug1.value}.md`,
          isFile: () => true,
          parentPath: testTasksDir,
        },
        {
          name: `${slug2.value}.md`,
          isFile: () => true,
          parentPath: testTasksDir,
        },
        {
          name: "not-a-markdown-file.txt",
          isFile: () => true,
          parentPath: testTasksDir,
        },
        { name: "subdirectory", isFile: () => false, parentPath: testTasksDir },
      ];
      vi.mocked(fs.readdirSync).mockReturnValueOnce(
        mockDirEntries as unknown as fs.Dirent[]
      );

      // Mock fs.readFileSync to return task file contents
      vi.mocked(fs.readFileSync).mockImplementation((filePath) => {
        if (filePath === `${testTasksDir}/${slug1.value}.md`) {
          return Buffer.from("Task 1 content");
        }
        if (filePath === `${testTasksDir}/${slug2.value}.md`) {
          return Buffer.from("Task 2 content");
        }
        return Buffer.from("");
      });

      // Mock gray-matter to return task data
      vi.mocked(matter).mockImplementation((content) => {
        if (content.toString().includes("Task 1")) {
          return {
            data: {
              title: "Test Task 1",
              is_done: false,
            },
            content: "Description for task 1",
            orig: "original content",
            language: "yaml",
            matter: "---\ntitle: Test Task 1\nis_done: false\n---",
            stringify: () => "stringified content",
          };
        } else if (content.toString().includes("Task 2")) {
          return {
            data: {
              title: "Test Task 2",
              is_done: true,
            },
            content: "Description for task 2",
            orig: "original content",
            language: "yaml",
            matter: "---\ntitle: Test Task 2\nis_done: true\n---",
            stringify: () => "stringified content",
          };
        }

        return {
          data: {},
          content: "",
          orig: "original content",
          language: "yaml",
          matter: "---\n---",
          stringify: () => "stringified content",
        };
      });

      // Act
      const result = await repository.findAll();

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0].title.value).toBe("Test Task 1");
      expect(result[0].isDone).toBe(false);
      expect(result[1].title.value).toBe("Test Task 2");
      expect(result[1].isDone).toBe(true);
    });

    it("should skip files that cannot be parsed", async () => {
      // Mock fs.readdirSync to return a list of task files
      const mockDirEntries = [
        {
          name: `${slug1.value}.md`,
          isFile: () => true,
          parentPath: testTasksDir,
        },
        {
          name: "invalid-file.md",
          isFile: () => true,
          parentPath: testTasksDir,
        },
      ];
      vi.mocked(fs.readdirSync).mockReturnValueOnce(
        mockDirEntries as unknown as fs.Dirent[]
      );

      // Mock fs.readFileSync to return task file contents
      vi.mocked(fs.readFileSync).mockImplementation((filePath) => {
        if (filePath === `${testTasksDir}/${slug1.value}.md`) {
          return Buffer.from("Task 1 content");
        }
        if (filePath === `${testTasksDir}/invalid-file.md`) {
          return Buffer.from("Invalid content");
        }
        return Buffer.from("");
      });

      // Mock gray-matter to return task data for valid files and throw for invalid
      vi.mocked(matter).mockImplementation((content) => {
        if (content.toString().includes("Task 1")) {
          return {
            data: {
              title: "Test Task 1",
              is_done: false,
            },
            content: "Description for task 1",
            orig: "original content",
            language: "yaml",
            matter: "---\ntitle: Test Task 1\nis_done: false\n---",
            stringify: () => "stringified content",
          };
        }

        throw new Error("Invalid content");
      });

      // Mock console.warn to avoid polluting test output
      const consoleWarnSpy = vi
        .spyOn(console, "warn")
        .mockImplementation(() => {});

      // Act
      const result = await repository.findAll();

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].title.value).toBe("Test Task 1");
      expect(consoleWarnSpy).toHaveBeenCalled();
    });
  });

  describe("delete", () => {
    it("should delete a task file if it exists", async () => {
      // Mock fs.existsSync to return true for the task file
      vi.mocked(fs.existsSync).mockReturnValueOnce(true);

      // Act
      await repository.delete(slug1);

      // Assert
      const expectedFilePath = `${testTasksDir}/${slug1.value}.md`;
      expect(fs.unlinkSync).toHaveBeenCalledWith(expectedFilePath);
    });

    it("should not throw an error if the task file doesn't exist", async () => {
      // Mock fs.existsSync to return false for the task file
      vi.mocked(fs.existsSync).mockReturnValueOnce(false);

      // Act & Assert
      await expect(repository.delete(slug1)).resolves.not.toThrow();
      expect(fs.unlinkSync).not.toHaveBeenCalled();
    });
  });
});
