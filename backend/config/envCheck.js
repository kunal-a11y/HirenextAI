const REQUIRED_ENV_VARS = [
  'GEMINI_API_KEY',
  'JWT_SECRET',
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_USER',
  'SMTP_PASSWORD',
  'SMTP_FROM',
  'NODE_ENV',
  'PORT',
  'DB_HOST',
  'DB_PORT',
  'DB_NAME',
  'DB_USER',
  'DB_PASSWORD',
  'FRONTEND_URL',
];

function validateEnv() {
  const missing = [];
  
  // Verify standard required variables
  REQUIRED_ENV_VARS.forEach((name) => {
    // Skip SMTP_FROM check here as it is checked below along with FROM_EMAIL
    if (name === 'SMTP_FROM') return;
    const value = process.env[name];
    if (value === undefined || value === null || String(value).trim() === '') {
      missing.push(name);
    }
  });

  // Verify FROM_EMAIL / SMTP_FROM
  const fromEmail = process.env.FROM_EMAIL || process.env.SMTP_FROM;
  if (!fromEmail || String(fromEmail).trim() === '') {
    missing.push('FROM_EMAIL / SMTP_FROM');
  }

  if (missing.length > 0) {
    console.error('\n❌ CRITICAL ERROR: Startup aborted due to missing configuration:\n');
    missing.forEach((name) => {
      console.error(`   - ${name}`);
    });
    console.error('\nPlease verify your .env file settings.\n');
    process.exit(1);
  }

  if (!process.env.PORT) {
    process.env.PORT = '5000';
  }
}

module.exports = { validateEnv, REQUIRED_ENV_VARS };
