const express = require('express');
const router = express.Router();
const { sendMessage, generateContent, clearSession } = require('../services/geminiService');
const authMiddleware = require('../middleware/auth');
const { checkCredits } = require('../middleware/checkCredits');
const xss = require('xss');

// Check config status
router.get('/config-check', (req, res) => {
  res.json({ hasGeminiKey: !!process.env.GEMINI_API_KEY });
});

// Main chat endpoint
router.post('/chat', authMiddleware, checkCredits('dailyAI'), async (req, res) => {
  try {
    let { message, model, userContext } = req.body;
    if (typeof message === 'string') {
      message = xss(message);
    }
    const userId = req.user?.id || req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({ error: 'AI service not configured. Please set GEMINI_API_KEY.' });
    }
    
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Enrich context with database values
    const enrichedContext = { ...(userContext || {}) };
    try {
      const pool = require('../config/db');
      const [userRows] = await pool.query(
        'SELECT phone, linkedinUrl, indeedUrl, naukriUrl, githubUrl, firstName, lastName FROM users WHERE id = ?', 
        [userId]
      );
      if (userRows.length > 0) {
        const u = userRows[0];
        enrichedContext.phone = u.phone || '';
        enrichedContext.linkedinUrl = u.linkedinUrl || '';
        enrichedContext.indeedUrl = u.indeedUrl || '';
        enrichedContext.naukriUrl = u.naukriUrl || '';
        enrichedContext.githubUrl = u.githubUrl || '';
        enrichedContext.name = `${u.firstName || ''} ${u.lastName || ''}`.trim();
      }
    } catch (dbErr) {
      console.warn('Enrich user context failed:', dbErr.message);
    }
    
    const response = await sendMessage(String(userId), message, enrichedContext);
    
    res.json({ response, success: true });
  } catch (error) {
    console.error('[API Error] Error during Gemini message processing:', error);
    res.status(500).json({ error: error.message });
  }
});

// Clear chat history (new chat)
router.post('/clear', authMiddleware, async (req, res) => {
  try {
    clearSession(req.user.id);
    res.json({ success: true, message: 'Chat history cleared' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate cover letter
router.post('/cover-letter', authMiddleware, checkCredits('monthlyCoverLetter'), async (req, res) => {
  try {
    const { jobTitle, company, jobDescription, userProfile } = req.body;
    
    const prompt = `Generate a professional, personalized cover letter for:
Job Title: ${jobTitle}
Company: ${company}
Job Description: ${jobDescription}
Candidate Profile: ${JSON.stringify(userProfile)}

Requirements:
- Professional tone, 3-4 paragraphs
- Highlight relevant skills matching the job description
- Show enthusiasm for the specific company
- Include specific achievements if provided in profile
- ATS-friendly format
- End with a strong call to action
- Do NOT use generic phrases like "I am writing to apply"
- Make it sound human and authentic`;

    const response = await generateContent(prompt);
    res.json({ coverLetter: response, success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Optimize resume
router.post('/optimize-resume', authMiddleware, checkCredits('monthlyResume'), async (req, res) => {
  try {
    const { resumeText, jobDescription, jobTitle } = req.body;
    
    const prompt = `Analyze and optimize this resume for the following job:
Job Title: ${jobTitle}
Job Description: ${jobDescription}
Current Resume: ${resumeText}

Provide:
1. ATS Score (0-100) with explanation
2. Missing keywords from job description
3. Specific improvements for each section
4. Rewritten bullet points that are stronger
5. Skills to add or highlight
6. Overall recommendations

Format response as structured JSON with these keys:
{
  "atsScore": number,
  "scoreExplanation": string,
  "missingKeywords": array,
  "improvements": { "summary": string, "experience": array, "skills": array },
  "recommendations": array
}`;

    const response = await generateContent(prompt);
    // Try to parse as JSON, fallback to text
    try {
      const parsed = JSON.parse(response.replace(/```json|```/g, '').trim());
      res.json({ analysis: parsed, success: true });
    } catch {
      res.json({ analysis: response, success: true });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate mock interview questions
router.post('/interview-questions', authMiddleware, checkCredits('monthlyMockInterview'), async (req, res) => {
  try {
    const { jobTitle, company, jobDescription, difficulty = 'medium' } = req.body;
    
    const prompt = `Generate 10 mock interview questions for:
Job Title: ${jobTitle}
Company: ${company || 'a top tech company'}
Job Description: ${jobDescription || 'standard ' + jobTitle + ' role'}
Difficulty: ${difficulty}

Include mix of:
- 3 behavioral questions (STAR format)
- 3 technical/role-specific questions
- 2 situational questions
- 1 company-specific question
- 1 career goals question

For each question provide:
- The question
- What the interviewer is looking for
- A strong example answer framework

Return as JSON array:
[{
  "id": number,
  "type": "behavioral|technical|situational|company|career",
  "question": string,
  "lookingFor": string,
  "answerFramework": string
}]`;

    const response = await generateContent(prompt);
    try {
      const parsed = JSON.parse(response.replace(/```json|```/g, '').trim());
      res.json({ questions: parsed, success: true });
    } catch {
      res.json({ questions: response, success: true });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Evaluate interview answer
router.post('/evaluate-answer', authMiddleware, async (req, res) => {
  try {
    const { question, answer, jobTitle } = req.body;
    
    const prompt = `Evaluate this interview answer for a ${jobTitle} position:

Question: ${question}
Candidate Answer: ${answer}

Provide evaluation as JSON:
{
  "score": number (1-10),
  "strengths": array of strings,
  "improvements": array of strings,
  "betterAnswer": string,
  "tips": string
}`;

    const response = await generateContent(prompt);
    try {
      const parsed = JSON.parse(response.replace(/```json|```/g, '').trim());
      res.json({ evaluation: parsed, success: true });
    } catch {
      res.json({ evaluation: response, success: true });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Auto-fill job application
router.post('/autofill', authMiddleware, async (req, res) => {
  try {
    const { formFields, userProfile, jobDescription } = req.body;
    
    const prompt = `Help fill out a job application form.
Form fields: ${JSON.stringify(formFields)}
User profile: ${JSON.stringify(userProfile)}
Job description: ${jobDescription}

For each form field, provide the best value to fill in based on the user profile.
Tailor answers to match the job description where relevant.

Return as JSON object where keys are field names and values are suggested fill values:
{
  "fieldName": "suggested value",
  ...
}`;

    const response = await generateContent(prompt);
    try {
      const parsed = JSON.parse(response.replace(/```json|```/g, '').trim());
      res.json({ autofill: parsed, success: true });
    } catch {
      res.json({ autofill: response, success: true });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate mind map after interview
router.post('/mind-map', authMiddleware, async (req, res) => {
  try {
    const { jobTitle, questions, answers, scores } = req.body;
    
    const prompt = `Create a comprehensive mind map summary for a mock interview:
Job: ${jobTitle}
Questions and Answers: ${JSON.stringify(questions.map((q, i) => ({ question: q, answer: answers[i], score: scores[i] })))}

Generate a structured mind map as JSON:
{
  "center": "${jobTitle} Interview",
  "overallScore": number,
  "branches": [
    {
      "topic": string,
      "color": string (hex color),
      "items": [
        { "label": string, "score": number, "status": "strong|improve|weak" }
      ]
    }
  ],
  "topStrengths": array of strings,
  "topImprovements": array of strings,
  "readinessLevel": "Not Ready|Needs Work|Almost Ready|Ready|Excellent",
  "nextSteps": array of strings
}`;

    const response = await generateContent(prompt);
    try {
      const parsed = JSON.parse(response.replace(/```json|```/g, '').trim());
      res.json({ mindMap: parsed, success: true });
    } catch {
      res.json({ mindMap: response, success: true });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
