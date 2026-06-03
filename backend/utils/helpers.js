const jwt = require('jsonwebtoken');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// Neural Matching Engine
const calculateAIMatch = async (job, candidate) => {
  const jobSkills = (job.skills || []).map(s => s.toLowerCase());
  const candidateSkills = (candidate.skills || []).map(s => s.toLowerCase());

  // 1. Basic Algorithmic Matching (Fast)
  const matchedSkills = jobSkills.filter(s => candidateSkills.includes(s));
  const skillsScore = jobSkills.length > 0 ? (matchedSkills.length / jobSkills.length) * 100 : 50;

  const jobExpYears = job.experienceYears || 0;
  const candidateExpYears = (candidate.experience || []).reduce((acc, exp) => {
    if (exp.from) {
      const to = exp.to || new Date();
      const years = (new Date(to) - new Date(exp.from)) / (1000 * 60 * 60 * 24 * 365);
      return acc + years;
    }
    return acc;
  }, 0);
  
  const expDiff = Math.abs(candidateExpYears - jobExpYears);
  const expScore = Math.max(0, 100 - expDiff * 15);

  const locationScore =
    job.isRemote || !job.location || !candidate.location ? 90 :
    job.location.toLowerCase().includes(candidate.location.toLowerCase()) ||
    candidate.location.toLowerCase().includes(job.location.toLowerCase()) ? 95 : 60;

  const baseScore = Math.round(skillsScore * 0.5 + expScore * 0.3 + locationScore * 0.2);

  // 2. Deep Semantic Analysis (Slow, requires Gemini)
  let aiInsights = { strengths: [], gaps: [], recommendation: '' };

  if (process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== 'your_anthropic_api_key') {
    try {
      const { Anthropic } = require('@anthropic-ai/sdk');
      const anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });

      const prompt = `Analyze the fit between this job and candidate.
      JOB: ${job.title}, Requirements: ${job.skills.join(', ')}. Description: ${job.description.substring(0, 500)}
      CANDIDATE: Skills: ${candidate.skills.join(', ')}. Experience: ${JSON.stringify(candidate.experience)}
      
      Return ONLY a raw JSON object (no markdown, no backticks, no extra text) with the following exact structure:
      {
        "score_adjustment": number (between -10 and 10),
        "strengths": ["string", "string"],
        "gaps": ["string", "string"],
        "recommendation": "string"
      }`;

      const response = await anthropic.messages.create({
        model: "claude-3-haiku-20240307", // Using Haiku for faster matching
        max_tokens: 1024,
        messages: [
          { role: "user", content: prompt }
        ]
      });

      const text = response.content[0].text;
      const parsed = JSON.parse(text.replace(/```json|```/g, '').trim());
      
      aiInsights.strengths = parsed.strengths;
      aiInsights.gaps = parsed.gaps;
      aiInsights.recommendation = parsed.recommendation;
      // Adjust base score with AI nuance
      aiInsights.score = Math.min(99, Math.max(10, baseScore + (parsed.score_adjustment || 0)));
    } catch (error) {
      console.error('Claude AI Matching Error:', error);
    }
  }

  // Fallback if AI fails or is disabled
  if (aiInsights.strengths.length === 0) {
    if (skillsScore >= 70) aiInsights.strengths.push(`Strong skill overlap detected.`);
    if (expScore >= 70) aiInsights.strengths.push('Experience level is highly compatible.');
    if (locationScore >= 80) aiInsights.strengths.push('Optimal location alignment.');
    
    if (skillsScore < 50) aiInsights.gaps.push(`Missing core skills required for this role.`);
    
    aiInsights.score = Math.min(99, Math.max(10, baseScore));
    aiInsights.recommendation = aiInsights.score >= 75 ? 'Highly recommended' : 'Review for potential fit';
  }

  return {
    ...aiInsights,
    skillsMatch: Math.round(skillsScore),
    experienceMatch: Math.round(expScore),
    overallFit: aiInsights.score >= 75 ? 'Excellent Fit' : aiInsights.score >= 55 ? 'Good Fit' : 'Partial Fit'
  };
};

const getPlanFeatures = (plan) => {
  const plans = {
    FREE: { jobPostings: 3, aiMatching: false, advancedAnalytics: false, prioritySupport: false },
    PRO: { jobPostings: 25, aiMatching: true, advancedAnalytics: true, prioritySupport: false },
    ENTERPRISE: { jobPostings: -1, aiMatching: true, advancedAnalytics: true, prioritySupport: true, apiAccess: true }
  };
  return plans[plan] || plans.FREE;
};

module.exports = { generateToken, calculateAIMatch, getPlanFeatures };
