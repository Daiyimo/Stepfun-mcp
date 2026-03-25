/**
 * Custom exceptions for StepFun MCP
 */

export class StepFunAPIError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StepFunAPIError";
  }
}

export class StepFunAuthError extends StepFunAPIError {
  constructor(message: string) {
    super(message);
    this.name = "StepFunAuthError";
  }
}

export class StepFunRequestError extends StepFunAPIError {
  constructor(message: string) {
    super(message);
    this.name = "StepFunRequestError";
  }
}

export class StepFunTimeoutError extends StepFunAPIError {
  constructor(message: string) {
    super(message);
    this.name = "StepFunTimeoutError";
  }
}

export class StepFunValidationError extends StepFunAPIError {
  constructor(message: string) {
    super(message);
    this.name = "StepFunValidationError";
  }
}

export class StepFunMcpError extends StepFunAPIError {
  constructor(message: string) {
    super(message);
    this.name = "StepFunMcpError";
  }
}
