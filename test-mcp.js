#!/usr/bin/env node
/**
 * Simple test script to verify MCP server communication
 */

import { spawn } from 'child_process';

const serverProcess = spawn('node', ['dist/index.js'], {
  env: {
    ...process.env,
    STEPFUN_API_KEY: 'test_key',
    STEPFUN_API_HOST: 'https://api.stepfun.com'
  },
  stdio: ['pipe', 'pipe', 'inherit']
});

let buffer = '';
let initialized = false;

serverProcess.stdout.on('data', (data) => {
  buffer += data.toString();

  // Try to parse JSON-RPC messages
  try {
    const lines = buffer.split('\n');
    for (const line of lines) {
      if (line.trim()) {
        const msg = JSON.parse(line);
        console.log('← Received:', JSON.stringify(msg, null, 2));

        // Handle initialize request
        if (msg.method === 'initialize') {
          sendResponse(msg.id, {
            protocolVersion: '2024-11-05',
            capabilities: {
              tools: {}
            },
            serverInfo: {
              name: 'stepfun-mcp',
              version: '1.0.0'
            }
          });
        }

        // Handle tools/list request
        if (msg.method === 'tools/list') {
          sendResponse(msg.id, {
            tools: [
              {
                name: 'web_search',
                description: 'A web search API based on StepFun search engine.',
                inputSchema: {
                  type: 'object',
                  properties: {
                    query: { type: 'string' },
                    num_results: { type: 'number' }
                  },
                  required: ['query']
                }
              }
            ]
          });
        }

        // Handle tools/call request
        if (msg.method === 'tools/call') {
          const { name, arguments: args } = msg.params;
          if (name === 'web_search') {
            sendResponse(msg.id, {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify({
                    query: args.query,
                    category: 'test',
                    results: [
                      {
                        url: 'https://example.com',
                        position: 1,
                        title: 'Test Result',
                        time: new Date().toISOString(),
                        snippet: 'Test snippet',
                        content: 'Test content'
                      }
                    ]
                  }, null, 2)
                }
              ]
            });
          }
        }
      }
    }
    buffer = '';
  } catch (e) {
    // Not a complete JSON line yet
  }
});

function sendResponse(id, result) {
  const response = {
    jsonrpc: '2.0',
    id,
    result
  };
  console.log('→ Sending:', JSON.stringify(response, null, 2));
  serverProcess.stdin.write(JSON.stringify(response) + '\n');
}

// Send initialize request after a short delay
setTimeout(() => {
  const initializeRequest = {
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: {
        name: 'test-client',
        version: '1.0.0'
      }
    }
  };
  console.log('→ Sending:', JSON.stringify(initializeRequest, null, 2));
  serverProcess.stdin.write(JSON.stringify(initializeRequest) + '\n');
}, 1000);

// Terminate after 5 seconds
setTimeout(() => {
  serverProcess.kill('SIGTERM');
  process.exit(0);
}, 5000);

serverProcess.on('error', (err) => {
  console.error('Server error:', err);
});

serverProcess.on('exit', (code) => {
  console.log('Server exited with code:', code);
});
