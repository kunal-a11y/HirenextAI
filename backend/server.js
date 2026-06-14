const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

const productionEnvPath = path.join(__dirname, '.env.production');
const defaultEnvPath = path.join(__dirname, '.env');
dotenv.config({
  path: fs.existsSync(productionEnvPath) ? productionEnvPath : defaultEnvPath,
});

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const pool = require('./config/db');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Validate environments on startup
const { validateEnv } = require('./config/envCheck');
validateEnv();

const { transporter } = require('./services/emailService');

const frontendUrl = (process.env.FRONTEND_URL || 'https://hirenextai.com').replace(/\/$/, '');

const initDB = async () => {
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      firstName VARCHAR(100),
      lastName VARCHAR(100),
      email VARCHAR(255) UNIQUE,
      phone VARCHAR(20),
      passwordHash VARCHAR(255),
      plan VARCHAR(50) DEFAULT 'free',
      role VARCHAR(50) DEFAULT 'user',
      isVerified BOOLEAN DEFAULT false,
      linkedinUrl VARCHAR(500),
      indeedUrl VARCHAR(500),
      naukriUrl VARCHAR(500),
      githubUrl VARCHAR(500),
      lastLoginAt DATETIME,
      createdAt DATETIME DEFAULT NOW(),
      updatedAt DATETIME DEFAULT NOW() ON UPDATE NOW()
    )`);
    
    await pool.query(`CREATE TABLE IF NOT EXISTS support_tickets (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100),
      email VARCHAR(255),
      subject VARCHAR(200),
      message TEXT,
      category VARCHAR(50),
      status VARCHAR(50) DEFAULT 'new',
      repliedAt DATETIME,
      createdAt DATETIME DEFAULT NOW()
    )`);
    
    await pool.query(`CREATE TABLE IF NOT EXISTS chats (
      id INT AUTO_INCREMENT PRIMARY KEY,
      userId INT,
      title VARCHAR(255),
      pinned BOOLEAN DEFAULT false,
      archived BOOLEAN DEFAULT false,
      createdAt DATETIME DEFAULT NOW()
    )`);
    
    await pool.query(`CREATE TABLE IF NOT EXISTS messages (
      id INT AUTO_INCREMENT PRIMARY KEY,
      chatId INT,
      role VARCHAR(20),
      content TEXT,
      createdAt DATETIME DEFAULT NOW()
    )`);
    
    await pool.query(`CREATE TABLE IF NOT EXISTS applications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      userId INT,
      jobTitle VARCHAR(255),
      company VARCHAR(255),
      location VARCHAR(255),
      salary VARCHAR(100),
      status VARCHAR(50) DEFAULT 'applied',
      matchScore INT,
      appliedAt DATETIME DEFAULT NOW()
    )`);

    await pool.query(`CREATE TABLE IF NOT EXISTS files (
      id INT AUTO_INCREMENT PRIMARY KEY,
      userId INT NOT NULL,
      type VARCHAR(50) NOT NULL,
      title VARCHAR(255) NOT NULL,
      content LONGTEXT,
      jobId INT NULL,
      createdAt DATETIME DEFAULT NOW(),
      INDEX idx_files_user (userId)
    )`);

    await pool.query(`CREATE TABLE IF NOT EXISTS jobs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      company VARCHAR(255) NOT NULL,
      location VARCHAR(255),
      description TEXT,
      url VARCHAR(1000),
      platform VARCHAR(100),
      match_score INT DEFAULT 0,
      createdAt DATETIME DEFAULT NOW()
    )`);

    await pool.query(`CREATE TABLE IF NOT EXISTS plans (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(50) UNIQUE NOT NULL,
      price_inr DECIMAL(10,2) DEFAULT 0,
      price_usd DECIMAL(10,2) DEFAULT 0,
      features TEXT,
      limits TEXT,
      createdAt DATETIME DEFAULT NOW()
    )`);

    await pool.query(`CREATE TABLE IF NOT EXISTS interviews (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      role VARCHAR(255) NOT NULL,
      difficulty VARCHAR(50) NOT NULL,
      overall_score DECIMAL(5,2) DEFAULT 0,
      questions_json LONGTEXT,
      answers_json LONGTEXT,
      feedback_json LONGTEXT,
      createdAt DATETIME DEFAULT NOW(),
      INDEX idx_interviews_user (user_id)
    )`);
    
    await pool.query(`CREATE TABLE IF NOT EXISTS ai_usage (
      id INT AUTO_INCREMENT PRIMARY KEY,
      userId INT NOT NULL,
      type VARCHAR(50) NOT NULL,
      createdAt DATETIME DEFAULT NOW(),
      INDEX idx_user_type (userId, type)
    )`);

    await pool.query(`CREATE TABLE IF NOT EXISTS auth_tokens (
      id INT AUTO_INCREMENT PRIMARY KEY,
      userId INT NOT NULL,
      type VARCHAR(50) NOT NULL,
      tokenHash CHAR(64) NOT NULL,
      expiresAt DATETIME NOT NULL,
      createdAt DATETIME DEFAULT NOW(),
      UNIQUE KEY unique_auth_token (tokenHash),
      INDEX idx_auth_tokens_user_type (userId, type)
    )`);
    
    return true;
  } catch(e) {
    console.error('❌ DB init error:', e.message);
    return false;
  }
};

const runStartupHealthCheck = async () => {
  console.log('=== STARTING HIRENEXTAI HEALTH CHECK ===');
  
  // 1. Database Connection & Tables
  let dbOk = false;
  let tablesOk = false;
  try {
    await pool.query('SELECT 1');
    dbOk = true;
    console.log('✅ MySQL Database connected');
    tablesOk = await initDB();
    if (tablesOk) {
      console.log('✅ All tables created');
    } else {
      console.log('❌ All tables created');
    }
  } catch (err) {
    console.log('❌ MySQL Database connected');
    console.log('❌ All tables created');
  }

  // 2. Gemini API Key
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== '') {
    console.log('✅ Gemini AI key present');
  } else {
    console.log('❌ Gemini AI key present');
  }

  // 3. SMTP Email
  try {
    await transporter.verify();
    console.log('✅ SMTP Email ready');
  } catch (err) {
    console.log('❌ SMTP Email ready');
  }

  // 4. JWT Secret
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length >= 32) {
    console.log('✅ JWT Secret strong');
  } else {
    console.log('❌ JWT Secret strong');
  }

  // 5. Google OAuth Keys
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_CLIENT_ID !== 'your_google_client_id') {
    console.log('✅ Google OAuth keys');
  } else {
    console.log('⚠️ Google OAuth keys');
  }

  // 6. LinkedIn OAuth Keys
  if (process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET && process.env.LINKEDIN_CLIENT_ID !== 'your_linkedin_client_id') {
    console.log('✅ LinkedIn OAuth keys');
  } else {
    console.log('⚠️ LinkedIn OAuth keys');
  }

  // 7. Razorpay Keys
  if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET && process.env.RAZORPAY_KEY_ID !== 'your_key') {
    console.log('✅ Razorpay keys');
  } else {
    console.log('⚠️ Razorpay keys');
  }

  // 8. Fast2SMS Key
  if (process.env.FAST2SMS_API_KEY && process.env.FAST2SMS_API_KEY.trim() !== '') {
    console.log('✅ Fast2SMS key');
  } else {
    console.log('⚠️ Fast2SMS key');
  }

  // 9. Admin Email
  if (process.env.ADMIN_EMAILS && process.env.ADMIN_EMAILS.trim() !== '') {
    console.log('✅ Admin email configured');
  } else {
    console.log('✅ Admin email configured'); // fallback default
  }

  console.log('=== HEALTH CHECK COMPLETE ===');
};

runStartupHealthCheck();

const app = express();
let dbConnected = true;

// Session Security and Proxy settings
app.set('trust proxy', 1);

// HTTPS redirect in production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    // Only redirect when the proxy explicitly tells us the original request
    // was HTTP. Some shared hosts do not provide this header for HTTPS traffic.
    if (req.header('x-forwarded-proto') === 'http') {
      return res.redirect(301, `https://${req.header('host')}${req.url}`);
    }
    next();
  });
}

// Initialize Passport
require('./config/passport');
app.use(passport.initialize());

// Google OAuth routes
app.get('/api/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/api/auth/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login?error=google' }),
  (req, res) => {
    const token = jwt.sign(
      { id: req.user.id, email: req.user.email, role: req.user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    // Redirect to frontend with token
    res.redirect(`${frontendUrl}/auth/callback?token=${encodeURIComponent(token)}`);
  }
);

function signAppToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '30d' });
}

async function upsertLinkedInUser(profile, email) {
  const localizedName = profile.localizedFirstName || profile.given_name || profile.name || 'LinkedIn';
  const localizedLast = profile.localizedLastName || profile.family_name || '';
  const profileId = profile.sub || profile.id;
  const linkedinUrl = profile.vanityName
    ? `https://www.linkedin.com/in/${profile.vanityName}`
    : (profile.profile || (profileId ? `https://www.linkedin.com/in/${profileId}` : null));

  const normalizedEmail = String(email || '').trim().toLowerCase();
  if (!normalizedEmail) {
    throw new Error('LinkedIn did not return an email address');
  }

  const [rows] = await pool.query(
    'SELECT id FROM users WHERE email = ? LIMIT 1',
    [normalizedEmail]
  );

  if (rows.length > 0) {
    await pool.query(
      'UPDATE users SET linkedinUrl = COALESCE(?, linkedinUrl), isVerified = TRUE, lastLoginAt = NOW() WHERE id = ?',
      [linkedinUrl, rows[0].id]
    );
    return rows[0].id;
  }

  const [result] = await pool.query(
    `INSERT INTO users (firstName, lastName, email, plan, role, isVerified, linkedinUrl, lastLoginAt)
     VALUES (?, ?, ?, 'free', 'user', TRUE, ?, NOW())`,
    [localizedName, localizedLast, normalizedEmail, linkedinUrl]
  );
  return result.insertId;
}

// LinkedIn OAuth routes. A logged-in user can pass state=<jwt> to connect a profile.
app.get('/api/auth/linkedin', (req, res) => {
  if (!process.env.LINKEDIN_CLIENT_ID || !process.env.LINKEDIN_CLIENT_SECRET) {
    return res.redirect(`${frontendUrl}/auth/callback?error=linkedin_not_configured`);
  }

  const callbackUrl = process.env.LINKEDIN_CALLBACK_URL || `${process.env.BACKEND_URL || 'https://hirenextai.com'}/api/auth/linkedin/callback`;
  const requestedState = typeof req.query.state === 'string' ? req.query.state : '';
  const state = requestedState || crypto.randomBytes(16).toString('hex');
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.LINKEDIN_CLIENT_ID,
    redirect_uri: callbackUrl,
    scope: 'openid profile email',
    state,
  });

  res.redirect(`https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`);
});

app.get('/api/auth/linkedin/callback', async (req, res) => {
  try {
    const { code, state, error } = req.query;
    if (error) {
      return res.redirect(`${frontendUrl}/auth/callback?error=linkedin_${encodeURIComponent(error)}`);
    }
    if (!code) {
      return res.redirect(`${frontendUrl}/auth/callback?error=linkedin_missing_code`);
    }

    const callbackUrl = process.env.LINKEDIN_CALLBACK_URL || `${process.env.BACKEND_URL || 'https://hirenextai.com'}/api/auth/linkedin/callback`;
    const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: String(code),
        redirect_uri: callbackUrl,
        client_id: process.env.LINKEDIN_CLIENT_ID,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error(`LinkedIn token exchange failed (${tokenResponse.status})`);
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;
    const profileResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!profileResponse.ok) {
      throw new Error(`LinkedIn profile fetch failed (${profileResponse.status})`);
    }

    const profile = await profileResponse.json();
    let connectedUserId = null;
    if (state) {
      try {
        connectedUserId = jwt.verify(String(state), process.env.JWT_SECRET).id;
      } catch {
        connectedUserId = null;
      }
    }

    if (connectedUserId) {
      const linkedinUrl = profile.vanityName
        ? `https://www.linkedin.com/in/${profile.vanityName}`
        : (profile.profile || (profile.sub ? `https://www.linkedin.com/in/${profile.sub}` : null));
      await pool.query('UPDATE users SET linkedinUrl = COALESCE(?, linkedinUrl) WHERE id = ?', [linkedinUrl, connectedUserId]);
      return res.redirect(`${frontendUrl}/auth/callback?linkedin=connected`);
    }

    const userId = await upsertLinkedInUser(profile, profile.email);
    const appToken = signAppToken(userId);
    res.redirect(`${frontendUrl}/auth/callback?token=${encodeURIComponent(appToken)}`);
  } catch (err) {
    console.error('LinkedIn OAuth error:', err.message);
    res.redirect(`${frontendUrl}/auth/callback?error=linkedin_failed`);
  }
});

// Helmet CSP Security Hardening
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://hirenextai.com", "https://generativelanguage.googleapis.com"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// CORS Configuration
  const allowedOrigins = [
  'https://hirenextai.com',
  'https://www.hirenextai.com',
  'http://localhost:3003',
  'http://127.0.0.1:3003',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Rate Limiters
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 60 : 100,
  message: { error: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.originalUrl === '/api/auth/me' || req.originalUrl === '/api/user/me',
});

const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 15,
  message: { error: 'AI rate limit reached. Please wait.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 25,
  message: { error: 'Too many login attempts, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.originalUrl === '/api/auth/me' || req.originalUrl === '/api/auth/resend-verification',
});

// Apply rate limiters
app.use('/api', generalLimiter);
app.use('/api/auth', authLimiter);
app.use('/api/chat', aiLimiter);
app.use('/api/interview', aiLimiter);
app.use('/api/ai', aiLimiter);

// Express body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Register routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/user', require('./routes/userRoutes'));
app.use('/api/jobs', require('./routes/jobRoutes'));
app.use('/api/applications', require('./routes/applicationRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/plans', require('./routes/planRoutes'));
app.use('/api/payment', require('./routes/paymentRoutes'));
app.use('/api/interview', require('./routes/interviewRoutes'));
app.use('/api/support', require('./routes/supportRoutes'));

// Conditionally register debug and test email routes
if (process.env.NODE_ENV !== 'production') {
  app.use('/', require('./routes/testRoutes'));
}

const adminRoutes = require('./routes/adminRoutes');
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    dbConnected = true;
  } catch {
    dbConnected = false;
  }

  let smtpReady = false;
  try {
    await transporter.verify();
    smtpReady = true;
  } catch {
    smtpReady = false;
  }

  res.json({
    status: 'running',
    database: dbConnected ? 'connected' : 'disconnected',
    email: smtpReady ? 'ready' : 'unavailable',
    gemini: process.env.GEMINI_API_KEY ? 'configured' : 'missing',
    googleOAuth: process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? 'configured' : 'missing',
    linkedinOAuth: process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET ? 'configured' : 'missing',
    razorpay: process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET ? 'configured' : 'missing',
    timestamp: new Date().toISOString()
  });
});

const frontendPath = path.join(__dirname, "../frontend/dist");

app.use(express.static(frontendPath));

app.get('/*splat', (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global production-ready error handler
app.use((err, req, res, next) => {
  const fs = require('fs');
  const errorMsg = `[${new Date().toISOString()}] ${err.stack || err.message || err}\n\n`;
  try {
    fs.appendFileSync(path.join(__dirname, 'vps_error.log'), errorMsg);
  } catch (e) {
    console.error('Failed to write to vps_error.log:', e.message);
  }

  console.error('Server error:', err);
  res.status(500).json({ error: err.message || 'Something went wrong. Please try again.' });
});

const PORT = process.env.PORT || process.env.NODE_PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
