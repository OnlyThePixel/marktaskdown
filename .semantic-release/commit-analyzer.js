import { readFileSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Custom commit analyzer that uses gitmojis.json to determine the semantic version bump
 * @param {Object} pluginConfig The plugin configuration
 * @param {Object} context The semantic-release context
 * @returns {Promise<string|null>} The semantic version bump type or null if no release should be done
 */
export async function analyzeCommits(pluginConfig, context) {
  const { logger, commits } = context;

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

  // Create a map of emoji to semver type for quick lookup
  const emojiToSemver = new Map();
  for (const gitmoji of gitmojis) {
    if (gitmoji.semver) {
      emojiToSemver.set(gitmoji.emoji, gitmoji.semver);
      // Also map the code (e.g., :sparkles:) to the semver type
      emojiToSemver.set(gitmoji.code, gitmoji.semver);
    }
  }

  // Analyze commits to determine the release type
  let releaseType = null;

  // Order of precedence: major > minor > patch
  for (const commit of commits) {
    const { message } = commit;

    // Check if the commit message starts with a gitmoji
    for (const [emoji, semver] of emojiToSemver.entries()) {
      if (message.startsWith(emoji) || message.includes(emoji)) {
        logger.log("Found %s in commit: %s", emoji, message.split("\n")[0]);

        // Update releaseType based on semver precedence
        switch (semver) {
          case "major":
            releaseType = "major";
            break;
          case "minor":
            if (releaseType !== "major") {
              releaseType = "minor";
            }
            break;
          case "patch":
            if (!releaseType) {
              releaseType = "patch";
            }
            break;
          default:
            logger.error("Unknown semver type: %s", semver);
            break;
        }
      }
    }

    // If we've already found a major change, no need to check further
    if (releaseType === "major") {
      break;
    }
  }

  logger.log("Analysis result: %s", releaseType || "no release");
  return releaseType;
}

export default {
  analyzeCommits,
};
