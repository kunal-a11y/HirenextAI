const db = require('../config/db');

const PLAN_LIMITS = {
  free: { 
    dailyAI: 5,
    monthlyCoverLetter: 2,
    monthlyResume: 1,
    weeklyApplyWithAI: 1,
    monthlyMockInterview: 0
  },
  pro: { 
    dailyAI: 50,
    monthlyCoverLetter: 20,
    monthlyResume: 10,
    weeklyApplyWithAI: 10,
    monthlyMockInterview: 5
  },
  max: { 
    dailyAI: 200,
    monthlyCoverLetter: -1,
    monthlyResume: -1,
    weeklyApplyWithAI: -1,
    monthlyMockInterview: -1
  },
  ultimate: { 
    dailyAI: -1,
    monthlyCoverLetter: -1,
    monthlyResume: -1,
    weeklyApplyWithAI: -1,
    monthlyMockInterview: -1
  }
};

// -1 means unlimited

const checkCredits = (type) => async (req, res, next) => {
  try {
    const userId = req.user.id;
    const [rows] = await db.query('SELECT plan FROM users WHERE id = ?', [userId]);
    const plan = rows[0]?.plan || 'free';
    const limits = PLAN_LIMITS[plan.toLowerCase()] || PLAN_LIMITS.free;
    
    const limit = limits[type];
    if (limit === -1) return next(); // unlimited
    
    // Check usage from DB
    const period = type.includes('weekly') ? 'week' : 
                   type.includes('daily') ? 'day' : 'month';
    
    const [usage] = await db.query(
      `SELECT COUNT(*) as count FROM ai_usage 
       WHERE userId = ? AND type = ? 
       AND createdAt >= DATE_SUB(NOW(), INTERVAL 1 ${period.toUpperCase()})`,
      [userId, type]
    );
    
    const used = usage[0].count;
    
    if (used >= limit) {
      return res.status(429).json({
        error: `Limit reached`,
        message: `You've used ${used}/${limit} ${type} for this ${period}. Upgrade your plan for more.`,
        upgradeUrl: '/pricing',
        used,
        limit,
        plan
      });
    }
    
    // Log this usage
    await db.query(
      'INSERT INTO ai_usage (userId, type, createdAt) VALUES (?, ?, NOW())',
      [userId, type]
    );
    
    next();
  } catch(e) {
    console.error('Credits check error:', e.message);
    next(); // Don't block on error
  }
};

module.exports = { checkCredits, PLAN_LIMITS };
