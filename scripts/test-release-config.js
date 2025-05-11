#!/usr/bin/env node

import semanticRelease from "semantic-release";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import console from "console";
import process from "process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function testReleaseConfig() {
  console.log("Testing semantic-release configuration...");

  try {
    const result = await semanticRelease(
      {
        // Dry run mode
        dryRun: true,
        // Log level for debugging
        debug: true,
        // Don't actually create Git tags
        ci: false,
      },
      {
        cwd: resolve(__dirname, ".."),
        env: { ...process.env },
      }
    );

    if (result) {
      const { nextRelease, releases } = result;

      console.log("\n✅ Release configuration is valid");
      console.log(`\nNext release version: ${nextRelease.version}`);
      console.log(`Release type: ${nextRelease.type}`);
      console.log(`Git tag: ${nextRelease.gitTag}`);

      console.log("\nPlugins that would run:");
      releases.forEach((release) => {
        console.log(`- ${release.pluginName}`);
      });
    } else {
      console.log("\n⚠️ No release would be created based on current commits");
    }
  } catch (error) {
    console.error("\n❌ Error testing release configuration:", error);
    process.exit(1);
  }
}

testReleaseConfig();
