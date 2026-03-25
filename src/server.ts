/**
 * MCP Server implementation for StepFun
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
  Tool as MCPTool,
  ListToolsResult,
  CallToolResult,
} from '@modelcontextprotocol/sdk/types.js';
import dotenv from 'dotenv';
import { StepFunAPIClient } from './client.js';
import { webSearchTool } from './tools.js';

// Load .env file if present
dotenv.config();

// Environment variable names (matching Python version)
const ENV_STEPFUN_API_KEY = 'STEPFUN_API_KEY';
const ENV_STEPFUN_API_HOST = 'STEPFUN_API_HOST';
const ENV_FASTMCP_LOG_LEVEL = 'FASTMCP_LOG_LEVEL';

// Get configuration from environment
const apiKey = process.env[ENV_STEPFUN_API_KEY];
const apiHost = process.env[ENV_STEPFUN_API_HOST];
const logLevel = process.env[ENV_FASTMCP_LOG_LEVEL] || 'WARNING';

// Validate required environment variables
if (!apiKey) {
  throw new Error('STEPFUN_API_KEY environment variable is required');
}
if (!apiHost) {
  throw new Error('STEPFUN_API_HOST environment variable is required');
}

// Create API client
const apiClient = new StepFunAPIClient({ apiKey, apiHost });

// Create MCP server with proper capabilities
const server = new Server(
  { name: 'Stepfun-mcp', version: '1.0.0' },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define tools list with comprehensive description
const tools: MCPTool[] = [
  {
    name: 'web_search',
    description: `You MUST use this tool whenever you need to search for real-time or external information on the web.

A web search API based on StepFun search engine.

Args:
  - query (string, required): The search query. Aim for 3-5 keywords for best results.
  - num_results (integer, optional): Number of search results to return. Defaults to 10, max 50.

Returns:
  A JSON object containing the search results:
  {
      "query": "string",
      "category": "string",
      "results": [
          {
              "url": "string",
              "position": "int",
              "title": "string",
              "time": "string (ISO date)",
              "snippet": "string",
              "content": "string"
          }
      ]
  }`,
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query (3-5 keywords recommended)',
        },
        num_results: {
          type: 'number',
          description: 'Number of results (1-50, default 10)',
          minimum: 1,
          maximum: 50,
        },
      },
      required: ['query'],
    },
  },
];

// Handle listTools request
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools } as ListToolsResult;
});

// Handle callTool request
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === 'web_search') {
    const result = await webSearchTool(apiClient, args);
    return { content: result } as CallToolResult;
  }

  throw new Error(`Unknown tool: ${name}`);
});

/**
 * Main function to start the MCP server
 */
export async function main() {
  try {
    const transport = new StdioServerTransport();
    await server.connect(transport);

    // Log to stderr (won't interfere with stdio communication)
    console.error(`Stepfun-mcp server started (log level: ${logLevel})`);
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}
