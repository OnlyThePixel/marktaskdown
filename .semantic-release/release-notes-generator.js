import { readFileSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Custom release notes generator that categorizes changes based on gitmojis
 * @param {Object} pluginConfig The plugin configuration
 * @param {Object} context The semantic-release context
 * @returns {Promise<string>} The release notes
 */
export async function generateNotes(pluginConfig, context) {
  const { commits, logger, nextRelease } = context;

  // Load gitmojis from the project's gitmojis.json file
  const gitmojiPath = join(__dirname, "..", "gitmojis.json");
  let gitmojis;

  try {
    const gitmojiContent = readFileSync(gitmojiPath, "utf8");
    gitmojis = JSON.parse(gitmojiContent).gitmojis;
    logger.log("Loaded %d gitmojis from %s", gitmojis.length, gitmojiPath);
  } catch (error) {
    logger.error("Error loading gitmojis.json: %s", error);
    throw error;
  }

  // Create a map of emoji to category for quick lookup
  const emojiToCategory = new Map();
  const emojiToDescription = new Map();

  // Define categories
  const categories = {
    "💥 Breaking Changes": [],
    "✨ Features": [],
    "🐛 Bug Fixes": [],
    "🚑️ Critical Hotfixes": [],
    "⚡️ Performance Improvements": [],
    "♻️ Refactoring": [],
    "📝 Documentation": [],
    "🔧 Configuration": [],
    "🔒️ Security": [],
    "⬆️ Dependencies": [],
    "🧪 Tests": [],
    "💄 UI/UX": [],
    "🚚 Chores": [],
  };

  // Map gitmojis to categories
  for (const gitmoji of gitmojis) {
    let category;

    // Assign category based on gitmoji
    switch (gitmoji.code) {
      case ":boom:":
        category = "💥 Breaking Changes";
        break;
      case ":sparkles:":
        category = "✨ Features";
        break;
      case ":bug:":
      case ":goal_net:":
        category = "🐛 Bug Fixes";
        break;
      case ":ambulance:":
        category = "🚑️ Critical Hotfixes";
        break;
      case ":zap:":
        category = "⚡️ Performance Improvements";
        break;
      case ":recycle:":
        category = "♻️ Refactoring";
        break;
      case ":memo:":
      case ":bulb:":
        category = "📝 Documentation";
        break;
      case ":wrench:":
      case ":hammer:":
        category = "🔧 Configuration";
        break;
      case ":lock:":
      case ":closed_lock_with_key:":
        category = "🔒️ Security";
        break;
      case ":arrow_up:":
      case ":arrow_down:":
      case ":pushpin:":
      case ":heavy_plus_sign:":
      case ":heavy_minus_sign:":
        category = "⬆️ Dependencies";
        break;
      case ":white_check_mark:":
      case ":test_tube:":
      case ":camera_flash:":
        category = "🧪 Tests";
        break;
      case ":lipstick:":
      case ":iphone:":
      case ":children_crossing:":
      case ":wheelchair:":
      case ":dizzy:":
        category = "💄 UI/UX";
        break;
      default:
        category = "🚚 Chores";
        break;
    }

    emojiToCategory.set(gitmoji.emoji, category);
    emojiToCategory.set(gitmoji.code, category);
    emojiToDescription.set(gitmoji.emoji, gitmoji.description);
    emojiToDescription.set(gitmoji.code, gitmoji.description);
  }

  // Process commits and categorize them
  for (const commit of commits) {
    const { message, hash, subject } = commit;

    // Extract the first line of the commit message
    const firstLine = subject || message.split("\n")[0];

    // Find the gitmoji in the commit message
    let foundEmoji = null;
    let category = "🚚 Chores"; // Default category

    for (const [emoji, cat] of emojiToCategory.entries()) {
      if (firstLine.startsWith(emoji) || firstLine.includes(emoji)) {
        foundEmoji = emoji;
        category = cat;
        break;
      }
    }

    // Clean up the commit message by removing the gitmoji
    let cleanMessage = firstLine;
    if (foundEmoji) {
      cleanMessage = firstLine.replace(foundEmoji, "").trim();
    }

    // Add the commit to the appropriate category
    categories[category].push({
      hash: hash.substring(0, 7),
      message: cleanMessage,
      emoji: foundEmoji,
    });
  }

  // Generate the release notes in markdown format
  let notes = `# ${nextRelease.version} (${new Date().toISOString().split("T")[0]})\n\n`;

  // Add each category to the notes
  for (const [category, commits] of Object.entries(categories)) {
    if (commits.length > 0) {
      notes += `## ${category}\n\n`;

      for (const commit of commits) {
        notes += `* \`${commit.hash}\` ${commit.message}\n`;
      }

      notes += "\n";
    }
  }

  return notes;
}

export default {
  generateNotes,
};
