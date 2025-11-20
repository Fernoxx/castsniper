// This file exists for Vercel to detect Next.js
// The actual Next.js app is in the frontend/ directory
const path = require('path');
try {
  module.exports = require(path.join(__dirname, 'frontend', 'next.config.js'));
} catch (e) {
  // Fallback if frontend config doesn't exist yet
  module.exports = {
    reactStrictMode: true,
  };
}
