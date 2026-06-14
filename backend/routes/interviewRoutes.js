const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const db = require('../config/db');

// Call OpenRouter API helper
const callOpenRouter = async (systemPrompt, userPrompt) => {
    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "openai/gpt-4o-mini", // Fallback generic model
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt }
                ],
                response_format: { type: "json_object" }
            })
        });

        const data = await response.json();
        if (data.choices && data.choices.length > 0) {
            return JSON.parse(data.choices[0].message.content);
        }
        throw new Error("Invalid response from AI");
    } catch (err) {
        console.error("OpenRouter Error:", err);
        throw err;
    }
};

// Generate questions
router.post('/generate', auth, async (req, res) => {
    try {
        let { role, difficulty, type, count } = req.body;

        if (typeof role !== 'string') {
            return res.status(400).json({ success: false, message: 'Role must be a valid string.' });
        }
        role = role.trim();
        if (!role) {
            return res.status(400).json({ success: false, message: 'Role is required.' });
        }
        if (role.length > 100) {
            return res.status(400).json({ success: false, message: 'Role length cannot exceed 100 characters.' });
        }

        if (typeof difficulty !== 'string') {
            return res.status(400).json({ success: false, message: 'Difficulty must be a string.' });
        }
        difficulty = difficulty.trim().toLowerCase();
        if (!['easy', 'medium', 'hard'].includes(difficulty)) {
            return res.status(400).json({ success: false, message: 'Difficulty must be easy, medium, or hard.' });
        }

        if (typeof type !== 'string') {
            return res.status(400).json({ success: false, message: 'Type must be a string.' });
        }
        type = type.trim().toLowerCase();
        if (!['technical', 'hr', 'mixed'].includes(type)) {
            return res.status(400).json({ success: false, message: 'Type must be technical, hr, or mixed.' });
        }

        const countNum = parseInt(count, 10);
        if (isNaN(countNum) || countNum < 1 || countNum > 20) {
            return res.status(400).json({ success: false, message: 'Count must be an integer between 1 and 20.' });
        }
        count = countNum;

        const systemPrompt = `You are an expert technical interviewer. Generate exactly ${count} interview questions for a ${role} position.
Difficulty: ${difficulty}
Type: ${type} (technical/HR/mixed)
Return ONLY a valid JSON object with a single 'questions' array inside:
{
  "questions": [
    {
      "id": 1,
      "type": "technical",
      "question": "Explain the virtual DOM...",
      "key_points": ["point1", "point2"],
      "good_answer_hints": "A good answer should..."
    }
  ]
}`;

        const data = await callOpenRouter(systemPrompt, "Please generate the questions now.");
        
        res.json({ success: true, questions: data.questions || data });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Failed to generate questions' });
    }
});

// Evaluate answers
router.post('/evaluate', auth, async (req, res) => {
    try {
        let { role, questions, answers } = req.body;

        if (typeof role !== 'string') {
            return res.status(400).json({ success: false, message: 'Role must be a valid string.' });
        }
        role = role.trim();
        if (!role) {
            return res.status(400).json({ success: false, message: 'Role is required.' });
        }
        if (role.length > 100) {
            return res.status(400).json({ success: false, message: 'Role length cannot exceed 100 characters.' });
        }

        if (!Array.isArray(questions) || questions.length === 0 || questions.length > 20) {
            return res.status(400).json({ success: false, message: 'Questions must be a non-empty array with at most 20 elements.' });
        }

        if (!Array.isArray(answers) || answers.length !== questions.length) {
            return res.status(400).json({ success: false, message: 'Answers must be an array of the same length as questions.' });
        }

        const systemPrompt = `You are an expert technical interviewer. Evaluate these interview answers for a ${role} position.
Evaluate strictly but fairly.
Return ONLY a valid JSON object in this format:
{
  "overall_score": 78,
  "breakdown": {
    "communication": 80,
    "technical": 65,
    "problem_solving": 75,
    "confidence": 90
  },
  "question_scores": [
    {
      "question_id": 1,
      "score": 8,
      "correct": "What was good...",
      "incorrect": "What was missing...",
      "better_answer": "A better answer would..."
    }
  ],
  "strengths": "You showed...",
  "improvements": "Work on...",
  "study_topics": ["Topic 1", "Topic 2"]
}`;

        const userPrompt = JSON.stringify({ questions, answers });

        const results = await callOpenRouter(systemPrompt, userPrompt);
        
        res.json({ success: true, results });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Failed to evaluate answers' });
    }
});

// Save interview
router.post('/save', auth, async (req, res) => {
    try {
        let { role, difficulty, overall_score, questions_json, answers_json, feedback_json } = req.body;
        
        if (typeof role !== 'string' || !role.trim()) {
            return res.status(400).json({ success: false, message: 'Role is required.' });
        }
        role = role.trim();

        if (typeof difficulty !== 'string' || !['easy', 'medium', 'hard'].includes(difficulty.trim().toLowerCase())) {
            return res.status(400).json({ success: false, message: 'Valid difficulty is required.' });
        }
        difficulty = difficulty.trim().toLowerCase();

        const score = parseFloat(overall_score);
        if (isNaN(score) || score < 0 || score > 100) {
            return res.status(400).json({ success: false, message: 'Overall score must be a number between 0 and 100.' });
        }

        const formatJson = (val) => {
            if (typeof val === 'string') {
                try {
                    JSON.parse(val);
                    return val;
                } catch {
                    return JSON.stringify({ data: val });
                }
            }
            return JSON.stringify(val || {});
        };

        const formattedQuestions = formatJson(questions_json);
        const formattedAnswers = formatJson(answers_json);
        const formattedFeedback = formatJson(feedback_json);

        let interviewId = Date.now();
        try {
            const [result] = await db.query(
                `INSERT INTO interviews (user_id, role, difficulty, overall_score, questions_json, answers_json, feedback_json) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [req.user.id, role, difficulty, score, formattedQuestions, formattedAnswers, formattedFeedback]
            );
            interviewId = result.insertId;
        } catch (dbErr) {
            console.warn('interviews table not found, using fallback interviewId:', dbErr.message);
        }

        res.json({ success: true, interviewId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Failed to save interview' });
    }
});

module.exports = router;
