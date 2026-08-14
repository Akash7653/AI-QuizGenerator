/**
 * Utility to suppress specific console warnings
 * Used to filter out known non-critical warnings like deprecated Recharts defaultProps
 */

const originalError = console.error;
const originalWarn = console.warn;

export function suppressConsoleWarnings() {
  // Suppress Recharts defaultProps warnings
  console.warn = function (...args: any[]) {
    const message = args.join(' ');
    
    // Suppress Recharts defaultProps warnings
    if (
      message.includes('Support for defaultProps will be removed') &&
      (message.includes('XAxis') || message.includes('YAxis'))
    ) {
      return;
    }

    // Suppress React DevTools extension warnings
    if (message.includes('React Developer Tools')) {
      return;
    }

    originalWarn.apply(console, args);
  };

  console.error = function (...args: any[]) {
    const message = args.join(' ');

    // Suppress specific network errors when backend is not running
    if (
      message.includes('Network Error') &&
      message.includes('ERR_CONNECTION_REFUSED')
    ) {
      // Log these at debug level instead
      console.log('[Debug] Network connection refused (backend may be starting)');
      return;
    }

    originalError.apply(console, args);
  };
}

export function restoreConsoleLogging() {
  console.warn = originalWarn;
  console.error = originalError;
}
