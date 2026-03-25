#!/usr/bin/env node
/**
 * StepFun MCP - Command Line Entry Point
 */

import { main } from './server.js';

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
