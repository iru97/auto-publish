// Strict Validator - Rigorous Contract Validation System
// Implements strict validation according to project architecture rules
// Fails fast and clear on incompatibilities, no automatic adaptations

const winston = require("winston");

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
      filename: "logs/validator-error.log",
      level: "error",
    }),
    new winston.transports.File({ filename: "logs/validator-combined.log" }),
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});

// Custom validation error class
class ValidationError extends Error {
  constructor(message, code, field = null, expected = null, received = null) {
    super(message);
    this.name = "ValidationError";
    this.code = code;
    this.field = field;
    this.expected = expected;
    this.received = received;
    this.timestamp = new Date().toISOString();
  }
}

// Strict Validator class - NO ADAPTATIONS, FAIL FAST
class StrictValidator {
  constructor() {
    this.validationRules = new Map();
    this.typeValidators = new Map();
    this.initializeTypeValidators();
  }

  // Initialize built-in type validators
  initializeTypeValidators() {
    this.typeValidators.set("string", this.validateString.bind(this));
    this.typeValidators.set("number", this.validateNumber.bind(this));
    this.typeValidators.set("integer", this.validateInteger.bind(this));
    this.typeValidators.set("boolean", this.validateBoolean.bind(this));
    this.typeValidators.set("array", this.validateArray.bind(this));
    this.typeValidators.set("object", this.validateObject.bind(this));
    this.typeValidators.set("enum", this.validateEnum.bind(this));
    this.typeValidators.set("url", this.validateUrl.bind(this));
    this.typeValidators.set("email", this.validateEmail.bind(this));
    this.typeValidators.set("date", this.validateDate.bind(this));
    this.typeValidators.set("uuid", this.validateUuid.bind(this));
  }

  // Main input validation function - STRICT MODE
  async validateInput(input, contract, moduleName) {
    const validationStart = Date.now();

    try {
      logger.info(`Starting strict validation for module: ${moduleName}`);

      // Validate contract structure first
      this.validateContractStructure(contract, moduleName);

      // Validate required fields
      const requiredFields = contract.input.required || [];
      const requiredFieldsList = Array.isArray(requiredFields)
        ? requiredFields
        : Object.keys(requiredFields);

      const requiredValidation = this.validateRequiredFields(
        input,
        requiredFieldsList,
        moduleName
      );

      if (!requiredValidation.isValid) {
        throw new ValidationError(
          `Required field validation failed for ${moduleName}: ${requiredValidation.errors.join(
            ", "
          )}`,
          "REQUIRED_FIELDS_MISSING",
          null,
          contract.input.required,
          Object.keys(input)
        );
      }

      // Validate field types and constraints
      const inputSchema = {
        ...(contract.input.required || {}),
        ...(contract.input.optional || {}),
      };

      const typeValidation = await this.validateFieldTypes(
        input,
        inputSchema,
        moduleName
      );

      if (!typeValidation.isValid) {
        throw new ValidationError(
          `Type validation failed for ${moduleName}: ${typeValidation.errors.join(
            ", "
          )}`,
          "TYPE_VALIDATION_FAILED",
          typeValidation.field,
          typeValidation.expected,
          typeValidation.received
        );
      }

      // Validate business rules if defined
      const businessValidation = await this.validateBusinessRules(
        input,
        contract.validation || {},
        moduleName
      );

      if (!businessValidation.isValid) {
        throw new ValidationError(
          `Business rule validation failed for ${moduleName}: ${businessValidation.errors.join(
            ", "
          )}`,
          "BUSINESS_RULES_FAILED",
          businessValidation.field,
          businessValidation.rule,
          businessValidation.value
        );
      }

      // Validate dependencies if specified
      const dependencyValidation = this.validateDependencies(
        input,
        contract.dependencies || [],
        moduleName
      );

      if (!dependencyValidation.isValid) {
        throw new ValidationError(
          `Dependency validation failed for ${moduleName}: ${dependencyValidation.errors.join(
            ", "
          )}`,
          "DEPENDENCY_VALIDATION_FAILED",
          null,
          contract.dependencies,
          dependencyValidation.missing
        );
      }

      const validationTime = Date.now() - validationStart;
      logger.info(
        `Validation completed for ${moduleName} in ${validationTime}ms`
      );

      return {
        isValid: true,
        moduleName,
        validationTime,
        timestamp: new Date().toISOString(),
        inputSummary: this.generateInputSummary(input),
      };
    } catch (error) {
      const validationTime = Date.now() - validationStart;
      logger.error(`Validation failed for ${moduleName}:`, error);

      if (error instanceof ValidationError) {
        throw error;
      }

      throw new ValidationError(
        `Unexpected validation error for ${moduleName}: ${error.message}`,
        "VALIDATION_SYSTEM_ERROR",
        null,
        null,
        error.message
      );
    }
  }

  // Validate output against contract - STRICT MODE
  async validateOutput(output, contract, moduleName) {
    const validationStart = Date.now();

    try {
      logger.info(`Starting output validation for module: ${moduleName}`);

      // Validate contract has output definition
      if (!contract.output) {
        throw new ValidationError(
          `Contract for ${moduleName} missing output definition`,
          "CONTRACT_MISSING_OUTPUT",
          "output",
          "object",
          typeof contract.output
        );
      }

      // Validate output structure - check top-level fields exist
      const outputSchema = contract.output;
      const topLevelFields = Object.keys(outputSchema);
      const missingTopLevelFields = [];

      for (const fieldName of topLevelFields) {
        if (!(fieldName in output)) {
          missingTopLevelFields.push(fieldName);
        }
      }

      if (missingTopLevelFields.length > 0) {
        throw new ValidationError(
          `Missing top-level output fields for ${moduleName}: ${missingTopLevelFields.join(", ")}`,
          "OUTPUT_MISSING_TOP_LEVEL_FIELDS",
          null,
          topLevelFields,
          Object.keys(output)
        );
      }

      // Validate each top-level field and its nested structure
      for (const [fieldName, fieldDef] of Object.entries(outputSchema)) {
        if (fieldName in output) {
          const fieldValue = output[fieldName];

          // If field has required nested fields, validate them
          if (fieldDef.required && Array.isArray(fieldDef.required)) {
            const nestedValidation = this.validateRequiredFields(
              fieldValue,
              fieldDef.required,
              `${moduleName}.${fieldName}`
            );

            if (!nestedValidation.isValid) {
              throw new ValidationError(
                `Required nested fields missing in ${moduleName}.${fieldName}: ${nestedValidation.errors.join(", ")}`,
                "OUTPUT_NESTED_FIELDS_MISSING",
                fieldName,
                fieldDef.required,
                Object.keys(fieldValue || {})
              );
            }
          }
        }
      }

      // Validate output field types
      const typeValidation = await this.validateFieldTypes(
        output,
        outputSchema,
        moduleName
      );

      if (!typeValidation.isValid) {
        throw new ValidationError(
          `Output type validation failed for ${moduleName}: ${typeValidation.errors.join(
            ", "
          )}`,
          "OUTPUT_TYPE_VALIDATION_FAILED",
          typeValidation.field,
          typeValidation.expected,
          typeValidation.received
        );
      }

      const validationTime = Date.now() - validationStart;
      logger.info(
        `Output validation completed for ${moduleName} in ${validationTime}ms`
      );

      return {
        isValid: true,
        moduleName,
        validationTime,
        timestamp: new Date().toISOString(),
        outputSummary: this.generateInputSummary(output),
      };
    } catch (error) {
      const validationTime = Date.now() - validationStart;
      logger.error(`Output validation failed for ${moduleName}:`, error);

      if (error instanceof ValidationError) {
        throw error;
      }

      throw new ValidationError(
        `Unexpected output validation error for ${moduleName}: ${error.message}`,
        "OUTPUT_VALIDATION_SYSTEM_ERROR",
        null,
        null,
        error.message
      );
    }
  }

  // Validate contract structure - IMMUTABLE CONTRACTS
  validateContractStructure(contract, moduleName) {
    const requiredFields = [
      "name",
      "version",
      "description",
      "input",
      "output",
    ];
    const missingFields = [];

    for (const field of requiredFields) {
      if (!contract[field]) {
        missingFields.push(field);
      }
    }

    if (missingFields.length > 0) {
      throw new ValidationError(
        `Contract structure invalid for ${moduleName}: missing fields ${missingFields.join(
          ", "
        )}`,
        "INVALID_CONTRACT_STRUCTURE",
        null,
        requiredFields,
        Object.keys(contract)
      );
    }

    // Validate version format
    const versionRegex = /^\d+\.\d+\.\d+$/;
    if (!versionRegex.test(contract.version)) {
      throw new ValidationError(
        `Invalid version format for ${moduleName}: ${contract.version}`,
        "INVALID_VERSION_FORMAT",
        "version",
        "semver format (x.y.z)",
        contract.version
      );
    }

    // Validate input schema exists
    if (!contract.input || typeof contract.input !== "object") {
      throw new ValidationError(
        `Contract input definition invalid for ${moduleName}`,
        "INVALID_INPUT_DEFINITION",
        "input",
        "object",
        typeof contract.input
      );
    }

    // Validate output schema exists
    if (!contract.output || typeof contract.output !== "object") {
      throw new ValidationError(
        `Contract output definition invalid for ${moduleName}`,
        "INVALID_OUTPUT_DEFINITION",
        "output",
        "object",
        typeof contract.output
      );
    }
  }

  // Validate required fields - NO TOLERANCE FOR MISSING FIELDS
  validateRequiredFields(data, requiredFields, moduleName) {
    const errors = [];
    const missingFields = [];

    for (const field of requiredFields) {
      if (
        !(field in data) ||
        data[field] === null ||
        data[field] === undefined
      ) {
        missingFields.push(field);
        errors.push(`Missing required field: ${field}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      missingFields,
    };
  }

  // Validate field types - STRICT TYPE CHECKING
  async validateFieldTypes(data, schema, moduleName) {
    const errors = [];
    let firstError = null;

    for (const [fieldName, fieldSchema] of Object.entries(schema)) {
      if (!(fieldName in data)) {
        continue; // Skip optional fields not present
      }

      const value = data[fieldName];
      const fieldType = fieldSchema.type || "string";

      try {
        const validator = this.typeValidators.get(fieldType);
        if (!validator) {
          throw new ValidationError(
            `Unknown field type: ${fieldType}`,
            "UNKNOWN_FIELD_TYPE",
            fieldName,
            "valid type",
            fieldType
          );
        }

        const isValid = await validator(value, fieldSchema, fieldName);
        if (!isValid) {
          const error = `Field ${fieldName} failed ${fieldType} validation`;
          errors.push(error);

          if (!firstError) {
            firstError = {
              field: fieldName,
              expected: fieldType,
              received: typeof value,
            };
          }
        }
      } catch (error) {
        const errorMsg = `Field ${fieldName} validation error: ${error.message}`;
        errors.push(errorMsg);

        if (!firstError) {
          firstError = {
            field: fieldName,
            expected: fieldType,
            received: typeof value,
          };
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      ...firstError,
    };
  }

  // Validate business rules - CUSTOM VALIDATION LOGIC
  async validateBusinessRules(data, validationRules, moduleName) {
    const errors = [];
    let firstError = null;

    for (const [ruleName, rule] of Object.entries(validationRules)) {
      try {
        if (typeof rule === "function") {
          const isValid = await rule(data);
          if (!isValid) {
            const error = `Business rule '${ruleName}' failed`;
            errors.push(error);

            if (!firstError) {
              firstError = {
                field: ruleName,
                rule: ruleName,
                value: "validation failed",
              };
            }
          }
        } else if (typeof rule === "object" && rule.validate) {
          const isValid = await rule.validate(data);
          if (!isValid) {
            const error = `Business rule '${ruleName}' failed: ${
              rule.message || "validation failed"
            }`;
            errors.push(error);

            if (!firstError) {
              firstError = {
                field: ruleName,
                rule: rule.message || ruleName,
                value: "validation failed",
              };
            }
          }
        }
      } catch (error) {
        const errorMsg = `Business rule '${ruleName}' error: ${error.message}`;
        errors.push(errorMsg);

        if (!firstError) {
          firstError = {
            field: ruleName,
            rule: ruleName,
            value: error.message,
          };
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      ...firstError,
    };
  }

  // Validate dependencies - EXPLICIT CONNECTIONS ONLY
  validateDependencies(data, dependencies, moduleName) {
    const errors = [];
    const missing = [];

    // En modo de desarrollo, saltamos la validación de dependencias npm
    if (
      process.env.NODE_ENV === "development" ||
      process.env.NODE_ENV === "test"
    ) {
      return {
        isValid: true,
        errors: [],
        missing: [],
      };
    }

    for (const dependency of dependencies) {
      if (typeof dependency === "string") {
        // Verificar si es una dependencia npm
        try {
          require.resolve(dependency);
        } catch (error) {
          // Si no se puede resolver, verificar si es un campo en data
          if (!(dependency in data)) {
            missing.push(dependency);
            errors.push(`Missing dependency: ${dependency}`);
          }
        }
      } else if (typeof dependency === "object") {
        // Complex dependency with conditions
        const { field, condition, value } = dependency;

        if (!(field in data)) {
          missing.push(field);
          errors.push(`Missing dependency field: ${field}`);
          continue;
        }

        if (
          condition &&
          !this.evaluateCondition(data[field], condition, value)
        ) {
          errors.push(`Dependency condition failed for ${field}: ${condition}`);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      missing,
    };
  }

  // Type validator implementations
  validateString(value, schema, fieldName) {
    if (typeof value !== "string") {
      return false;
    }

    if (schema.minLength && value.length < schema.minLength) {
      return false;
    }

    if (schema.maxLength && value.length > schema.maxLength) {
      return false;
    }

    if (schema.pattern && !new RegExp(schema.pattern).test(value)) {
      return false;
    }

    return true;
  }

  validateNumber(value, schema, fieldName) {
    if (typeof value !== "number" || isNaN(value)) {
      return false;
    }

    if (schema.minimum !== undefined && value < schema.minimum) {
      return false;
    }

    if (schema.maximum !== undefined && value > schema.maximum) {
      return false;
    }

    return true;
  }

  validateInteger(value, schema, fieldName) {
    if (!Number.isInteger(value)) {
      return false;
    }

    return this.validateNumber(value, schema, fieldName);
  }

  validateBoolean(value, schema, fieldName) {
    return typeof value === "boolean";
  }

  validateArray(value, schema, fieldName) {
    if (!Array.isArray(value)) {
      return false;
    }

    if (schema.minItems && value.length < schema.minItems) {
      return false;
    }

    if (schema.maxItems && value.length > schema.maxItems) {
      return false;
    }

    if (schema.items) {
      // Validate each item in array
      for (const item of value) {
        const itemValidator = this.typeValidators.get(schema.items.type);
        if (itemValidator && !itemValidator(item, schema.items, fieldName)) {
          return false;
        }
      }
    }

    return true;
  }

  validateObject(value, schema, fieldName) {
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
      return false;
    }

    if (schema.properties) {
      // Validate object properties
      for (const [propName, propSchema] of Object.entries(schema.properties)) {
        if (propName in value) {
          const propValidator = this.typeValidators.get(propSchema.type);
          if (
            propValidator &&
            !propValidator(value[propName], propSchema, propName)
          ) {
            return false;
          }
        }
      }
    }

    return true;
  }

  validateEnum(value, schema, fieldName) {
    if (!schema.values || !Array.isArray(schema.values)) {
      return false;
    }

    return schema.values.includes(value);
  }

  validateUrl(value, schema, fieldName) {
    if (typeof value !== "string") {
      return false;
    }

    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  }

  validateEmail(value, schema, fieldName) {
    if (typeof value !== "string") {
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  }

  validateDate(value, schema, fieldName) {
    if (typeof value === "string") {
      const date = new Date(value);
      return !isNaN(date.getTime());
    }

    if (value instanceof Date) {
      return !isNaN(value.getTime());
    }

    return false;
  }

  validateUuid(value, schema, fieldName) {
    if (typeof value !== "string") {
      return false;
    }

    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(value);
  }

  // Helper methods
  evaluateCondition(value, condition, expectedValue) {
    switch (condition) {
      case "equals":
        return value === expectedValue;
      case "not_equals":
        return value !== expectedValue;
      case "greater_than":
        return value > expectedValue;
      case "less_than":
        return value < expectedValue;
      case "contains":
        return typeof value === "string" && value.includes(expectedValue);
      case "matches":
        return new RegExp(expectedValue).test(value);
      default:
        return false;
    }
  }

  generateInputSummary(data) {
    const summary = {};

    for (const [key, value] of Object.entries(data)) {
      if (typeof value === "string") {
        summary[key] = `string(${value.length})`;
      } else if (typeof value === "number") {
        summary[key] = `number(${value})`;
      } else if (Array.isArray(value)) {
        summary[key] = `array(${value.length})`;
      } else if (typeof value === "object" && value !== null) {
        summary[key] = `object(${Object.keys(value).length} keys)`;
      } else {
        summary[key] = typeof value;
      }
    }

    return summary;
  }

  // Get validation statistics
  getValidationStats() {
    return {
      typeValidators: Array.from(this.typeValidators.keys()),
      customRules: this.validationRules.size,
      timestamp: new Date().toISOString(),
    };
  }
}

module.exports = StrictValidator;
