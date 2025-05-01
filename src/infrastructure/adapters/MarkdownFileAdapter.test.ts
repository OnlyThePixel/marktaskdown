import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { MarkdownFileAdapter } from "./MarkdownFileAdapter.js";

// Mock fs, path, and gray-matter modules
vi.mock("fs");
vi.mock("path");
vi.mock("gray-matter");

describe("MarkdownFileAdapter", () => {
  let adapter: MarkdownFileAdapter;
  const testDir = "/test/dir";
  const testFilePath = "/test/dir/test-file.md";
  const testContent = "Test content";
  const testFrontMatter: Record<string, unknown> = {
    title: "Test Title",
    is_done: false,
  };

  beforeEach(() => {
    // Reset mocks
    vi.resetAllMocks();

    // Mock path.join to return predictable paths
    vi.mocked(path.join).mockImplementation((...paths) => paths.join("/"));

    // Create a new adapter instance for each test
    adapter = new MarkdownFileAdapter();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("readFile", () => {
    it("should return null if the file doesn't exist", async () => {
      // Mock fs.existsSync to return false
      vi.mocked(fs.existsSync).mockReturnValueOnce(false);

      // Act
      const result = await adapter.readFile(testFilePath);

      // Assert
      expect(result).toBeNull();
    });

    it("should return file content and frontmatter if the file exists", async () => {
      // Mock fs.existsSync to return true
      vi.mocked(fs.existsSync).mockReturnValueOnce(true);

      // Mock fs.readFileSync to return file content
      vi.mocked(fs.readFileSync).mockReturnValueOnce(
        Buffer.from("file content")
      );

      // Mock gray-matter to return parsed content
      vi.mocked(matter).mockReturnValueOnce({
        data: testFrontMatter,
        content: testContent,
        orig: "original content",
        language: "yaml",
        matter: "---\ntitle: Test Title\nis_done: false\n---",
        stringify: () => "stringified content",
      });

      // Act
      const result = await adapter.readFile(testFilePath);

      // Assert
      expect(result).not.toBeNull();
      expect(result?.frontMatter).toEqual(testFrontMatter);
      expect(result?.content).toBe(testContent);
    });

    it("should return null if there's an error reading the file", async () => {
      // Mock fs.existsSync to return true
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
      const result = await adapter.readFile(testFilePath);

      // Assert
      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe("writeFile", () => {
    it("should create the directory if it doesn't exist", async () => {
      // Mock fs.existsSync to return false for the directory
      vi.mocked(fs.existsSync).mockReturnValueOnce(false);

      // Mock path.dirname to return the directory path
      vi.mocked(path.dirname).mockReturnValueOnce(testDir);

      // Mock matter.stringify to return formatted content
      vi.mocked(matter.stringify).mockReturnValueOnce("formatted content");

      // Act
      await adapter.writeFile(testFilePath, testContent, testFrontMatter);

      // Assert
      expect(fs.mkdirSync).toHaveBeenCalledWith(testDir, { recursive: true });
    });

    it("should write content with frontmatter to the file", async () => {
      // Mock fs.existsSync to return true for the directory
      vi.mocked(fs.existsSync).mockReturnValueOnce(true);

      // Mock path.dirname to return the directory path
      vi.mocked(path.dirname).mockReturnValueOnce(testDir);

      // Mock matter.stringify to return formatted content
      vi.mocked(matter.stringify).mockReturnValueOnce("formatted content");

      // Act
      await adapter.writeFile(testFilePath, testContent, testFrontMatter);

      // Assert
      expect(matter.stringify).toHaveBeenCalledWith(
        "\n" + testContent,
        testFrontMatter
      );
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        testFilePath,
        "formatted content"
      );
    });

    it("should throw an error if writing to the file fails", async () => {
      // Mock fs.existsSync to return true for the directory
      vi.mocked(fs.existsSync).mockReturnValueOnce(true);

      // Mock path.dirname to return the directory path
      vi.mocked(path.dirname).mockReturnValueOnce(testDir);

      // Mock matter.stringify to return formatted content
      vi.mocked(matter.stringify).mockReturnValueOnce("formatted content");

      // Mock fs.writeFileSync to throw an error
      vi.mocked(fs.writeFileSync).mockImplementationOnce(() => {
        throw new Error("Test error");
      });

      // Act & Assert
      await expect(
        adapter.writeFile(testFilePath, testContent, testFrontMatter)
      ).rejects.toThrow();
    });
  });

  describe("deleteFile", () => {
    it("should delete the file if it exists", async () => {
      // Mock fs.existsSync to return true
      vi.mocked(fs.existsSync).mockReturnValueOnce(true);

      // Act
      await adapter.deleteFile(testFilePath);

      // Assert
      expect(fs.unlinkSync).toHaveBeenCalledWith(testFilePath);
    });

    it("should not throw an error if the file doesn't exist", async () => {
      // Mock fs.existsSync to return false
      vi.mocked(fs.existsSync).mockReturnValueOnce(false);

      // Act & Assert
      await expect(adapter.deleteFile(testFilePath)).resolves.not.toThrow();
      expect(fs.unlinkSync).not.toHaveBeenCalled();
    });
  });

  describe("listFiles", () => {
    it("should return an empty array if the directory doesn't exist", async () => {
      // Mock fs.existsSync to return false
      vi.mocked(fs.existsSync).mockReturnValueOnce(false);

      // Act
      const result = await adapter.listFiles(testDir, ".md");

      // Assert
      expect(result).toEqual([]);
    });

    it("should return a list of files with the specified extension", async () => {
      // Mock fs.existsSync to return true
      vi.mocked(fs.existsSync).mockReturnValueOnce(true);

      // Mock fs.readdirSync to return a list of files
      const mockDirEntries = [
        { name: "file1.md", isFile: () => true, parentPath: testDir },
        { name: "file2.md", isFile: () => true, parentPath: testDir },
        { name: "file3.txt", isFile: () => true, parentPath: testDir },
        { name: "subdir", isFile: () => false, parentPath: testDir },
      ];
      vi.mocked(fs.readdirSync).mockReturnValueOnce(
        mockDirEntries as unknown as fs.Dirent[]
      );

      // Act
      const result = await adapter.listFiles(testDir, ".md");

      // Assert
      expect(result).toHaveLength(2);
      expect(result).toContain(`${testDir}/file1.md`);
      expect(result).toContain(`${testDir}/file2.md`);
      expect(result).not.toContain(`${testDir}/file3.txt`);
    });
  });
});
