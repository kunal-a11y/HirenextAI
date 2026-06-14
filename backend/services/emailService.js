const nodemailer = require('nodemailer');

const smtpHost = process.env.SMTP_HOST || 'mail.reaverhosting.in';
const smtpPort = Number(process.env.SMTP_PORT) || 587;
const smtpFrom = process.env.SMTP_FROM || process.env.SMTP_USER || 'support@hirenextai.com';
const isProd = process.env.NODE_ENV === 'production';
const frontendUrl = (process.env.FRONTEND_URL || 'https://hirenextai.com').replace(/\/$/, '');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'mail.reaverhosting.in',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
    ciphers: 'SSLv3'
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000,
  debug: process.env.NODE_ENV !== 'production',
  logger: process.env.NODE_ENV !== 'production'
});

transporter.verify((error) => {
  if (error) {
    console.error('❌ SMTP verify failed:', error.message);
  } else {
    console.log(`✅ SMTP ready (${process.env.SMTP_HOST || 'mail.reaverhosting.in'}:${parseInt(process.env.SMTP_PORT) || 587})`);
  }
});

// A shared premium dark HTML template wrapper with purple branding
const wrapEmailContent = (bodyContent) => {
  return `
    <div style="background-color: #0B0A0F; padding: 40px 20px; font-family: 'Inter', system-ui, -apple-system, sans-serif; color: #E4E4E7; min-height: 100%;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #13121A; border: 1px solid rgba(139, 92, 246, 0.15); border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.4);">
        <!-- Header -->
        <div style="padding: 32px 32px 20px; text-align: center; border-bottom: 1px solid rgba(139, 92, 246, 0.08);">
          <a href="https://hirenextai.com" style="text-decoration: none; display: inline-block;">
            <span style="font-size: 24px; font-weight: 800; color: #FFFFFF; letter-spacing: -0.5px;">
              Hirenext<span style="color: #8B5CF6;">AI</span>
            </span>
          </a>
        </div>
        
        <!-- Content Body -->
        <div style="padding: 40px 32px; line-height: 1.6;">
          ${bodyContent}
        </div>
        
        <!-- Footer -->
        <div style="padding: 32px; text-align: center; background-color: #0E0D14; border-top: 1px solid rgba(139, 92, 246, 0.08);">
          <p style="margin: 0 0 12px 0; font-size: 13px; color: #A1A1AA;">
            Questions? We're here to help. Reach out at 
            <a href="mailto:support@hirenextai.com" style="color: #8B5CF6; text-decoration: none; font-weight: 500;">support@hirenextai.com</a> | <a href="https://hirenextai.com" style="color: #8B5CF6; text-decoration: none; font-weight: 500;">hirenextai.com</a>
          </p>
          <p style="margin: 0 0 16px 0; font-size: 12px; color: #71717A;">
            &copy; ${new Date().getFullYear()} HirenextAI. All rights reserved.
          </p>
          <div style="font-size: 11px; color: #52525B; line-height: 1.4;">
            This is an automated email from HirenextAI. If you did not expect this, please ignore it or let us know.
          </div>
        </div>
      </div>
    </div>
  `;
};

// Email to support inbox — notification of new ticket
const sendSupportNotification = async ({ name, email, subject, message }) => {
  const tableContent = `
    <h2 style="color: #FFFFFF; margin-top: 0; margin-bottom: 24px; font-size: 20px; font-weight: 700; border-left: 4px solid #8B5CF6; padding-left: 12px;">New Support Ticket</h2>
    <p style="color: #A1A1AA; font-size: 14px; margin-bottom: 24px;">A user has submitted a request via the HirenextAI Contact Form:</p>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 14px; color: #E4E4E7;">
      <tr>
        <td style="padding: 12px 8px; border-bottom: 1px solid rgba(255,255,255,0.06); color: #71717A; font-weight: 500; width: 100px;">Name</td>
        <td style="padding: 12px 8px; border-bottom: 1px solid rgba(255,255,255,0.06); font-weight: 600; color: #FFFFFF;">${name}</td>
      </tr>
      <tr>
        <td style="padding: 12px 8px; border-bottom: 1px solid rgba(255,255,255,0.06); color: #71717A; font-weight: 500;">Email</td>
        <td style="padding: 12px 8px; border-bottom: 1px solid rgba(255,255,255,0.06); color: #FFFFFF;"><a href="mailto:${email}" style="color: #8B5CF6; text-decoration: none;">${email}</a></td>
      </tr>
      <tr>
        <td style="padding: 12px 8px; border-bottom: 1px solid rgba(255,255,255,0.06); color: #71717A; font-weight: 500;">Subject</td>
        <td style="padding: 12px 8px; border-bottom: 1px solid rgba(255,255,255,0.06); font-weight: 600; color: #FFFFFF;">${subject}</td>
      </tr>
      <tr>
        <td style="padding: 12px 8px; color: #71717A; font-weight: 500; vertical-align: top;">Message</td>
        <td style="padding: 12px 8px; color: #E4E4E7; white-space: pre-line; line-height: 1.5;">${message}</td>
      </tr>
    </table>
    <div style="background-color: rgba(139, 92, 246, 0.05); border-left: 3px solid #8B5CF6; padding: 16px; border-radius: 8px;">
      <p style="margin: 0; color: #A1A1AA; font-size: 13px;">
        You can reply directly to this notification email to respond to the user at their email address: <strong>${email}</strong>.
      </p>
    </div>
  `;

  await transporter.sendMail({
    from: `"HirenextAI" <support@hirenextai.com>`,
    to: 'support@hirenextai.com',
    subject: `[Contact Form] ${subject} — from ${name}`,
    html: wrapEmailContent(tableContent),
    replyTo: email,
  });
};

// Auto-reply email to user confirming their message was received
const sendUserConfirmation = async ({ name, email, subject }) => {
  const content = `
    <h2 style="color: #FFFFFF; margin-top: 0; margin-bottom: 16px; font-size: 22px; font-weight: 700;">Hey ${name}, thanks for reaching out! 👋</h2>
    <p style="color: #A1A1AA; font-size: 15px; margin-bottom: 24px;">
      We've received your request about <strong style="color: #FFFFFF;">"${subject}"</strong>.
    </p>
    <div style="background-color: rgba(139, 92, 246, 0.05); border: 1px solid rgba(139, 92, 246, 0.15); padding: 20px; border-radius: 12px; margin-bottom: 28px;">
      <p style="margin: 0 0 8px 0; color: #A1A1AA; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Expected Response Time</p>
      <p style="margin: 0; color: #FFFFFF; font-size: 15px; font-weight: 600;">
        Within 24 hours on business days
      </p>
    </div>
    <p style="color: #A1A1AA; font-size: 15px; margin-bottom: 28px; line-height: 1.6;">
      Our support team will get back to you within 24 hours. While we look into your request, you can check out our Help Center for answers to frequently asked questions.
    </p>
    <div style="text-align: center; margin-bottom: 12px;">
      <a href="https://hirenextai.com/help" style="display: inline-block; background-color: #8B5CF6; color: #FFFFFF; padding: 14px 28px; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 15px; transition: background-color 0.2s; box-shadow: 0 4px 14px rgba(139, 92, 246, 0.25);">
        Visit Help Center
      </a>
    </div>
  `;

  await transporter.sendMail({
    from: `"HirenextAI" <support@hirenextai.com>`,
    to: email,
    subject: `We received your message — HirenextAI Support`,
    html: wrapEmailContent(content),
  });
};

// Password Reset Email
const sendPasswordResetEmail = async ({ firstName, name, email, token }) => {
  const resetUrl = `${frontendUrl}/reset-password?token=${encodeURIComponent(token)}`;
  const resolvedName = firstName || name || 'there';
  const content = `
    <h2 style="color: #FFFFFF; margin-top: 0; margin-bottom: 16px; font-size: 22px; font-weight: 700; text-align: center;">Reset your password</h2>
    <p style="color: #A1A1AA; font-size: 15px; margin-bottom: 24px; text-align: center; line-height: 1.6;">
      Hello ${resolvedName},<br/><br/>
      We received a request to reset your password. Click the button below to choose a new password. This link is valid for <strong>1 hour</strong>.
    </p>
    <div style="text-align: center; margin-bottom: 28px; margin-top: 28px;">
      <a href="${resetUrl}" style="display: inline-block; background-color: #8B5CF6; color: #FFFFFF; padding: 14px 28px; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 15px; box-shadow: 0 4px 14px rgba(139, 92, 246, 0.25);">
        Reset Password
      </a>
    </div>
    <p style="color: #71717A; font-size: 13px; text-align: center; line-height: 1.5; margin-top: 24px;">
      If you did not request this password reset, please ignore this email or secure your account.
    </p>
  `;

  await transporter.sendMail({
    from: `"HirenextAI" <support@hirenextai.com>`,
    to: email,
    subject: `Reset your HirenextAI password 🔐`,
    html: wrapEmailContent(content),
  });
};

// Welcome Onboarding Email
const sendWelcomeEmail = async ({ firstName, name, email }) => {
  const resolvedFirstName = firstName || (name ? name.split(' ')[0] : 'there');
  const content = `
    <h2 style="color: #FFFFFF; margin-top: 0; margin-bottom: 16px; font-size: 22px; font-weight: 700;">Hey ${resolvedFirstName}, welcome aboard! 🎉</h2>
    <p style="color: #A1A1AA; font-size: 15px; margin-bottom: 24px; line-height: 1.6;">
      Your free account is ready. You have <strong>20 AI credits</strong> to get started. Here is what you can do right now:
    </p>
    <ul style="color: #E4E4E7; font-size: 14px; line-height: 1.8; padding-left: 20px; margin-bottom: 28px; list-style-type: none; padding-inline-start: 0;">
      <li style="margin-bottom: 10px; padding-left: 24px; position: relative;">
        <span style="position: absolute; left: 0; color: #8B5CF6;">🔍</span> <strong>Find jobs with AI</strong> &mdash; Instantly scan and match jobs suited to your profile.
      </li>
      <li style="margin-bottom: 10px; padding-left: 24px; position: relative;">
        <span style="position: absolute; left: 0; color: #8B5CF6;">📝</span> <strong>Cover letters</strong> &mdash; Write personalized cover letters for every application.
      </li>
      <li style="margin-bottom: 10px; padding-left: 24px; position: relative;">
        <span style="position: absolute; left: 0; color: #8B5CF6;">📄</span> <strong>Resume optimizer</strong> &mdash; Optimize your resume with industry keywords.
      </li>
      <li style="margin-bottom: 10px; padding-left: 24px; position: relative;">
        <span style="position: absolute; left: 0; color: #8B5CF6;">🎙️</span> <strong>Mock interviews</strong> &mdash; Practice with AI and get instant feedback.
      </li>
    </ul>
    
    <div style="text-align: center; margin-bottom: 24px;">
      <a href="${frontendUrl}/chat" style="display: inline-block; background-color: #8B5CF6; color: #FFFFFF; padding: 14px 28px; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 15px; box-shadow: 0 4px 14px rgba(139, 92, 246, 0.25);">
        Go to Dashboard
      </a>
    </div>
    
    <div style="background-color: rgba(139, 92, 246, 0.05); border: 1px solid rgba(139, 92, 246, 0.15); padding: 16px; border-radius: 10px; text-align: center; margin-bottom: 8px;">
      <span style="color: #A1A1AA; font-size: 13px;">
        You're on the <strong>Free Plan</strong> &mdash; upgrade anytime for unlimited access.
      </span>
    </div>
  `;

  await transporter.sendMail({
    from: `"HirenextAI" <support@hirenextai.com>`,
    to: email,
    subject: `Welcome to HirenextAI! 🚀 Your account is ready`,
    html: wrapEmailContent(content),
  });
};

// Plan Upgrade Confirmation Email
const sendPlanPurchaseEmail = async ({ firstName, name, email, planName }) => {
  const resolvedFirstName = firstName || (name ? name.split(' ')[0] : 'there');
  const planFeatures = {
    pro: [
      'Unlimited AI Cover Letters',
      'Advanced Mock Interview Mode',
      '200 AI Credits per month',
      'Resume optimization analysis',
      'Priority Email Support'
    ],
    max: [
      'Everything in Pro',
      'Unlimited AI Credits',
      'Real-time interview simulator',
      'Direct Job Board integrations',
      '1-on-1 resume feedback sessions'
    ],
    ultimate: [
      'Everything in Max',
      'Dedicated AI Recruiter agent',
      'Personal career coach access',
      'Guaranteed responses within 2 hours',
      'Lifetime system access and updates'
    ]
  };

  const currentFeatures = planFeatures[planName.toLowerCase()] || ['Access to premium AI career features', 'Enhanced credits and limits', 'Priority customer support'];
  const formattedFeatures = currentFeatures.map(feat => `
    <li style="margin-bottom: 8px; padding-left: 20px; position: relative;">
      <span style="position: absolute; left: 0; color: #8B5CF6;">✓</span> ${feat}
    </li>
  `).join('');

  const content = `
    <h2 style="color: #FFFFFF; margin-top: 0; margin-bottom: 16px; font-size: 22px; font-weight: 700;">Hey ${resolvedFirstName}! Your ${planName} is now active. 🎉</h2>
    <p style="color: #A1A1AA; font-size: 15px; margin-bottom: 24px; line-height: 1.6;">
      Thank you for upgrading! Your account has been updated successfully. Start using your new features now:
    </p>
    
    <div style="background-color: rgba(139, 92, 246, 0.05); border: 1px solid rgba(139, 92, 246, 0.15); padding: 24px; border-radius: 12px; margin-bottom: 28px;">
      <p style="margin: 0 0 12px 0; color: #FFFFFF; font-size: 15px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">What's included in ${planName}:</p>
      <ul style="color: #E4E4E7; font-size: 14px; line-height: 1.6; padding-left: 0; list-style-type: none; margin: 0;">
        ${formattedFeatures}
      </ul>
    </div>

    <p style="color: #A1A1AA; font-size: 14px; margin-bottom: 28px; text-align: center;">
      Your credits have been updated. Ready to land your next dream job?
    </p>
    
    <div style="text-align: center; margin-bottom: 24px;">
      <a href="${frontendUrl}/chat" style="display: inline-block; background-color: #8B5CF6; color: #FFFFFF; padding: 14px 28px; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 15px; box-shadow: 0 4px 14px rgba(139, 92, 246, 0.25);">
        Go to Dashboard
      </a>
    </div>
    
    <p style="color: #71717A; font-size: 13px; text-align: center; line-height: 1.5; margin-top: 24px;">
      Have questions about your plan? Reply directly to this email or contact support at <a href="mailto:support@hirenextai.com" style="color: #8B5CF6; text-decoration: none;">support@hirenextai.com</a>.
    </p>
  `;

  await transporter.sendMail({
    from: `"HirenextAI" <support@hirenextai.com>`,
    to: email,
    subject: `You're now on ${planName}! 🎉 HirenextAI`,
    html: wrapEmailContent(content),
  });
};

// Account Verification Link Email
const sendVerificationEmail = async ({ firstName, name, email, token }) => {
  const verifyUrl = `${frontendUrl}/verify-email?token=${encodeURIComponent(token)}`;
  const resolvedName = firstName || name || 'there';
  const content = `
    <h2 style="color: #FFFFFF; margin-top: 0; margin-bottom: 16px; font-size: 22px; font-weight: 700; text-align: center;">Verify your email address</h2>
    <p style="color: #A1A1AA; font-size: 15px; margin-bottom: 24px; text-align: center; line-height: 1.6;">
      Hi ${resolvedName},<br/><br/>
      Thank you for choosing HirenextAI! Please click the button below to verify your email address and activate your account.
    </p>
    <div style="text-align: center; margin-bottom: 28px; margin-top: 28px;">
      <a href="${verifyUrl}" style="display: inline-block; background-color: #8B5CF6; color: #FFFFFF; padding: 14px 28px; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 15px; box-shadow: 0 4px 14px rgba(139, 92, 246, 0.25);">
        Verify Email
      </a>
    </div>
    <p style="color: #71717A; font-size: 13px; text-align: center; line-height: 1.5; margin-top: 24px;">
      This link expires in <strong>24 hours</strong>. If you did not sign up for HirenextAI, please ignore this email.
    </p>
  `;

  await transporter.sendMail({
    from: `"HirenextAI" <support@hirenextai.com>`,
    to: email,
    subject: `Verify your HirenextAI email ✉️`,
    html: wrapEmailContent(content),
  });
};

module.exports = {
  transporter,
  sendSupportNotification,
  sendUserConfirmation,
  sendPasswordResetEmail,
  sendWelcomeEmail,
  sendVerificationEmail,
  sendPlanPurchaseEmail
};
