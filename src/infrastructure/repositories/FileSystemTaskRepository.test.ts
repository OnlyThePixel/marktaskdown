import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import path from "path";
import { Task } from "../../domain/entities/Task.js";
import { Title } from "../../domain/valueObjects/Title.js";
import { Description } from "../../domain/valueObjects/Description.js";
import { Slug } from "../../domain/valueObjects/Slug.js";
import { FileSystemTaskRepository } from "./FileSystemTaskRepository.js";
import { MarkdownFileAdapter } from "../adapters/MarkdownFileAdapter.js";

// Mock path module and MarkdownFileAdapter
vi.mock("path");
vi.mock("../adapters/MarkdownFileAdapter.js");

describe("FileSystemTaskRepository", () => {
  let repository: FileSystemTaskRepository;
  let mockAdapter: MarkdownFileAdapter;
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

    // Create a mock MarkdownFileAdapter
    mockAdapter = {
      readFile: vi.fn(),
      writeFile: vi.fn(),
      deleteFile: vi.fn(),
      listFiles: vi.fn(),
    } as unknown as MarkdownFileAdapter;

    // Create a new repository instance with the mock adapter
    repository = new FileSystemTaskRepository(testTasksDir, mockAdapter);

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
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("save", () => {
    it("should save a task using the adapter", async () => {
      // Mock the writeFile method
      vi.mocked(mockAdapter.writeFile).mockResolvedValueOnce();

      // Act
      await repository.save(task1);

      // Assert
      const expectedFilePath = `${testTasksDir}/${slug1.value}.md`;
      const expectedContent = task1.description.value;
      const expectedFrontMatter = {
        title: task1.title.value,
        is_done: task1.isDone,
      };

      expect(mockAdapter.writeFile).toHaveBeenCalledWith(
        expectedFilePath,
        expectedContent,
        expectedFrontMatter
      );
    });

    it("should save a task to its original filename when it differs from the slug", async () => {
      // Mock the readFile method to return a task with a custom filename
      const customFilename = "custom-filename.md";
      const customFilePath = `${testTasksDir}/${customFilename}`;

      vi.mocked(mockAdapter.readFile).mockResolvedValueOnce({
        frontMatter: {
          title: "Test Task 1",
          is_done: false,
        },
        content: "Description for task 1",
      });

      // Mock path.basename to return the custom filename
      vi.mocked(path.basename).mockReturnValueOnce(customFilename);

      // First load the task from the custom filename
      const loadedTask = await repository.findBySlug(new Slug("custom-filename"));

      // Mock the writeFile method
      vi.mocked(mockAdapter.writeFile).mockResolvedValueOnce();

      // Act - save the loaded task
      await repository.save(loadedTask!);

      // Assert - should save to the original filename, not the slug-based one
      expect(mockAdapter.writeFile).toHaveBeenCalledWith(
        customFilePath,
        loadedTask!.description.value,
        expect.objectContaining({
          title: loadedTask!.title.value,
          is_done: loadedTask!.isDone,
        })
      );
    });
  });

  describe("findBySlug", () => {
    it("should return null if the task file doesn't exist", async () => {
      // Mock readFile to return null (file doesn't exist)
      vi.mocked(mockAdapter.readFile).mockResolvedValueOnce(null);

      // Act
      const result = await repository.findBySlug(slug1);

      // Assert
      expect(result).toBeNull();
    });

    it("should return a task if the file exists", async () => {
      // Mock readFile to return file content
      vi.mocked(mockAdapter.readFile).mockResolvedValueOnce({
        frontMatter: {
          title: "Test Task 1",
          is_done: false,
        },
        content: "Description for task 1",
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
      // Mock readFile to throw an error
      vi.mocked(mockAdapter.readFile).mockRejectedValueOnce(
        new Error("Test error")
      );

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
    it("should return an empty array if no files are found", async () => {
      // Mock listFiles to return an empty array
      vi.mocked(mockAdapter.listFiles).mockResolvedValueOnce([]);

      // Act
      const result = await repository.findAll();

      // Assert
      expect(result).toEqual([]);
    });

    it("should return all tasks from the directory", async () => {
      // Mock listFiles to return file paths
      const file1Path = `${testTasksDir}/${slug1.value}.md`;
      const file2Path = `${testTasksDir}/${slug2.value}.md`;
      vi.mocked(mockAdapter.listFiles).mockResolvedValueOnce([
        file1Path,
        file2Path,
      ]);

      // Mock path.basename to return filenames
      vi.mocked(path.basename).mockImplementation((filePath) => {
        if (filePath === file1Path) return `${slug1.value}.md`;
        if (filePath === file2Path) return `${slug2.value}.md`;
        return "";
      });

      // Mock readFile to return file contents
      vi.mocked(mockAdapter.readFile).mockImplementation(async (filePath) => {
        if (filePath === `${testTasksDir}/${slug1.value}.md`) {
          return {
            frontMatter: {
              title: "Test Task 1",
              is_done: false,
            },
            content: "Description for task 1",
          };
        }
        if (filePath === `${testTasksDir}/${slug2.value}.md`) {
          return {
            frontMatter: {
              title: "Test Task 2",
              is_done: true,
            },
            content: "Description for task 2",
          };
        }
        return null;
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
      // Mock listFiles to return file paths
      const file1Path = `${testTasksDir}/${slug1.value}.md`;
      const invalidFilePath = `${testTasksDir}/invalid-file.md`;
      vi.mocked(mockAdapter.listFiles).mockResolvedValueOnce([
        file1Path,
        invalidFilePath,
      ]);

      // Mock path.basename to return filenames
      vi.mocked(path.basename).mockImplementation((filePath) => {
        if (filePath === file1Path) return `${slug1.value}.md`;
        if (filePath === invalidFilePath) return "invalid-file.md";
        return "";
      });

      // Mock readFile to return content for valid file and throw for invalid
      vi.mocked(mockAdapter.readFile).mockImplementation(async (filePath) => {
        if (filePath === `${testTasksDir}/${slug1.value}.md`) {
          return {
            frontMatter: {
              title: "Test Task 1",
              is_done: false,
            },
            content: "Description for task 1",
          };
        }
        if (filePath === `${testTasksDir}/invalid-file.md`) {
          throw new Error("Invalid content");
        }
        return null;
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
    it("should delete a task file using the adapter", async () => {
      // Mock deleteFile method
      vi.mocked(mockAdapter.deleteFile).mockResolvedValueOnce();

      // Act
      await repository.delete(slug1);

      // Assert
      const expectedFilePath = `${testTasksDir}/${slug1.value}.md`;
      expect(mockAdapter.deleteFile).toHaveBeenCalledWith(expectedFilePath);
    });
  });
});
