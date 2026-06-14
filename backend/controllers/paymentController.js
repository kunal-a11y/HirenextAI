const Razorpay = require('razorpay');
const crypto = require('crypto');
const pool = require('../config/db');
const { sendPlanPurchaseEmail } = require('../services/emailService');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'dummy_key_id',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_key_secret',
});

// Fallback plans list if database table does not exist
const mockPlans = {
    'free': { name: 'free', price_inr: 0, price_usd: 0 },
    'pro': { name: 'pro', price_inr: 299, price_usd: 9 },
    'max': { name: 'max', price_inr: 499, price_usd: 15 },
    'ultimate': { name: 'ultimate', price_inr: 799, price_usd: 25 }
};

const planIdToName = {
    1: 'free',
    2: 'pro',
    3: 'max',
    4: 'ultimate'
};

function normalizePlanName(planId, planName) {
    const fromName = typeof planName === 'string' ? planName.trim().toLowerCase() : '';
    if (mockPlans[fromName]) return fromName;
    const fromId = planIdToName[String(planId)];
    if (fromId) return fromId;
    const direct = typeof planId === 'string' ? planId.trim().toLowerCase() : '';
    if (mockPlans[direct]) return direct;
    return null;
}

exports.createOrder = async (req, res) => {
    if (!process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID === 'your_key' || 
        !process.env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_KEY_ID.startsWith('dummy')) {
        return res.status(503).json({
            error: 'Payments being set up. Contact support@hirenextai.com to upgrade manually.',
            contactEmail: 'support@hirenextai.com'
        });
    }

    let { planId, plan: requestedPlanName, currency } = req.body;
    const userId = req.user.id;

    if (!planId) {
        return res.status(400).json({ message: 'planId is required.' });
    }
    const normalizedPlan = normalizePlanName(planId, requestedPlanName);
    if (!normalizedPlan || normalizedPlan === 'free') {
        return res.status(400).json({ message: 'Invalid paid plan selected.' });
    }

    if (currency && (typeof currency !== 'string' || !['INR', 'USD'].includes(currency.trim().toUpperCase()))) {
        return res.status(400).json({ message: 'Invalid currency. Must be INR or USD.' });
    }
    if (currency) {
        currency = currency.trim().toUpperCase();
    } else {
        currency = 'USD';
    }

    try {
        // Fetch plan amount from DB with local fallback
        let plan = mockPlans[normalizedPlan];
        try {
            const [planRows] = await pool.query('SELECT * FROM plans WHERE id = ?', [planId]);
            if (planRows.length > 0) {
                plan = planRows[0];
            } else {
                const [nameRows] = await pool.query('SELECT * FROM plans WHERE name = ?', [normalizedPlan]);
                if (nameRows.length > 0) {
                    plan = nameRows[0];
                }
            }
        } catch (dbErr) {
            console.warn('plans table query failed, using local plan fallback:', dbErr.message);
        }

        const amount = Number(currency === 'INR' ? plan.price_inr : plan.price_usd);
        if (!Number.isFinite(amount) || amount <= 0) {
            return res.status(400).json({ message: 'Invalid plan amount.' });
        }
        
        const options = {
            amount: amount * 100, // amount in smallest currency unit
            currency: currency || 'USD',
            receipt: `receipt_order_${userId}_${Date.now()}`,
        };

        const order = await razorpay.orders.create(options);
        res.json({
            ...order,
            orderId: order.id,
            keyId: process.env.RAZORPAY_KEY_ID || 'dummy_key_id'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error creating order' });
    }
};

exports.verifyPayment = async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId, plan } = req.body;
    const userId = req.user.id;

    if (typeof razorpay_order_id !== 'string' || !razorpay_order_id.trim() ||
        typeof razorpay_payment_id !== 'string' || !razorpay_payment_id.trim() ||
        typeof razorpay_signature !== 'string' || !razorpay_signature.trim()) {
        return res.status(400).json({ message: 'Invalid razorpay verification parameters.' });
    }

    if (!planId) {
        return res.status(400).json({ message: 'planId is required.' });
    }

    try {
        const secret = process.env.RAZORPAY_KEY_SECRET || 'dummy_key_secret';
        const generated_signature = crypto.createHmac('sha256', secret)
            .update(razorpay_order_id + "|" + razorpay_payment_id)
            .digest('hex');

        if (generated_signature === razorpay_signature) {
            // Payment is successful
            // Fetch plan name
            let planName = normalizePlanName(planId, plan);
            if (!planName || planName === 'free') {
                return res.status(400).json({ message: 'Invalid paid plan selected.' });
            }
            try {
                const [planRows] = await pool.query('SELECT name FROM plans WHERE id = ?', [planId]);
                if (planRows.length > 0) {
                    planName = planRows[0].name;
                }
            } catch (dbErr) {
                console.warn('plans table query failed, using planId directly:', dbErr.message);
            }

            // Update user plan
            await pool.query('UPDATE users SET plan = ? WHERE id = ?', [planName, userId]);

            // Send plan purchase confirmation email
            try {
                const [userRows] = await pool.query('SELECT firstName, email FROM users WHERE id = ?', [userId]);
                if (userRows.length > 0) {
                    const user = userRows[0];
                    await sendPlanPurchaseEmail({ 
                        firstName: user.firstName || 'there',
                        email: user.email, 
                        planName: planName 
                    });
                    console.log('Plan purchase email sent to:', user.email);
                }
            } catch (e) {
                console.error('Plan purchase email failed:', e.message);
            }

            res.json({ message: 'Payment verified successfully', plan: planName });
        } else {
            res.status(400).json({ message: 'Invalid payment signature' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error verifying payment' });
    }
};

exports.failedPayment = async (req, res) => {
    const { orderId, plan, planId, reason } = req.body;
    const userId = req.user.id;
    console.warn(`Payment failed or cancelled by user ${userId} for order ${orderId} (plan: ${plan}, id: ${planId}). Reason: ${reason}`);
    res.json({ success: true, message: 'Failure logged' });
};
