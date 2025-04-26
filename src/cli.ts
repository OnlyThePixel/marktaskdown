import { Command } from "commander";

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

program.parse();
