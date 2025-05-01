import fs from "fs";
import path from "path";
import matter from "gray-matter";

/**
 * Interface for the result of reading a markdown file
 */
export interface MarkdownFileContent {
  frontMatter: Record<string, unknown>;
  content: string;
}

/**
 * MarkdownFileAdapter
 * Handles reading and writing markdown files with YAML frontmatter
 */
export class MarkdownFileAdapter {
  /**
   * Reads a markdown file and returns its content and frontmatter
   *
   * @param filePath - Path to the markdown file
   * @returns The file content and frontmatter, or null if the file doesn't exist or can't be read
   */
  async readFile(filePath: string): Promise<MarkdownFileContent | null> {
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return null;
    }

    try {
      // Read and parse file
      const fileContent = fs.readFileSync(filePath, "utf8");
      const { data, content } = matter(fileContent);

      return {
        frontMatter: data,
        content,
      };
    } catch (error) {
      console.error(`Error reading markdown file: ${filePath}`, error);

      return null;
    }
  }

  /**
   * Writes content with frontmatter to a markdown file
   *
   * @param filePath - Path to the markdown file
   * @param content - The content to write
   * @param frontMatter - The frontmatter to include
   */
  async writeFile(
    filePath: string,
    content: string,
    frontMatter: Record<string, unknown>
  ): Promise<void> {
    // Ensure directory exists
    const dirPath = path.dirname(filePath);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    // Add a newline at the beginning of the content to ensure that
    // the front matter is separated from the content to avoid lint errors
    content = "\n" + content;

    // Create file content with YAML front matter
    let fileContent = matter.stringify(content, frontMatter);

    // Ensure quoted string values in front matter are quoted with double quotes
    fileContent = fileContent.replace(
      /^---\n([\s\S]*?)---/m,
      (frontMatterBlock) => {
        let processedBlock = frontMatterBlock;

        // Replace any single-quoted values with double-quoted values
        processedBlock = processedBlock.replace(
          /: '((?:[^']|\\')+)'/g,
          ': "$1"'
        );

        return processedBlock;
      }
    );

    // Write to file
    fs.writeFileSync(filePath, fileContent);
  }

  /**
   * Deletes a file if it exists
   *
   * @param filePath - Path to the file to delete
   */
  async deleteFile(filePath: string): Promise<void> {
    // Check if file exists
    if (fs.existsSync(filePath)) {
      // Delete file
      fs.unlinkSync(filePath);
    }
    // If file doesn't exist, do nothing
  }

  /**
   * Lists all files in a directory with a specific extension
   *
   * @param dirPath - Path to the directory
   * @param extension - File extension to filter by (e.g., ".md")
   * @returns An array of file paths
   */
  async listFiles(dirPath: string, extension: string): Promise<string[]> {
    // Check if directory exists
    if (!fs.existsSync(dirPath)) {
      return [];
    }

    const filePaths: string[] = [];
    const dirEntries: fs.Dirent[] = fs.readdirSync(dirPath, {
      withFileTypes: true,
    });

    // Filter for files with the specified extension
    const filteredFiles: fs.Dirent[] = dirEntries.filter(
      (dirEntry) => dirEntry.isFile() && dirEntry.name.endsWith(extension)
    );

    // Build full file paths
    for (const file of filteredFiles) {
      const filePath = path.join(file.parentPath, file.name);
      filePaths.push(filePath);
    }

    return filePaths;
  }
}
