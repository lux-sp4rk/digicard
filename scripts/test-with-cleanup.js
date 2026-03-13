#!/usr/bin/env node

/**
 * Test Runner with Guaranteed Cleanup
 *
 * This wrapper ensures Vitest worker processes are properly terminated
 * when running in isolated subagent environments (like OpenCode).
 *
 * Usage:
 *   node scripts/test-with-cleanup.js --run
 *   node scripts/test-with-cleanup.js --run --coverage
 *   node scripts/test-with-cleanup.js --version
 */

import { spawn } from 'child_process';
import process from 'process';

// Configuration
const VITEST_TIMEOUT = 300000; // 5 minutes max for tests
const CLEANUP_TIMEOUT = 5000; // 5 seconds for cleanup before force kill

/**
 * Get the vitest binary path
 */
function getVitestPath() {
  // Try npx first, then look for local installation
  return process.platform === 'win32' ? 'npx.cmd' : 'npx';
}

/**
 * Main wrapper function
 */
async function runVitestWithCleanup() {
  const vitestPath = getVitestPath();
  const args = ['vitest', ...process.argv.slice(2)];

  console.log('[test-cleanup] Starting vitest:', args.join(' '));

  // Spawn vitest as a child process
  const child = spawn(vitestPath, args, {
    stdio: 'inherit',
    shell: false,
    detached: false, // Keep in same process group for cleanup
    env: {
      ...process.env,
      // Signal to vitest config that we're in a subagent context
      OPENCODE_SUBAGENT: process.env.OPENCODE_SUBAGENT || 'true',
    },
  });

  // Track child PID to exclude from lingering process cleanup
  const childPid = child.pid;
  let cleanupPerformed = false;

  /**
   * Perform cleanup of child processes
   */
  async function performCleanup(signal = 'SIGTERM') {
    if (cleanupPerformed) return;
    cleanupPerformed = true;

    console.log(`[test-cleanup] Performing cleanup with ${signal}...`);

    if (child && !child.killed) {
      // Try graceful termination first
      try {
        // Kill the entire process group to catch all workers
        if (child.pid) {
          process.kill(-child.pid, signal);
        }
      } catch (err) {
        // Process may already be dead
        if (err.code !== 'ESRCH') {
          console.error('[test-cleanup] Error during cleanup:', err.message);
        }
      }

      // Force kill after timeout if still running
      setTimeout(() => {
        try {
          if (child && !child.killed && child.pid) {
            console.log('[test-cleanup] Force killing with SIGKILL...');
            process.kill(-child.pid, 'SIGKILL');
          }
        } catch (err) {
          // Ignore errors - process likely already dead
        }
      }, CLEANUP_TIMEOUT);
    }

    // Additional cleanup: find and kill any lingering vitest processes
    await killLingeringVitestProcesses();
  }

  /**
   * Kill any lingering vitest worker processes
   */
  async function killLingeringVitestProcesses() {
    try {
      const { exec } = await import('child_process');
      const { promisify } = await import('util');
      const execAsync = promisify(exec);

      // Find vitest processes, excluding our own child process and the wrapper script
      const { stdout } = await execAsync(
        "ps aux | grep -E 'vitest|node.*vitest' | grep -v grep | grep -v 'test-with-cleanup' | awk '{print $2}'"
      ).catch(() => ({ stdout: '' }));

      const pids = stdout.trim().split('\n').filter(Boolean);

      // Filter out our own child process
      const lingeringPids = pids.filter(pid => parseInt(pid, 10) !== childPid);

      if (lingeringPids.length > 0) {
        console.log(
          `[test-cleanup] Found ${lingeringPids.length} lingering vitest processes`
        );

        for (const pid of lingeringPids) {
          try {
            process.kill(parseInt(pid, 10), 'SIGTERM');
            console.log(`[test-cleanup] Sent SIGTERM to PID ${pid}`);
          } catch (err) {
            // Process may have already exited
          }
        }

        // Give them a moment to exit, then force kill
        setTimeout(async () => {
          for (const pid of lingeringPids) {
            try {
              process.kill(parseInt(pid, 10), 'SIGKILL');
            } catch (err) {
              // Already dead
            }
          }
        }, 2000);
      }
    } catch (err) {
      // Best effort - don't fail if cleanup fails
      console.error(
        '[test-cleanup] Error during lingering process cleanup:',
        err.message
      );
    }
  }

  // Handle various exit scenarios
  const exitHandler = exitCode => {
    performCleanup('SIGTERM').then(() => {
      process.exit(exitCode ?? 0);
    });
  };

  // Register signal handlers for various termination scenarios
  process.on('SIGTERM', () => {
    console.log('[test-cleanup] Received SIGTERM, cleaning up...');
    performCleanup('SIGTERM');
  });

  process.on('SIGINT', () => {
    console.log('[test-cleanup] Received SIGINT, cleaning up...');
    performCleanup('SIGTERM');
  });

  process.on('exit', () => {
    performCleanup('SIGTERM');
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', err => {
    console.error('[test-cleanup] Uncaught exception:', err);
    performCleanup('SIGTERM');
  });

  // Wait for vitest to complete
  return new Promise((resolve, reject) => {
    // Timeout safety net
    const timeoutId = setTimeout(() => {
      console.error('[test-cleanup] Tests timed out, forcing cleanup...');
      performCleanup('SIGKILL');
      reject(new Error('Test execution timeout'));
    }, VITEST_TIMEOUT);

    child.on('exit', (code, signal) => {
      clearTimeout(timeoutId);
      console.log(
        `[test-cleanup] Vitest exited with code ${code}, signal ${signal}`
      );

      // Perform cleanup even on normal exit
      performCleanup('SIGTERM').then(() => {
        resolve(code ?? 0);
      });
    });

    child.on('error', err => {
      clearTimeout(timeoutId);
      console.error('[test-cleanup] Failed to spawn vitest:', err);
      performCleanup('SIGKILL');
      reject(err);
    });
  });
}

// Run the wrapper
runVitestWithCleanup()
  .then(exitCode => {
    process.exit(exitCode);
  })
  .catch(err => {
    console.error('[test-cleanup] Fatal error:', err);
    process.exit(1);
  });
