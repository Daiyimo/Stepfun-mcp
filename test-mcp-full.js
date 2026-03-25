#!/usr/bin/env node
/**
 * Comprehensive MCP server test
 */

import { spawn } from 'child_process';
import { stdin as input, stdout as output } from 'process';

const serverProcess = spawn('node', ['dist/index.js'], {
  env: {
    ...process.env,
    STEPFUN_API_KEY: 'test_key',
    STEPFUN_API_HOST: 'https://api.stepfun.com'
  },
  stdio: ['pipe', 'pipe', 'inherit']
});

let buffer = '';
let requestId = 1;
const pendingRequests = new Map();

serverProcess.stdout.on('data', (data) => {
  buffer += data.toString();
  const lines = buffer.split('\n');

  for (const line of lines) {
    if (line.trim()) {
      try {
        const msg = JSON.parse(line);
        console.log('← Received:', JSON.stringify(msg, null, 2));

        if (msg.method) {
          // Handle request from server
          handleRequest(msg);
        } else if (msg.id && msg.result) {
          // Handle response to our request
          console.log(`✓ Request ${msg.id} completed:`);
          console.log(JSON.stringify(msg.result, null, 2));
        } else if (msg.id && msg.error) {
          console.error(`✗ Request ${msg.id} failed:`, msg.error);
        }
      } catch (e) {
        // Not complete JSON yet
      }
    }
  }
  buffer = '';
});

function sendRequest(method, params = {}) {
  const id = requestId++;
  const request = { jsonrpc: '2.0', id, method, params };
  console.log(`→ Sending ${method}:`, JSON.stringify(request, null, 2));
  serverProcess.stdin.write(JSON.stringify(request) + '\n');
  return new Promise((resolve) => {
    pendingRequests.set(id, resolve);
  });
}

function handleRequest(msg) {
  const { method, params, id } = msg;

  switch (method) {
    case 'initialize':
      sendResponse(id, {
        protocolVersion: '2024-11-05',
        capabilities: { tools: {} },
        serverInfo: { name: 'stepfun-mcp', version: '1.0.0' }
      });
      // After initialize, run tests
      runTests();
      break;

    case 'tools/list':
      sendResponse(id, {
        tools: [
          {
            name: 'web_search',
            description: 'Test web search tool',
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
      break;

    case 'tools/call':
      const { name, arguments: args } = params;
      if (name === 'web_search') {
        sendResponse(id, {
          content: [{
            type: 'text',
            text: JSON.stringify({
              query: args.query,
              category: 'test',
              results: [{
                url: 'https://example.com',
                position: 1,
                title: 'Test Result',
                time: new Date().toISOString(),
                snippet: 'Test snippet',
                content: 'Test content'
              }]
            }, null, 2)
          }]
        });
      } else {
        sendError(id, -32601, 'Method not found');
      }
      break;

    default:
      sendError(id, -32601, 'Method not found');
  }
}

function sendResponse(id, result) {
  const response = { jsonrpc: '2.0', id, result };
  console.log('→ Sending response:', JSON.stringify(response, null, 2));
  serverProcess.stdin.write(JSON.stringify(response) + '\n');
}

function sendError(id, code, message) {
  const response = { jsonrpc: '2.0', id, error: { code, message } };
  console.log('→ Sending error:', JSON.stringify(response, null, 2));
  serverProcess.stdin.write(JSON.stringify(response) + '\n');
}

async function runTests() {
  console.log('\n=== Running Tests ===\n');

  // Test 1: tools/list
  console.log('Test 1: List tools');
  await sendRequest('tools/list');
  await sleep(500);

  // Test 2: tools/call with valid query
  console.log('\nTest 2: Call web_search');
  await sendRequest('tools/call', {
    name: 'web_search',
    arguments: { query: 'StepFun API', num_results: 5 }
  });
  await sleep(500);

  // Test 3: tools/call with minimal args
  console.log('\nTest 3: Call web_search with minimal args');
  await sendRequest('tools/call', {
    name: 'web_search',
    arguments: { query: 'test' }
  });
  await sleep(500);

  console.log('\n=== All tests completed ===\n');

  // Clean shutdown
  setTimeout(() => {
    serverProcess.kill('SIGTERM');
    process.exit(0);
  }, 1000);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Error handling
serverProcess.on('error', (err) => {
  console.error('Server error:', err);
});

serverProcess.on('exit', (code) => {
  console.log('Server exited with code:', code);
});
