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
  REQUIRED_ENV_VARS.forEach((name) => {
    const value = process.env[name];
    if (value === undefined || value === null || String(value).trim() === '') {
      console.warn('⚠️ Missing env var:', name);
    }
  });

  if (!process.env.PORT) {
    process.env.PORT = '8080';
  }
}

module.exports = { validateEnv, REQUIRED_ENV_VARS };
