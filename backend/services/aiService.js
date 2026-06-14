const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

const SYSTEM_PROMPT = `You are HirenextAI - an AI job assistant. 
You ONLY answer job related questions.
Help users find jobs, prepare resumes, 
practice interviews, and apply for jobs.
If user asks anything unrelated to jobs, 
politely redirect them to job topics.`;

exports.generateChatResponse = async (messages) => {
    try {
        const payload = {
            model: "openai/gpt-4o-mini",
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                ...messages
            ]
        };

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`OpenRouter API error: ${response.statusText}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error("AI Service Error:", error);
        throw error;
    }
};

exports.calculateMatchScore = async (userProfile, jobDescription) => {
    try {
        const prompt = `Calculate a job match percentage (0-100) based on the user's profile and the job description. Return ONLY a JSON object like {"score": 85, "reason": "Short reason here"}.
        
        User Profile:
        Skills: ${userProfile.skills || 'Not provided'}
        Experience: ${userProfile.experience || 'Not provided'}
        Education: ${userProfile.education || 'Not provided'}
        
        Job Description:
        ${jobDescription}`;

        const payload = {
            model: "openai/gpt-4o-mini",
            response_format: { type: "json_object" },
            messages: [{ role: "user", content: prompt }]
        };

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`OpenRouter API error: ${response.statusText}`);
        }

        const data = await response.json();
        const result = JSON.parse(data.choices[0].message.content);
        return result.score;
    } catch (error) {
        console.error("Match Score Error:", error);
        return 0; // default to 0 on error
    }
};
