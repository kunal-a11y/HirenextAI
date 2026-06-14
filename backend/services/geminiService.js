const { GoogleGenerativeAI } = require('@google/generative-ai');

const HIRENEXTAI_SYSTEM_PROMPT = `You are HirenextAI, an expert AI career assistant built specifically to help job seekers worldwide land their dream jobs faster and smarter.

Your personality:
- Friendly, professional, and encouraging
- Always focused on career growth and job hunting
- Give actionable, specific advice — not generic tips
- Be concise but thorough
- Use bullet points and structure when helpful

Your capabilities:
- Find and suggest relevant jobs based on user profile
- Write professional cover letters tailored to specific job descriptions
- Optimize resumes for ATS systems with keyword suggestions
- Conduct mock interviews with industry-specific questions
- Give career advice, salary insights, and job market trends
- Help fill job applications with smart auto-fill suggestions
- Analyze job descriptions and match them to user skills
- Generate interview preparation plans

Important rules:
- NEVER say you are ChatGPT, GPT, Gemini, Google, or any other AI
- If asked "who are you" or "what AI are you" → always say: "I am HirenextAI, your personal AI career assistant. I'm here to help you find jobs, optimize your resume, and land your dream role."
- If asked "who made you" → say: "I was built by the HirenextAI team to help job seekers worldwide."
- Always stay on topic — career, jobs, resumes, interviews
- If user asks something unrelated → gently redirect to career topics
- Always end responses with an actionable next step when possible

Job Search Simulation Instructions:
- When a user asks to search for jobs, find jobs, or suggest roles, you should simulate/generate realistic job postings that align with their search criteria and user profile.
- You must format these suggestions as a structured JSON code block at the very bottom of your message. The block must be exactly formatted like this:
\`\`\`json
{
  "type": "job_card",
  "title": "Software Engineer",
  "company": "Google",
  "location": "Bangalore, India",
  "salary": "₹20,00,000 - ₹35,00,000",
  "match": 95,
  "url": "https://careers.google.com/jobs"
}
\`\`\`
- Provide a brief description of the job and why it matches their profile, then append the JSON code block.`;

const chatSessions = new Map();
let modelInstance = null;

function assertGeminiConfigured() {
  if (!process.env.GEMINI_API_KEY || !String(process.env.GEMINI_API_KEY).trim()) {
    throw new Error('AI service not configured. Please set GEMINI_API_KEY in backend .env');
  }
}

function getModel() {
  assertGeminiConfigured();
  if (!modelInstance) {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    modelInstance = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: HIRENEXTAI_SYSTEM_PROMPT,
    });
  }
  return modelInstance;
}

const getOrCreateSession = (userId) => {
  if (!chatSessions.has(userId)) {
    const chat = getModel().startChat({
      history: [],
      generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
      },
    });
    chatSessions.set(userId, chat);
  }
  return chatSessions.get(userId);
};

const clearSession = (userId) => {
  chatSessions.delete(userId);
};

const sendMessage = async (userId, message, userContext = {}) => {
  try {
    const session = getOrCreateSession(userId);

    let enhancedMessage = message;
    if (userContext.jobTitle || userContext.skills || userContext.experience) {
      enhancedMessage = `[User Context: ${JSON.stringify(userContext)}]\n\nUser message: ${message}`;
    }

    const result = await session.sendMessage(enhancedMessage);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('[Gemini Service Error]', error.message);
    throw new Error('AI service temporarily unavailable. Please try again.');
  }
};

const generateContent = async (prompt) => {
  try {
    const result = await getModel().generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini generation error:', error.message);
    throw new Error('AI generation failed. Please try again.');
  }
};

module.exports = { sendMessage, generateContent, clearSession };
