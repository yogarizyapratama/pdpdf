/**
 * Test script to verify React hydration issues are resolved
 * Run this in browser console to check for hydration warnings
 */

// Listen for React hydration warnings
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

let hydrationErrors = [];
let hydrationWarnings = [];

console.error = function(...args) {
  const message = args.join(' ');
  if (message.includes('hydration') || message.includes('server') || message.includes('client')) {
    hydrationErrors.push(message);
  }
  originalConsoleError.apply(console, args);
};

console.warn = function(...args) {
  const message = args.join(' ');
  if (message.includes('hydration') || message.includes('server') || message.includes('client')) {
    hydrationWarnings.push(message);
  }
  originalConsoleWarn.apply(console, args);
};

// Check after 3 seconds
setTimeout(() => {
  console.log('=== HYDRATION TEST RESULTS ===');
  console.log('Hydration Errors:', hydrationErrors.length);
  console.log('Hydration Warnings:', hydrationWarnings.length);
  
  if (hydrationErrors.length === 0 && hydrationWarnings.length === 0) {
    console.log('✅ No hydration issues detected!');
  } else {
    console.log('❌ Hydration issues found:');
    hydrationErrors.forEach((err, i) => console.log(`Error ${i + 1}:`, err));
    hydrationWarnings.forEach((warn, i) => console.log(`Warning ${i + 1}:`, warn));
  }
}, 3000);

console.log('🔍 Hydration monitoring started. Results in 3 seconds...');
