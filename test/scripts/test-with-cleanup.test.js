import { describe, it, expect } from 'vitest';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const wrapperPath = join(__dirname, '../../scripts/test-with-cleanup.js');

describe('test-with-cleanup', () => {
  it('should exist as executable script', () => {
    const content = readFileSync(wrapperPath, 'utf-8');
    expect(content).toContain('#!/usr/bin/env node');
    expect(content).toContain('runVitestWithCleanup');
  });

  it('should have correct configuration', () => {
    const content = readFileSync(wrapperPath, 'utf-8');
    expect(content).toContain('VITEST_TIMEOUT = 300000');
    expect(content).toContain('CLEANUP_TIMEOUT = 5000');
  });

  it('should implement cleanup functions', () => {
    const content = readFileSync(wrapperPath, 'utf-8');
    expect(content).toContain('performCleanup');
    expect(content).toContain('killLingeringVitestProcesses');
  });

  it('should handle SIGTERM signal', () => {
    const content = readFileSync(wrapperPath, 'utf-8');
    expect(content).toContain("process.on('SIGTERM'");
  });

  it('should handle SIGINT signal', () => {
    const content = readFileSync(wrapperPath, 'utf-8');
    expect(content).toContain("process.on('SIGINT'");
  });

  it('should set OPENCODE_SUBAGENT environment variable', () => {
    const content = readFileSync(wrapperPath, 'utf-8');
    expect(content).toContain('OPENCODE_SUBAGENT');
  });
});
