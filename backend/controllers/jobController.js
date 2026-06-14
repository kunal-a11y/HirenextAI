const pool = require('../config/db');
const aiService = require('../services/aiService');

// Placeholder for actual JSearch or Indeed API
const mockJobSearchAPI = async (query, location) => {
    return [
        {
            title: 'Frontend Developer',
            company: 'TechCorp',
            location: location || 'Remote',
            description: 'Looking for a React developer with 3+ years of experience.',
            url: 'https://example.com/job/1',
            platform: 'Indeed'
        },
        {
            title: 'Full Stack Engineer',
            company: 'StartupInc',
            location: location || 'Remote',
            description: 'Node.js, React, and MySQL required.',
            url: 'https://example.com/job/2',
            platform: 'LinkedIn'
        }
    ];
};

exports.searchJobs = async (req, res) => {
    const { query, location } = req.query;
    const userId = req.user.id;

    try {
        // Fetch user profile for match scoring (handling if user_profiles table doesn't exist)
        let userProfile = {};
        try {
            const [profileRows] = await pool.query('SELECT * FROM user_profiles WHERE user_id = ?', [userId]);
            userProfile = profileRows[0] || {};
        } catch (dbErr) {
            console.warn('user_profiles table query failed, using default empty profile:', dbErr.message);
        }

        const jobs = await mockJobSearchAPI(query, location);
        const scoredJobs = [];
        
        for (let job of jobs) {
            // Calculate Match Score
            const matchScore = await aiService.calculateMatchScore(userProfile, job.description);
            job.match_score = matchScore;

            // Save job to DB (handling if jobs table doesn't exist)
            let jobId = Math.floor(Math.random() * 1000000);
            try {
                const [result] = await pool.query(
                    'INSERT INTO jobs (title, company, location, description, url, platform, match_score) VALUES (?, ?, ?, ?, ?, ?, ?)',
                    [job.title, job.company, job.location, job.description, job.url, job.platform, job.match_score]
                );
                jobId = result.insertId;
            } catch (dbErr) {
                console.warn('jobs table query failed (skipping DB caching):', dbErr.message);
            }
            
            job.id = jobId;
            scoredJobs.push(job);
        }

        res.json(scoredJobs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error searching jobs' });
    }
};

exports.getJobDetails = async (req, res) => {
    const jobId = req.params.id;

    try {
        const [rows] = await pool.query('SELECT * FROM jobs WHERE id = ?', [jobId]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Job not found' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.warn('jobs table fetch failed, returning mock job details:', error.message);
        res.json({
            id: jobId,
            title: 'Software Engineer',
            company: 'Tech Solutions',
            location: 'Remote',
            description: 'Full stack development role utilizing React, Node.js and MySQL database.',
            url: 'https://example.com/job/details',
            platform: 'Indeed',
            match_score: 85
        });
    }
};
