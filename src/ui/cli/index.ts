import { Command } from "commander";
import { initCommand } from "./commands/init.js";
import { addCommand } from "./commands/add.js";
import { listCommand } from "./commands/list.js";
import { doneCommand } from "./commands/done.js";
import { deleteCommand } from "./commands/delete.js";
import { mcpServerCommand } from "./commands/mcp-server.js";

const program = new Command();

program
  .name("mtd")
  .description(
    "MarkTaskDown - A lightweight CLI for managing tasks as Markdown files"
  )
  .version("0.0.0");

program.action(() => {
  console.log("🎉 Woohoo! Your task manager is alive and kicking!");
  console.log(
    "📝 Ready to organize your thoughts faster than you can forget them!"
  );
  console.log(
    '🚀 Type "mtd --help" to see what else I can do (spoiler: not much yet).'
  );
});

program
  .command("init")
  .description("Initialize a tasks directory in the current folder")
  .action(async () => {
    await initCommand();
  });

program
  .command("add")
  .description("Add a new task")
  .argument(
    "[title]",
    "Title of the task (optional, will prompt if not provided)"
  )
  .option("-d, --description <description>", "Description of the task")
  .action(async (title, options) => {
    await addCommand(title, options);
  });

program
  .command("list")
  .description("List all tasks")
  .action(async () => {
    await listCommand();
  });

program
  .command("done")
  .description("Mark tasks as done")
  .argument("[slugs...]", "Task slugs to mark as done (optional)")
  .action(async (slugs) => {
    await doneCommand(slugs);
  });

program
  .command("delete")
  .description("Delete tasks by moving them to archive")
  .action(deleteCommand);

program
  .command("mcp-server")
  .description("Start the MarkTaskDown MCP server with STDIO transport")
  .action(async () => {
    await mcpServerCommand();
  });

program.parse();
