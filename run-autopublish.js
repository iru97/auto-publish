#!/usr/bin/env node

// Auto-Publish System - Main Executable Script
// Complete automated content creation from trend detection to delivery
// Usage: node run-autopublish.js [options]

const fs = require("fs-extra");
const path = require("path");
const { program } = require("commander");
const chalk = require("chalk");
const ora = require("ora");

// Import core system
const WorkflowEngine = require("./core/workflow-engine");
const completeWorkflow = require("./workflows/complete-autopublish-workflow");

// Configure CLI
program
  .name("auto-publish")
  .description("Automated content creation system - from trends to delivery")
  .version("1.0.0")
  .option("-n, --niche <niche>", "Specific niche to focus on (optional)")
  .option(
    "-t, --topic <topic>",
    "Specific topic to create content about (optional)"
  )
  .option(
    "-v, --voice <provider>",
    "Voice provider (openai, elevenlabs, azure, google, aws)",
    "openai"
  )
  .option("-p, --platform <platform>", "Delivery platform", "local")
  .option(
    "-q, --quality <level>",
    "Quality level (low, medium, high, ultra)",
    "high"
  )
  .option(
    "-s, --style <style>",
    "Content style (educational, entertainment, news, opinion)",
    "educational"
  )
  .option(
    "-d, --duration <seconds>",
    "Target audio duration in seconds",
    "90-120"
  )
  .option(
    "-r, --ratio <ratio>",
    "Video aspect ratio (16:9, 9:16, 1:1, 4:3)",
    "9:16"
  )
  .option("--dry-run", "Validate configuration without executing")
  .option("--verbose", "Enable verbose logging")
  .option("--config <file>", "Load configuration from JSON file")
  .parse();

const options = program.opts();

// Main execution function
async function main() {
  console.log(chalk.blue.bold("\n🚀 Auto-Publish System v1.0.0"));
  console.log(
    chalk.gray("Automated content creation from trends to delivery\n")
  );

  try {
    // Load configuration
    const config = await loadConfiguration(options);

    if (options.dryRun) {
      console.log(
        chalk.yellow("🔍 Dry run mode - validating configuration...\n")
      );
      await validateConfiguration(config);
      console.log(chalk.green("✅ Configuration is valid!"));
      return;
    }

    // Initialize workflow engine
    const engine = new WorkflowEngine();

    // Setup progress tracking
    setupProgressTracking(engine);

    // Execute complete workflow
    console.log(chalk.blue("🎬 Starting content creation workflow...\n"));
    const result = await engine.executeWorkflow(completeWorkflow, config);

    // Display results
    await displayResults(result);
  } catch (error) {
    console.error(chalk.red.bold("\n❌ Workflow failed:"));
    console.error(chalk.red(error.message));

    if (options.verbose) {
      console.error(chalk.gray("\nFull error details:"));
      console.error(error);
    }

    process.exit(1);
  }
}

// Load and merge configuration from various sources
async function loadConfiguration(options) {
  let config = {
    // Default configuration
    niche: null,
    topic: null,
    voiceProvider: "openai",
    videoTemplate: "podcast",
    deliveryPlatform: "local",
    advanced: {
      trendSources: ["google", "youtube", "reddit", "twitter"],
      contentStyle: "educational",
      audioDuration: "90-120",
      videoAspectRatio: "9:16",
      qualityLevel: "high",
    },
  };

  // Load from config file if specified
  if (options.config) {
    try {
      const fileConfig = await fs.readJson(options.config);
      config = { ...config, ...fileConfig };
      console.log(
        chalk.green(`📄 Loaded configuration from ${options.config}`)
      );
    } catch (error) {
      console.warn(
        chalk.yellow(`⚠️  Could not load config file: ${error.message}`)
      );
    }
  }

  // Override with CLI options
  if (options.niche) config.niche = options.niche;
  if (options.topic) config.topic = options.topic;
  if (options.voice) config.voiceProvider = options.voice;
  if (options.platform) config.deliveryPlatform = options.platform;
  if (options.quality) config.advanced.qualityLevel = options.quality;
  if (options.style) config.advanced.contentStyle = options.style;
  if (options.duration) config.advanced.audioDuration = options.duration;
  if (options.ratio) config.advanced.videoAspectRatio = options.ratio;

  return config;
}

// Validate configuration before execution
async function validateConfiguration(config) {
  const validations = [
    {
      name: "Voice Provider",
      check: () =>
        ["openai", "elevenlabs", "azure", "google", "aws"].includes(
          config.voiceProvider
        ),
      message: `Invalid voice provider: ${config.voiceProvider}`,
    },
    {
      name: "Delivery Platform",
      check: () =>
        [
          "local",
          "youtube",
          "tiktok",
          "instagram",
          "twitter",
          "linkedin",
        ].includes(config.deliveryPlatform),
      message: `Invalid delivery platform: ${config.deliveryPlatform}`,
    },
    {
      name: "Quality Level",
      check: () =>
        ["low", "medium", "high", "ultra"].includes(
          config.advanced.qualityLevel
        ),
      message: `Invalid quality level: ${config.advanced.qualityLevel}`,
    },
    {
      name: "Content Style",
      check: () =>
        ["educational", "entertainment", "news", "opinion"].includes(
          config.advanced.contentStyle
        ),
      message: `Invalid content style: ${config.advanced.contentStyle}`,
    },
    {
      name: "Video Aspect Ratio",
      check: () =>
        ["16:9", "9:16", "1:1", "4:3"].includes(
          config.advanced.videoAspectRatio
        ),
      message: `Invalid aspect ratio: ${config.advanced.videoAspectRatio}`,
    },
  ];

  for (const validation of validations) {
    if (!validation.check()) {
      throw new Error(`${validation.name}: ${validation.message}`);
    }
    console.log(chalk.green(`✓ ${validation.name}`));
  }

  // Check environment variables for API keys
  const requiredEnvVars = getRequiredEnvVars(config);
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      console.warn(chalk.yellow(`⚠️  Missing environment variable: ${envVar}`));
    } else {
      console.log(chalk.green(`✓ ${envVar} configured`));
    }
  }
}

// Get required environment variables based on configuration
function getRequiredEnvVars(config) {
  const envVars = [];

  // Voice provider API keys
  switch (config.voiceProvider) {
    case "openai":
      envVars.push("OPENAI_API_KEY");
      break;
    case "elevenlabs":
      envVars.push("ELEVENLABS_API_KEY");
      break;
    case "azure":
      envVars.push("AZURE_SPEECH_KEY", "AZURE_SPEECH_REGION");
      break;
    case "google":
      envVars.push("GOOGLE_APPLICATION_CREDENTIALS");
      break;
    case "aws":
      envVars.push("AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY", "AWS_REGION");
      break;
  }

  // Platform-specific API keys
  switch (config.deliveryPlatform) {
    case "youtube":
      envVars.push("YOUTUBE_API_KEY");
      break;
    case "tiktok":
      envVars.push("TIKTOK_API_KEY");
      break;
    case "instagram":
      envVars.push("INSTAGRAM_ACCESS_TOKEN");
      break;
    case "twitter":
      envVars.push("TWITTER_API_KEY", "TWITTER_API_SECRET");
      break;
  }

  // Always needed for trend detection
  envVars.push(
    "GOOGLE_TRENDS_API_KEY",
    "REDDIT_CLIENT_ID",
    "REDDIT_CLIENT_SECRET"
  );

  return envVars;
}

// Setup progress tracking with visual indicators
function setupProgressTracking(engine) {
  let currentSpinner = null;
  let stepSpinners = new Map();

  engine.on("workflow:started", ({ workflowId }) => {
    console.log(
      chalk.blue(`🎯 Workflow ${workflowId.substring(0, 8)} started\n`)
    );
  });

  engine.on("step:started", ({ step, stepIndex }) => {
    if (currentSpinner) {
      currentSpinner.stop();
    }

    const spinner = ora({
      text: `${step.description}`,
      color: "cyan",
      spinner: "dots",
    }).start();

    currentSpinner = spinner;
    stepSpinners.set(step.name, spinner);

    console.log(chalk.cyan(`\n📍 Step ${stepIndex + 1}/5: ${step.name}`));
  });

  engine.on("step:completed", ({ step, stepIndex, result }) => {
    const spinner = stepSpinners.get(step.name);
    if (spinner) {
      spinner.succeed(chalk.green(`✅ ${step.description}`));
      stepSpinners.delete(step.name);
    }

    // Show step summary
    if (result && result.summary) {
      console.log(chalk.gray(`   ${result.summary}`));
    }
  });

  engine.on("step:failed", ({ step, error }) => {
    const spinner = stepSpinners.get(step.name);
    if (spinner) {
      spinner.fail(chalk.red(`❌ ${step.description}`));
      stepSpinners.delete(step.name);
    }

    console.log(chalk.red(`   Error: ${error.message}`));
  });

  engine.on("workflow:completed", ({ result }) => {
    if (currentSpinner) {
      currentSpinner.stop();
    }
    console.log(chalk.green.bold("\n🎉 Workflow completed successfully!"));
  });

  engine.on("workflow:failed", ({ error }) => {
    if (currentSpinner) {
      currentSpinner.stop();
    }
    console.log(chalk.red.bold("\n💥 Workflow failed!"));
  });
}

// Display final results in a formatted way
async function displayResults(result) {
  console.log(chalk.blue.bold("\n📊 EXECUTION RESULTS"));
  console.log(chalk.blue("=".repeat(50)));

  // Execution summary
  if (result.execution) {
    console.log(chalk.white.bold("\n🎯 Execution Summary:"));
    console.log(
      `   Status: ${
        result.execution.status === "completed"
          ? chalk.green("✅ Completed")
          : chalk.red("❌ Failed")
      }`
    );
    console.log(
      `   Duration: ${chalk.cyan(
        Math.round(result.execution.duration / 1000)
      )}s`
    );
    console.log(
      `   Steps: ${chalk.cyan(result.execution.stepsCompleted)}/${chalk.cyan(
        result.execution.totalSteps
      )}`
    );
  }

  // Deliverables
  if (result.deliverables) {
    console.log(chalk.white.bold("\n📦 Generated Content:"));

    if (result.deliverables.video) {
      console.log(`   Video: ${chalk.green(result.deliverables.video.file)}`);
      console.log(
        `   Duration: ${chalk.cyan(result.deliverables.video.duration)}s`
      );
      console.log(
        `   Size: ${chalk.cyan(formatFileSize(result.deliverables.video.size))}`
      );
    }

    if (result.deliverables.audio) {
      console.log(`   Audio: ${chalk.green(result.deliverables.audio.file)}`);
    }

    if (result.deliverables.transcript) {
      console.log(
        `   Transcript: ${chalk.green(result.deliverables.transcript.srt)}`
      );
    }
  }

  // Quality metrics
  if (result.analytics && result.analytics.quality) {
    console.log(chalk.white.bold("\n⭐ Quality Metrics:"));
    const quality = result.analytics.quality;
    console.log(`   Audio Quality: ${getQualityBar(quality.audioQuality)}`);
    console.log(`   Video Quality: ${getQualityBar(quality.videoQuality)}`);
    console.log(`   Content Quality: ${getQualityBar(quality.contentQuality)}`);
    console.log(`   Overall Score: ${getQualityBar(quality.overallScore)}`);
  }

  // Cost breakdown
  if (result.analytics && result.analytics.costs) {
    console.log(chalk.white.bold("\n💰 Cost Breakdown:"));
    console.log(
      `   Total Cost: ${chalk.yellow(
        "$" + result.analytics.costs.totalCost.toFixed(2)
      )}`
    );

    if (result.analytics.costs.costBreakdown) {
      for (const [service, cost] of Object.entries(
        result.analytics.costs.costBreakdown
      )) {
        console.log(`   ${service}: ${chalk.gray("$" + cost.toFixed(2))}`);
      }
    }
  }

  // Delivery status
  if (result.delivery) {
    console.log(chalk.white.bold("\n🚀 Delivery Status:"));
    console.log(`   Platform: ${chalk.cyan(result.delivery.platform)}`);
    console.log(
      `   Status: ${
        result.delivery.status === "success"
          ? chalk.green("✅ Success")
          : chalk.red("❌ Failed")
      }`
    );

    if (result.delivery.url) {
      console.log(`   URL: ${chalk.blue(result.delivery.url)}`);
    }
  }

  console.log(chalk.blue("\n" + "=".repeat(50)));
  console.log(
    chalk.green(
      "🎬 Content creation completed! Check the output directory for all files."
    )
  );
}

// Helper functions
function formatFileSize(bytes) {
  const sizes = ["B", "KB", "MB", "GB"];
  if (bytes === 0) return "0 B";
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
}

function getQualityBar(score) {
  const normalizedScore = Math.round(score);
  const filled = "█".repeat(normalizedScore);
  const empty = "░".repeat(10 - normalizedScore);
  const color =
    normalizedScore >= 8
      ? chalk.green
      : normalizedScore >= 6
      ? chalk.yellow
      : chalk.red;
  return `${color(filled)}${chalk.gray(empty)} ${normalizedScore}/10`;
}

// Handle uncaught errors
process.on("uncaughtException", (error) => {
  console.error(chalk.red.bold("\n💥 Uncaught Exception:"));
  console.error(chalk.red(error.message));
  if (options.verbose) {
    console.error(error.stack);
  }
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error(chalk.red.bold("\n💥 Unhandled Rejection:"));
  console.error(chalk.red(reason));
  if (options.verbose) {
    console.error(promise);
  }
  process.exit(1);
});

// Execute main function
if (require.main === module) {
  main().catch((error) => {
    console.error(chalk.red.bold("\n💥 Fatal Error:"));
    console.error(chalk.red(error.message));
    process.exit(1);
  });
}

module.exports = { main, loadConfiguration, validateConfiguration };
