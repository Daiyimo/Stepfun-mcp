/**
 * StepFun API Client
 * Handles all HTTP requests to the StepFun API
 */

import { StepFunAuthError, StepFunRequestError } from './errors.js';

export class StepFunAPIClient {
  private apiKey: string;
  private apiHost: string;

  constructor(config: { apiKey: string; apiHost: string }) {
    this.apiKey = config.apiKey;
    // Remove trailing slash from API host if present
    this.apiHost = config.apiHost.replace(/\/$/, '');
  }

  /**
   * Make a POST request to the StepFun API
   */
  async post(endpoint: string, body: unknown): Promise<any> {
    const url = `${this.apiHost}${endpoint}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new StepFunAuthError(`Authentication failed: ${response.statusText}`);
        }
        throw new StepFunRequestError(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json() as any;

      // Check for API error in response
      if (data.error) {
        const errorInfo = data.error;
        throw new StepFunRequestError(`API Error [${errorInfo.type}]: ${errorInfo.message}`);
      }

      return data;
    } catch (error) {
      if (error instanceof StepFunAuthError || error instanceof StepFunRequestError) {
        throw error;
      }
      throw new StepFunRequestError(`Request failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Make a GET request to the StepFun API (for future use)
   */
  async get(endpoint: string): Promise<any> {
    const url = `${this.apiHost}${endpoint}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new StepFunAuthError(`Authentication failed: ${response.statusText}`);
        }
        throw new StepFunRequestError(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json() as any;

      if (data.error) {
        const errorInfo = data.error;
        throw new StepFunRequestError(`API Error [${errorInfo.type}]: ${errorInfo.message}`);
      }

      return data;
    } catch (error) {
      if (error instanceof StepFunAuthError || error instanceof StepFunRequestError) {
        throw error;
      }
      throw new StepFunRequestError(`Request failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
