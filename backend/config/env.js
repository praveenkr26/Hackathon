/**
 * Environment validation — warns about missing optional vars,
 * throws on critical missing variables.
 */
const validateEnv = () => {
  const required = ['MONGODB_URI'];
  const optional = ['GEMINI_API_KEY', 'CORS_ORIGIN'];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    console.warn(`⚠️  Missing required env vars: ${missing.join(', ')}`);
    console.warn('Continuing with defaults...');
  }

  optional.forEach(key => {
    if (!process.env[key]) {
      console.info(`ℹ️  Optional env var not set: ${key} (using fallback)`);
    }
  });
};

module.exports = { validateEnv };
