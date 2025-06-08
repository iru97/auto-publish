// Workflow Engine - Central Orchestrator for Auto-Publish System
// Coordinates all modules: trend-detector, content-generator, audio-synthesizer, video-composer, delivery-system

const fs = require("fs-extra");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const winston = require("winston");
const EventEmitter = require("events");

// Import contract registry and validator
const ContractRegistry = require("./contract-registry");
const StrictValidator = require("./strict-validator");

// Configure logger
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({
      filename: "logs/workflow-error.log",
      level: "error",
    }),
    new winston.transports.File({ filename: "logs/workflow-combined.log" }),
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});

// Custom error class
class WorkflowEngineError extends Error {
  constructor(message, code, step = null, details = null) {
    super(message);
    this.name = "WorkflowEngineError";
    this.code = code;
    this.step = step;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
}

// Main Workflow Engine class
class WorkflowEngine extends EventEmitter {
  constructor() {
    super();
    this.workflowId = uuidv4();
    this.startTime = Date.now();
    this.contractRegistry = new ContractRegistry();
    this.validator = new StrictValidator();
    this.currentStep = null;
    this.stepResults = new Map();
    this.workflowState = "initialized";
    this.progressTracking = {
      totalSteps: 0,
      completedSteps: 0,
      currentStepProgress: 0,
      overallProgress: 0,
    };
  }

  // Main workflow execution function
  async executeWorkflow(workflowDefinition, initialInput = {}) {
    try {
      logger.info(`Starting workflow execution ${this.workflowId}`);
      this.emit("workflow:started", { workflowId: this.workflowId });

      // Validate workflow definition
      await this.validateWorkflowDefinition(workflowDefinition);

      // Initialize progress tracking
      this.progressTracking.totalSteps = workflowDefinition.steps.length;
      this.workflowState = "running";

      // Execute steps sequentially
      let currentInput = initialInput;
      const executionResults = [];

      for (let i = 0; i < workflowDefinition.steps.length; i++) {
        const step = workflowDefinition.steps[i];
        this.currentStep = step;
        this.progressTracking.completedSteps = i;
        this.progressTracking.currentStepProgress = 0;
        this.updateOverallProgress();

        logger.info(
          `Executing step ${i + 1}/${workflowDefinition.steps.length}: ${
            step.module
          }`
        );
        this.emit("step:started", {
          step,
          stepIndex: i,
          workflowId: this.workflowId,
        });

        try {
          // Execute step with validation
          const stepResult = await this.executeStep(step, currentInput);

          // Debug logging for failed steps
          if (
            process.env.NODE_ENV === "test" ||
            process.env.NODE_ENV === "development"
          ) {
            if (stepResult.status === "failed") {
              console.log(
                `❌ Step ${step.module} failed with error:`,
                stepResult.error
              );
              console.log(`❌ Error code:`, stepResult.errorCode);
            }
          }

          // Store result and prepare input for next step
          executionResults.push(stepResult);
          this.stepResults.set(step.module, stepResult);

          // Only prepare next step input if current step succeeded
          if (stepResult.status === "success") {
            currentInput = this.prepareNextStepInput(
              step,
              stepResult,
              currentInput
            );
          } else {
            // Step failed, handle based on onFailure setting
            if (step.onFailure === "continue") {
              logger.warn(`Continuing workflow despite ${step.module} failure`);
              // Don't update currentInput, keep it as is for next step
            } else {
              // Stop workflow on failure
              throw new WorkflowEngineError(
                `Workflow failed at step ${step.module}: ${stepResult.error}`,
                "STEP_EXECUTION_FAILED",
                step.module,
                { originalError: stepResult.error, stepIndex: i }
              );
            }
          }

          this.progressTracking.completedSteps = i + 1;
          this.progressTracking.currentStepProgress = 100;
          this.updateOverallProgress();

          this.emit("step:completed", {
            step,
            stepIndex: i,
            result: stepResult,
            workflowId: this.workflowId,
          });
        } catch (error) {
          logger.error(`Step ${step.module} failed:`, error);
          this.workflowState = "failed";

          this.emit("step:failed", {
            step,
            stepIndex: i,
            error,
            workflowId: this.workflowId,
          });

          // Handle step failure based on configuration
          if (step.onFailure === "continue") {
            logger.warn(`Continuing workflow despite ${step.module} failure`);
            executionResults.push({ status: "failed", error: error.message });
            continue;
          } else {
            throw new WorkflowEngineError(
              `Workflow failed at step ${step.module}: ${error.message}`,
              "STEP_EXECUTION_FAILED",
              step.module,
              { originalError: error.message, stepIndex: i }
            );
          }
        }
      }

      // Workflow completed successfully
      this.workflowState = "completed";
      this.progressTracking.overallProgress = 100;

      const finalResult = await this.generateWorkflowResult(
        workflowDefinition,
        executionResults,
        initialInput
      );

      logger.info(`Workflow ${this.workflowId} completed successfully`);
      this.emit("workflow:completed", {
        workflowId: this.workflowId,
        result: finalResult,
      });

      return finalResult;
    } catch (error) {
      this.workflowState = "failed";
      logger.error(`Workflow ${this.workflowId} failed:`, error);

      this.emit("workflow:failed", {
        workflowId: this.workflowId,
        error,
      });

      throw error;
    }
  }

  // Execute individual step with contract validation
  async executeStep(step, input) {
    const stepStartTime = Date.now();

    try {
      // Get module contract
      const contract = await this.contractRegistry.getContract(step.module);
      if (!contract) {
        throw new WorkflowEngineError(
          `Contract not found for module: ${step.module}`,
          "CONTRACT_NOT_FOUND",
          step.module
        );
      }

      // Process input mapping if defined
      const mappedInput = this.processInputMapping(step, input);

      // Validate input against contract
      const validationResult = await this.validator.validateInput(
        mappedInput,
        contract,
        step.module
      );

      if (!validationResult.isValid) {
        throw new WorkflowEngineError(
          `Input validation failed for ${
            step.module
          }: ${validationResult.errors.join(", ")}`,
          "INPUT_VALIDATION_FAILED",
          step.module,
          { validationErrors: validationResult.errors }
        );
      }

      // Load and execute module
      const moduleFunction = await this.loadModule(step.module);

      // Merge step config with mapped input
      const stepInput = {
        ...mappedInput,
        ...step.config,
        _stepMetadata: {
          stepId: uuidv4(),
          workflowId: this.workflowId,
          stepIndex: this.progressTracking.completedSteps,
          timestamp: new Date().toISOString(),
        },
      };

      // Execute module with progress tracking
      const result = await this.executeModuleWithProgress(
        moduleFunction,
        stepInput,
        step.module
      );

      // Validate output against contract
      const outputValidation = await this.validator.validateOutput(
        result,
        contract,
        step.module
      );

      if (!outputValidation.isValid) {
        throw new WorkflowEngineError(
          `Output validation failed for ${
            step.module
          }: ${outputValidation.errors.join(", ")}`,
          "OUTPUT_VALIDATION_FAILED",
          step.module,
          { validationErrors: outputValidation.errors }
        );
      }

      const stepEndTime = Date.now();
      const executionTime = stepEndTime - stepStartTime;

      return {
        status: "success",
        module: step.module,
        executionTime,
        result,
        metadata: {
          stepId: stepInput._stepMetadata.stepId,
          startTime: new Date(stepStartTime).toISOString(),
          endTime: new Date(stepEndTime).toISOString(),
          contractVersion: contract.version,
        },
      };
    } catch (error) {
      const stepEndTime = Date.now();
      const executionTime = stepEndTime - stepStartTime;

      return {
        status: "failed",
        module: step.module,
        executionTime,
        error: error.message,
        errorCode: error.code || "UNKNOWN_ERROR",
        metadata: {
          startTime: new Date(stepStartTime).toISOString(),
          endTime: new Date(stepEndTime).toISOString(),
        },
      };
    }
  }

  // Execute module with progress tracking
  async executeModuleWithProgress(moduleFunction, input, moduleName) {
    return new Promise((resolve, reject) => {
      // Set up progress tracking
      const progressInterval = setInterval(() => {
        // Simulate progress (real modules should emit progress events)
        this.progressTracking.currentStepProgress = Math.min(
          this.progressTracking.currentStepProgress + 10,
          90
        );
        this.updateOverallProgress();

        this.emit("step:progress", {
          module: moduleName,
          progress: this.progressTracking.currentStepProgress,
          workflowId: this.workflowId,
        });
      }, 1000);

      // Execute module
      moduleFunction(input)
        .then((result) => {
          clearInterval(progressInterval);
          this.progressTracking.currentStepProgress = 100;
          this.updateOverallProgress();
          resolve(result);
        })
        .catch((error) => {
          clearInterval(progressInterval);
          reject(error);
        });
    });
  }

  // Load module dynamically
  async loadModule(moduleName) {
    const modulePath = path.join(
      __dirname,
      "..",
      "modules",
      moduleName,
      "index.js"
    );

    if (!(await fs.pathExists(modulePath))) {
      throw new WorkflowEngineError(
        `Module file not found: ${modulePath}`,
        "MODULE_NOT_FOUND",
        moduleName
      );
    }

    try {
      const moduleExports = require(modulePath);

      // Handle different export patterns - prioritize 'execute' function
      if (
        moduleExports.execute &&
        typeof moduleExports.execute === "function"
      ) {
        return moduleExports.execute;
      } else if (typeof moduleExports === "function") {
        return moduleExports;
      } else if (
        moduleExports.default &&
        typeof moduleExports.default === "function"
      ) {
        return moduleExports.default;
      } else if (
        moduleExports[moduleName] &&
        typeof moduleExports[moduleName] === "function"
      ) {
        return moduleExports[moduleName];
      } else {
        // Try to find the main function based on module name
        const functionName = this.getMainFunctionName(moduleName);
        if (
          moduleExports[functionName] &&
          typeof moduleExports[functionName] === "function"
        ) {
          return moduleExports[functionName];
        }
      }

      throw new WorkflowEngineError(
        `No valid function found in module: ${moduleName}. Available exports: ${Object.keys(moduleExports).join(", ")}`,
        "INVALID_MODULE_EXPORT",
        moduleName
      );
    } catch (error) {
      if (error instanceof WorkflowEngineError) {
        throw error;
      }

      throw new WorkflowEngineError(
        `Failed to load module ${moduleName}: ${error.message}`,
        "MODULE_LOAD_FAILED",
        moduleName,
        { originalError: error.message }
      );
    }
  }

  // Get main function name based on module name
  getMainFunctionName(moduleName) {
    const functionNames = {
      "trend-detector": "detectTrends",
      "content-generator": "generateContent",
      "audio-synthesizer": "synthesizeAudio",
      "video-composer": "composeVideo",
      "delivery-system": "deliverContent",
    };

    return functionNames[moduleName] || moduleName;
  }

  // Process input mapping if defined
  processInputMapping(step, input) {
    if (!step.inputMapping) {
      return input;
    }

    const processMapping = (mapping, inputData) => {
      const result = {};

      // DEBUG: Log input mapping process
      console.log(
        `🔍 [DEBUG] Processing input mapping for step: ${step.module}`
      );
      console.log(
        `🔍 [DEBUG] Available input keys:`,
        Object.keys(inputData || {})
      );
      console.log(
        `🔍 [DEBUG] Input mapping:`,
        JSON.stringify(mapping, null, 2)
      );

      for (const [key, value] of Object.entries(mapping)) {
        if (
          typeof value === "object" &&
          value !== null &&
          !Array.isArray(value)
        ) {
          // Recursively process nested objects
          result[key] = processMapping(value, inputData);
        } else {
          // Resolve field value
          const resolvedValue = this.resolveFieldValue(value, inputData);
          console.log(
            `🔍 [DEBUG] Mapping "${key}" from "${value}" -> ${typeof resolvedValue === "object" ? "object" : resolvedValue}`
          );
          result[key] = resolvedValue;
        }
      }

      return result;
    };

    const mappedInput = processMapping(step.inputMapping, input);
    console.log(
      `🔍 [DEBUG] Final mapped input for ${step.module}:`,
      JSON.stringify(mappedInput, null, 2)
    );
    return mappedInput;
  }

  // Resolve field value from input using dot notation or direct value
  resolveFieldValue(fieldPath, input) {
    // Debug logging
    if (
      process.env.NODE_ENV === "test" ||
      process.env.NODE_ENV === "development"
    ) {
      console.log(
        `🔍 Resolving field: "${fieldPath}" from input with keys:`,
        Object.keys(input || {})
      );
    }

    // If it's a direct value (not a path), return it
    if (typeof fieldPath !== "string") {
      return fieldPath;
    }

    // Handle literal values prefixed with $
    if (fieldPath.startsWith("$")) {
      return fieldPath.substring(1); // Remove $ prefix and return as literal
    }

    // If it's a simple field name, get it from input
    if (!fieldPath.includes(".")) {
      const result = input[fieldPath];
      if (
        process.env.NODE_ENV === "test" ||
        process.env.NODE_ENV === "development"
      ) {
        console.log(
          `🔍 Simple field "${fieldPath}" resolved to:`,
          result !== undefined ? "found" : "undefined"
        );
      }

      // If field doesn't exist in input, treat it as a literal value
      // This allows static strings like "openai", "alloy", etc. to work
      if (result === undefined) {
        if (
          process.env.NODE_ENV === "test" ||
          process.env.NODE_ENV === "development"
        ) {
          console.log(
            `🔍 Field "${fieldPath}" not found in input, treating as literal value`
          );
        }
        return fieldPath;
      }

      return result;
    }

    // Handle dot notation (e.g., "advanced.trendSources")
    const parts = fieldPath.split(".");
    let current = input;

    for (const part of parts) {
      if (current && typeof current === "object" && part in current) {
        current = current[part];
      } else {
        if (
          process.env.NODE_ENV === "test" ||
          process.env.NODE_ENV === "development"
        ) {
          console.log(
            `🔍 Dot notation failed at part "${part}" in path "${fieldPath}"`
          );
        }
        return undefined;
      }
    }

    return current;
  }

  // Prepare input for next step
  prepareNextStepInput(currentStep, stepResult, originalInput) {
    // Debug logging
    if (
      process.env.NODE_ENV === "test" ||
      process.env.NODE_ENV === "development"
    ) {
      console.log(
        `🔍 Preparing next step input for step: ${currentStep.module}`
      );
      console.log(`🔍 stepResult status:`, stepResult?.status);
      console.log(
        `🔍 stepResult.result keys:`,
        Object.keys(stepResult?.result || {})
      );
      console.log(
        `🔍 currentStep.outputMapping:`,
        currentStep.outputMapping ? "exists" : "none"
      );
    }

    // Start with original input as base
    let nextInput = { ...originalInput };

    // If step has outputMapping, use it to extract specific fields
    if (currentStep.outputMapping) {
      for (const [targetField, sourcePath] of Object.entries(
        currentStep.outputMapping
      )) {
        const value = this.resolveFieldValue(sourcePath, stepResult.result);
        if (value !== undefined) {
          nextInput[targetField] = value;
        }
      }
    } else {
      // Default behavior: add the entire result with a module-specific key
      const resultKey = currentStep.module.replace("-", "_") + "_result";
      nextInput[resultKey] = stepResult.result;
    }

    if (
      process.env.NODE_ENV === "test" ||
      process.env.NODE_ENV === "development"
    ) {
      console.log(`🔍 Next input keys:`, Object.keys(nextInput));
    }

    return nextInput;
  }

  // Validate workflow definition
  async validateWorkflowDefinition(workflowDefinition) {
    if (!workflowDefinition || !workflowDefinition.steps) {
      throw new WorkflowEngineError(
        "Invalid workflow definition: missing steps",
        "INVALID_WORKFLOW_DEFINITION"
      );
    }

    if (
      !Array.isArray(workflowDefinition.steps) ||
      workflowDefinition.steps.length === 0
    ) {
      throw new WorkflowEngineError(
        "Invalid workflow definition: steps must be a non-empty array",
        "INVALID_WORKFLOW_DEFINITION"
      );
    }

    // Validate each step
    for (let i = 0; i < workflowDefinition.steps.length; i++) {
      const step = workflowDefinition.steps[i];

      if (!step.module) {
        throw new WorkflowEngineError(
          `Step ${i} missing required 'module' field`,
          "INVALID_STEP_DEFINITION",
          null,
          { stepIndex: i }
        );
      }

      // Check if contract exists for module
      const contract = await this.contractRegistry.getContract(step.module);
      if (!contract) {
        throw new WorkflowEngineError(
          `Contract not found for module: ${step.module}`,
          "CONTRACT_NOT_FOUND",
          step.module,
          { stepIndex: i }
        );
      }
    }

    logger.info(
      `Workflow definition validated: ${workflowDefinition.steps.length} steps`
    );
  }

  // Update overall progress
  updateOverallProgress() {
    if (this.progressTracking.totalSteps === 0) {
      this.progressTracking.overallProgress = 0;
      return;
    }

    const completedProgress =
      (this.progressTracking.completedSteps /
        this.progressTracking.totalSteps) *
      100;
    const currentStepProgress =
      this.progressTracking.currentStepProgress /
      this.progressTracking.totalSteps;

    this.progressTracking.overallProgress = Math.min(
      completedProgress + currentStepProgress,
      100
    );

    this.emit("workflow:progress", {
      workflowId: this.workflowId,
      overallProgress: this.progressTracking.overallProgress,
      completedSteps: this.progressTracking.completedSteps,
      totalSteps: this.progressTracking.totalSteps,
      currentStep: this.currentStep?.module,
      currentStepProgress: this.progressTracking.currentStepProgress,
    });
  }

  // Generate final workflow result
  async generateWorkflowResult(
    workflowDefinition,
    executionResults,
    initialInput
  ) {
    const endTime = Date.now();
    const totalExecutionTime = endTime - this.startTime;

    const successfulSteps = executionResults.filter(
      (r) => r.status === "success"
    ).length;
    const failedSteps = executionResults.filter(
      (r) => r.status === "failed"
    ).length;

    // Get final output (usually from last successful step)
    const lastSuccessfulResult = executionResults
      .slice()
      .reverse()
      .find((r) => r.status === "success");

    const finalOutput = lastSuccessfulResult?.result || null;

    return {
      workflowId: this.workflowId,
      status: failedSteps === 0 ? "success" : "partial",
      execution: {
        startTime: new Date(this.startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
        totalExecutionTime,
        totalSteps: workflowDefinition.steps.length,
        successfulSteps,
        failedSteps,
      },
      steps: executionResults,
      output: finalOutput,
      metadata: {
        workflowDefinition,
        initialInput,
        stepResults: Object.fromEntries(this.stepResults),
        progressTracking: this.progressTracking,
      },
    };
  }

  // Get workflow status
  getStatus() {
    return {
      workflowId: this.workflowId,
      state: this.workflowState,
      currentStep: this.currentStep?.module,
      progress: this.progressTracking,
      startTime: new Date(this.startTime).toISOString(),
    };
  }

  // Alias for executeWorkflow to maintain compatibility
  async execute(workflowDefinition, initialInput = {}) {
    return this.executeWorkflow(workflowDefinition, initialInput);
  }
}

// Export the workflow engine
module.exports = WorkflowEngine;
