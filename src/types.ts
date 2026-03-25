/**
 * Type definitions for StepFun API responses
 */

export interface SearchResult {
  url: string;
  position: number;
  title: string;
  time: string; // ISO date string
  snippet: string;
  content: string;
}

export interface SearchResponse {
  query: string;
  category: string;
  results: SearchResult[];
}

export interface StepFunConfig {
  apiKey: string;
  apiHost: string;
}
