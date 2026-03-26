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
  n: number;
  results: SearchResult[];
}

export interface StepFunConfig {
  apiKey: string;
  apiHost: string;
}

/**
 * Supported search scenario categories
 */
export type SearchCategory = 'programming' | 'research' | 'gov' | 'business';
