// Contract Registry - Manages all module contracts
// Dynamically loads and validates contracts from all modules

const fs = require("fs-extra");
const path = require("path");

// Simple logger to avoid winston issues
const logger = {
  info: (msg, meta) => {
    if (process.env.NODE_ENV !== "test") {
      console.log(`[INFO] ${msg}`, meta ? JSON.stringify(meta) : "");
    }
  },
  warn: (msg, meta) => {
    if (process.env.NODE_ENV !== "test") {
      console.warn(`[WARN] ${msg}`, meta ? JSON.stringify(meta) : "");
    }
  },
  error: (msg, meta) => {
    console.error(`[ERROR] ${msg}`, meta ? JSON.stringify(meta) : "");
  },
  debug: (msg, meta) => {
    if (process.env.DEBUG) {
      console.log(`[DEBUG] ${msg}`, meta ? JSON.stringify(meta) : "");
    }
  },
};

// Custom error class
class ContractRegistryError extends Error {
  constructor(message, code, module = null, details = null) {
    super(message);
    this.name = "ContractRegistryError";
    this.code = code;
    this.module = module;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
}

// Contract Registry class
class ContractRegistry {
  constructor() {
    this.contracts = new Map();
    this.lastScanTime = null;
    this.autoScanInterval = null;
    this.modulesPath = path.join(__dirname, "..", "modules");
  }

  // Initialize registry and scan for contracts
  async initialize(options = {}) {
    const { autoScan = false, silent = false } = options;

    if (!silent) {
      logger.info("Initializing Contract Registry...");
    }

    try {
      await this.scanForContracts(silent);

      if (autoScan) {
        this.startAutoScan();
      }

      if (!silent) {
        logger.info(
          `Contract Registry initialized with ${this.contracts.size} contracts`
        );
      }
    } catch (error) {
      logger.error("Failed to initialize Contract Registry:", error);
      throw new ContractRegistryError(
        `Registry initialization failed: ${error.message}`,
        "INITIALIZATION_FAILED",
        null,
        { originalError: error.message }
      );
    }
  }

  // Scan modules directory for contracts
  async scanForContracts(silent = false) {
    if (!silent) {
      logger.info("Scanning for module contracts...");
    }

    if (!(await fs.pathExists(this.modulesPath))) {
      throw new ContractRegistryError(
        `Modules directory not found: ${this.modulesPath}`,
        "MODULES_DIRECTORY_NOT_FOUND"
      );
    }

    const moduleDirectories = await fs.readdir(this.modulesPath);
    const contractsFound = [];

    for (const moduleDir of moduleDirectories) {
      const modulePath = path.join(this.modulesPath, moduleDir);
      const stat = await fs.stat(modulePath);

      if (stat.isDirectory()) {
        try {
          const contract = await this.loadModuleContract(
            moduleDir,
            modulePath,
            silent
          );
          if (contract) {
            this.contracts.set(moduleDir, contract);
            contractsFound.push(moduleDir);
            if (!silent) {
              logger.info(
                `Loaded contract for module: ${moduleDir} v${contract.version}`
              );
            }
          }
        } catch (error) {
          if (!silent) {
            logger.warn(
              `Failed to load contract for module ${moduleDir}:`,
              error.message
            );
          }
        }
      }
    }

    this.lastScanTime = new Date();
    if (!silent) {
      logger.info(
        `Contract scan completed. Found ${
          contractsFound.length
        } contracts: ${contractsFound.join(", ")}`
      );
    }

    return contractsFound;
  }

  // Load contract for a specific module
  async loadModuleContract(moduleName, modulePath, silent = false) {
    // Try to load JavaScript contract first (preferred)
    const jsContractPath = path.join(modulePath, "contract.js");
    if (await fs.pathExists(jsContractPath)) {
      try {
        delete require.cache[require.resolve(jsContractPath)]; // Clear cache
        const contractModule = require(jsContractPath);

        // Handle different export patterns
        let contract = null;
        if (contractModule.CONTRACT_METADATA) {
          contract = contractModule.CONTRACT_METADATA;
        } else if (contractModule.contract) {
          contract = contractModule.contract;
        } else if (contractModule.default) {
          contract = contractModule.default;
        } else if (typeof contractModule === "object" && contractModule.name) {
          contract = contractModule;
        }

        if (contract) {
          contract._source = "javascript";
          contract._path = jsContractPath;
          contract._loadedAt = new Date().toISOString();

          await this.validateContract(contract, moduleName);
          return contract;
        }
      } catch (error) {
        if (!silent) {
          logger.warn(
            `Failed to load JS contract for ${moduleName}:`,
            error.message
          );
        }
      }
    }

    // Try to load TypeScript contract as fallback
    const tsContractPath = path.join(modulePath, "contract.ts");
    if (await fs.pathExists(tsContractPath)) {
      try {
        // For TypeScript contracts, we'll parse them as text and extract metadata
        const tsContent = await fs.readFile(tsContractPath, "utf8");
        const contract = await this.parseTypeScriptContract(
          tsContent,
          moduleName
        );

        if (contract) {
          contract._source = "typescript";
          contract._path = tsContractPath;
          contract._loadedAt = new Date().toISOString();

          await this.validateContract(contract, moduleName);
          return contract;
        }
      } catch (error) {
        if (!silent) {
          logger.warn(
            `Failed to load TS contract for ${moduleName}:`,
            error.message
          );
        }
      }
    }

    throw new ContractRegistryError(
      `No valid contract found for module: ${moduleName}`,
      "CONTRACT_NOT_FOUND",
      moduleName
    );
  }

  // Parse TypeScript contract file
  async parseTypeScriptContract(tsContent, moduleName) {
    try {
      // Extract CONTRACT_METADATA export
      const metadataMatch = tsContent.match(
        /export\s+const\s+CONTRACT_METADATA\s*=\s*({[\s\S]*?});/
      );

      if (metadataMatch) {
        // This is a simplified parser - in production you might want to use a proper TS parser
        const metadataString = metadataMatch[1];

        // Basic parsing for simple object literals
        const contract = this.parseObjectLiteral(metadataString);

        if (contract) {
          return contract;
        }
      }

      // If no CONTRACT_METADATA found, try to extract basic info
      const nameMatch = tsContent.match(/name:\s*["']([^"']+)["']/);
      const versionMatch = tsContent.match(/version:\s*["']([^"']+)["']/);
      const descriptionMatch = tsContent.match(
        /description:\s*["']([^"']+)["']/
      );

      if (nameMatch && versionMatch) {
        return {
          name: nameMatch[1],
          version: versionMatch[1],
          description: descriptionMatch
            ? descriptionMatch[1]
            : `Contract for ${moduleName}`,
          _parsed: true,
        };
      }

      return null;
    } catch (error) {
      throw new ContractRegistryError(
        `Failed to parse TypeScript contract for ${moduleName}: ${error.message}`,
        "CONTRACT_PARSE_FAILED",
        moduleName
      );
    }
  }

  // Simple object literal parser (basic implementation)
  parseObjectLiteral(objString) {
    try {
      // This is a very basic parser - replace with proper parser in production
      // For now, we'll try to use eval in a safe context
      const safeEval = new Function(`"use strict"; return (${objString})`);
      return safeEval();
    } catch (error) {
      logger.warn("Failed to parse object literal:", error.message);
      return null;
    }
  }

  // Validate contract structure
  async validateContract(contract, moduleName) {
    const requiredFields = ["name", "version", "description"];

    for (const field of requiredFields) {
      if (!contract[field]) {
        throw new ContractRegistryError(
          `Contract for ${moduleName} missing required field: ${field}`,
          "INVALID_CONTRACT",
          moduleName,
          { missingField: field }
        );
      }
    }

    // Validate name matches module name
    if (contract.name !== moduleName) {
      logger.warn(
        `Contract name "${contract.name}" doesn't match module name "${moduleName}"`
      );
    }

    // Validate version format (basic semver check)
    if (!/^\d+\.\d+\.\d+/.test(contract.version)) {
      throw new ContractRegistryError(
        `Invalid version format in contract for ${moduleName}: ${contract.version}`,
        "INVALID_VERSION",
        moduleName
      );
    }

    logger.debug(`Contract validation passed for ${moduleName}`);
  }

  // Get contract for a specific module
  async getContract(moduleName) {
    if (!this.contracts.has(moduleName)) {
      // Try to load contract on-demand
      try {
        const modulePath = path.join(this.modulesPath, moduleName);
        if (await fs.pathExists(modulePath)) {
          const contract = await this.loadModuleContract(
            moduleName,
            modulePath
          );
          if (contract) {
            this.contracts.set(moduleName, contract);
            return contract;
          }
        }
      } catch (error) {
        logger.error(`Failed to load contract for ${moduleName}:`, error);
      }

      return null;
    }

    return this.contracts.get(moduleName);
  }

  // Get all contracts
  getAllContracts() {
    return Array.from(this.contracts.values());
  }

  // Get contract summary
  getContractSummary(moduleName) {
    const contract = this.contracts.get(moduleName);
    if (!contract) return null;

    return {
      name: contract.name,
      version: contract.version,
      description: contract.description,
      source: contract._source,
      loadedAt: contract._loadedAt,
      hasInputSchema: !!(contract.inputSchema || contract.input),
      hasOutputSchema: !!(contract.outputSchema || contract.output),
      dependencies: contract.dependencies || [],
    };
  }

  // Get registry status
  getStatus() {
    const contracts = Array.from(this.contracts.entries()).map(
      ([name, contract]) => ({
        name,
        version: contract.version,
        source: contract._source,
        loadedAt: contract._loadedAt,
      })
    );

    return {
      totalContracts: this.contracts.size,
      lastScanTime: this.lastScanTime,
      contracts,
      autoScanEnabled: !!this.autoScanInterval,
    };
  }

  // Start automatic scanning for contract changes
  startAutoScan(intervalMs = 30000) {
    // 30 seconds default
    if (this.autoScanInterval) {
      clearInterval(this.autoScanInterval);
    }

    this.autoScanInterval = setInterval(async () => {
      try {
        logger.debug("Auto-scanning for contract changes...");
        await this.scanForContracts();
      } catch (error) {
        logger.error("Auto-scan failed:", error);
      }
    }, intervalMs);

    logger.info(`Auto-scan started with ${intervalMs}ms interval`);
  }

  // Stop automatic scanning
  stopAutoScan() {
    if (this.autoScanInterval) {
      clearInterval(this.autoScanInterval);
      this.autoScanInterval = null;
      logger.info("Auto-scan stopped");
    }
  }

  // Reload specific contract
  async reloadContract(moduleName) {
    logger.info(`Reloading contract for module: ${moduleName}`);

    const modulePath = path.join(this.modulesPath, moduleName);
    if (!(await fs.pathExists(modulePath))) {
      throw new ContractRegistryError(
        `Module directory not found: ${modulePath}`,
        "MODULE_NOT_FOUND",
        moduleName
      );
    }

    try {
      const contract = await this.loadModuleContract(moduleName, modulePath);
      if (contract) {
        this.contracts.set(moduleName, contract);
        logger.info(
          `Contract reloaded for module: ${moduleName} v${contract.version}`
        );
        return contract;
      }
    } catch (error) {
      throw new ContractRegistryError(
        `Failed to reload contract for ${moduleName}: ${error.message}`,
        "CONTRACT_RELOAD_FAILED",
        moduleName,
        { originalError: error.message }
      );
    }
  }

  // Validate compatibility between modules
  async validateModuleCompatibility(sourceModule, targetModule) {
    const sourceContract = await this.getContract(sourceModule);
    const targetContract = await this.getContract(targetModule);

    if (!sourceContract || !targetContract) {
      throw new ContractRegistryError(
        `Cannot validate compatibility: missing contracts for ${sourceModule} or ${targetModule}`,
        "MISSING_CONTRACTS_FOR_COMPATIBILITY"
      );
    }

    // Basic compatibility check (can be extended)
    const compatibility = {
      compatible: true,
      issues: [],
      warnings: [],
    };

    // Check if source output matches target input (simplified)
    if (sourceContract.outputSchema && targetContract.inputSchema) {
      // This would need proper schema validation in production
      logger.debug(
        `Checking compatibility between ${sourceModule} output and ${targetModule} input`
      );
    }

    return compatibility;
  }

  // Cleanup
  destroy() {
    this.stopAutoScan();
    this.contracts.clear();
    logger.info("Contract Registry destroyed");
  }
}

// Export the contract registry
module.exports = ContractRegistry;
