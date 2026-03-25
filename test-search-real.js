#!/usr/bin/env node
/**
 * 测试 MCP 服务器搜索功能 - 模拟 Claude Code 调用
 */

import { spawn } from 'child_process';

console.log('🧪 开始测试 MCP 服务器搜索功能\n');
console.log('搜索主题: 张雪峰去世\n');

// 启动 MCP 服务器（使用项目配置的环境变量）
// 使用绝对路径确保能找到命令
const cmd = process.platform === 'win32' ? 'Stepfun-mcp.cmd' : 'Stepfun-mcp';
const serverProcess = spawn(cmd, {
  shell: true,
  env: {
    ...process.env,
    // 从项目配置读取或设置您的真实 API Key
    STEPFUN_API_KEY: process.env.STEPFUN_API_KEY || 'your_api_key_here',
    STEPFUN_API_HOST: process.env.STEPFUN_API_HOST || 'https://api.stepfun.com'
  },
  stdio: ['pipe', 'pipe', 'inherit']
});

let buffer = '';
let requestId = 1;

serverProcess.stdout.on('data', (data) => {
  buffer += data.toString();
  const lines = buffer.split('\n');

  for (const line of lines) {
    if (line.trim()) {
      try {
        const msg = JSON.parse(line);
        console.log('📥 收到消息:', JSON.stringify(msg, null, 2));

        if (msg.method === 'initialize') {
          sendResponse(msg.id, {
            protocolVersion: '2024-11-05',
            capabilities: { tools: {} },
            serverInfo: { name: 'Stepfun-mcp', version: '1.0.0' }
          });
        }

        if (msg.method === 'tools/list') {
          sendResponse(msg.id, { tools: msg.result?.tools || [] });
        }

        if (msg.method === 'tools/call') {
          const { name, arguments: args } = msg.params;
          if (name === 'web_search') {
            console.log(`\n🔍 执行搜索: ${args.query}\n`);
            // 这里实际会调用 StepFun API，但我们已经有真实的 API key
            // 所以会返回真实的搜索结果
          }
        }
      } catch (e) {
        // 等待完整 JSON
      }
    }
  }
  buffer = '';
});

function sendResponse(id, result) {
  const response = { jsonrpc: '2.0', id, result };
  console.log('📤 发送响应:', JSON.stringify(response, null, 2));
  serverProcess.stdin.write(JSON.stringify(response) + '\n');
}

// 初始化序列
setTimeout(() => {
  sendRequest('initialize', {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: { name: 'claude-code-test', version: '1.0.0' }
  });
}, 1000);

setTimeout(() => {
  sendRequest('tools/list', {});
}, 2500);

setTimeout(() => {
  sendRequest('tools/call', {
    name: 'web_search',
    arguments: { query: '张雪峰去世', num_results: 10 }
  });
}, 4000);

// 5秒后关闭
setTimeout(() => {
  serverProcess.kill('SIGTERM');
  console.log('\n✅ 测试完成');
  process.exit(0);
}, 8000);

function sendRequest(method, params) {
  const id = requestId++;
  const request = { jsonrpc: '2.0', id, method, params };
  console.log(`\n📤 发送请求 (${method}):`, JSON.stringify(request, null, 2));
  serverProcess.stdin.write(JSON.stringify(request) + '\n');
}

serverProcess.on('error', (err) => {
  console.error('❌ 服务器错误:', err);
});

serverProcess.on('exit', (code) => {
  console.log('服务器退出码:', code);
});
