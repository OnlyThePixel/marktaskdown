import { Command } from "commander";
import { initCommand } from "./commands/init.js";
import { addCommand } from "./commands/add.js";
import { listCommand } from "./commands/list.js";
import { doneCommand } from "./commands/done.js";

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
  .action(initCommand);

program
  .command("add")
  .description("Add a new task")
  .argument("<title>", "Title of the task")
  .option("-d, --description <description>", "Description of the task")
  .action((title, options) => addCommand(title, options));

program.command("list").description("List all tasks").action(listCommand);

program.command("done").description("Mark tasks as done").action(doneCommand);

program.parse();
