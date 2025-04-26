import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import fs from "fs";
import path from "path";
import { initCommand } from "../src/commands/init.js";

vi.mock("fs", () => ({
  default: {
    existsSync: vi.fn(),
    mkdirSync: vi.fn(),
  },
}));

vi.mock("path", () => ({
  default: {
    join: vi.fn((...args) => args.join("/")),
  },
}));

describe("Init Command", () => {
  const mockCwd = "/mock/current/dir";
  const tasksDir = `${mockCwd}/tasks`;

  const originalCwd = process.cwd;

  beforeEach(() => {
    process.cwd = vi.fn().mockReturnValue(mockCwd);
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.cwd = originalCwd;
  });

  it("creates tasks directory if it does not exist", () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);

    initCommand();

    expect(fs.existsSync).toHaveBeenCalledWith(tasksDir);
    expect(fs.mkdirSync).toHaveBeenCalledWith(tasksDir, { recursive: true });
  });

  it("does not create tasks directory if it already exists", () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);

    initCommand();

    expect(fs.existsSync).toHaveBeenCalledWith(tasksDir);
    expect(fs.mkdirSync).not.toHaveBeenCalled();
  });
});
