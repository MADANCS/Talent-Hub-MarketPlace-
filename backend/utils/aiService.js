const { GoogleGenerativeAI } = require("@google/generative-ai");
const Anthropic = require('@anthropic-ai/sdk');
const pdf = require("pdf-parse");

const parseResumeWithAI = async (fileBuffer) => {
  try {
    // 1. Extract text from PDF
    const data = await pdf(fileBuffer);
    const resumeText = data.text;

    // 2. Initialize Gemini AI
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key') {
      console.warn("⚠️ GEMINI_API_KEY not configured. Falling back to mock parsing.");
      return mockParse(resumeText);
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
      You are an expert HR Resume Parser. Extract the following information from the resume text in JSON format:
      - name (string)
      - email (string)
      - phone (string)
      - location (string)
      - bio (string - short professional summary)
      - skills (array of strings)
      - experience (array of objects with title, company, location, from, to, current, description)
      - education (array of objects with degree, institution, field, from, to, grade)

      Resume Text:
      ${resumeText}
      
      Return ONLY the JSON.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON safely
    const jsonStr = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
    return JSON.parse(jsonStr);

  } catch (error) {
    console.error("AI Resume Parsing Error:", error);
    throw new Error("Failed to parse resume: " + error.message);
  }
};

const mockParse = (text) => {
  // Simple fallback for demo without API key
  return {
    name: "Extracted Name",
    email: "extracted@email.com",
    skills: ["JavaScript", "React", "Node.js", "Express", "MongoDB"],
    bio: "Experienced Full-Stack Developer with a focus on modern web technologies.",
    experience: [{ title: "Software Engineer", company: "Tech Solutions", from: "2020-01-01", current: true, description: "Developing scalable applications." }],
    education: [{ degree: "B.Tech", institution: "University of Technology", field: "Computer Science" }]
  };
};

const analyzeSkillGap = async (user, job) => {
  try {
    if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'your_anthropic_api_key') {
      console.warn("⚠️ ANTHROPIC_API_KEY not configured. Falling back to mock analysis.");
      return mockSkillGap(user, job);
    }

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const prompt = `
      You are an expert technical recruiter and career coach.
      Analyze the skill gap between this candidate and this job requirement.
      
      Candidate Skills: ${user.skills.join(', ')}
      Candidate Experience: ${user.experience.map(e => e.title).join(', ')}
      
      Job Title: ${job.title}
      Job Required Skills: ${job.skills.join(', ')}
      
      Provide a highly concise response in JSON format with exactly three fields:
      - "matchScore": an integer between 0 and 100
      - "missingSkills": an array of strings representing the key skills the candidate lacks
      - "learningPath": a short 2-3 sentence recommendation on how to bridge the gap.
      
      Return ONLY the JSON.
    `;

    const msg = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 400,
      messages: [{ role: "user", content: prompt }]
    });

    const text = msg.content[0].text;
    const jsonStr = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Claude Skill Gap Error:", error);
    return mockSkillGap(user, job); // Fallback on failure
  }
};

const mockSkillGap = (user, job) => {
  const missing = job.skills.filter(s => !user.skills.includes(s));
  const score = Math.max(20, 100 - (missing.length * 15));
  return {
    matchScore: score,
    missingSkills: missing.slice(0, 3),
    learningPath: "Consider taking a crash course in the missing technologies to bolster your profile."
  };
};

const generateInterviewQuestion = async (context) => {
  try {
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key') {
      console.warn("⚠️ GEMINI_API_KEY not configured. Falling back to mock question.");
      return mockQuestion();
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
      You are an elite technical interviewer at a top-tier tech company. 
      Based on the following context, generate ONE insightful and challenging interview question.
      
      Context: ${context || 'General software engineering interview'}
      
      The question should be:
      1. Specific to the context provided.
      2. Designed to test both technical depth and problem-solving mindset.
      3. Conversational yet professional.
      
      Return ONLY the question text.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();

  } catch (error) {
    console.error("AI Interview Question Error:", error);
    return mockQuestion();
  }
};

const mockQuestion = () => {
  const questions = [
    "How do you ensure the scalability of a distributed system when dealing with sudden traffic spikes?",
    "Can you explain the trade-offs between using a NoSQL database vs a traditional SQL database for a real-time messaging app?",
    "Describe a time you had to optimize a piece of code that was causing performance bottlenecks. What was your approach?",
    "How do you approach state management in large-scale frontend applications?"
  ];
  return questions[Math.floor(Math.random() * questions.length)];
};

const generateCodingChallenge = async (context) => {
  try {
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key') {
      console.warn("⚠️ GEMINI_API_KEY not configured. Falling back to mock challenge.");
      return mockChallenge();
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
      You are an elite technical interviewer. Generate a coding challenge for a candidate.
      
      Context: ${context || 'General software engineering'}
      
      Return a JSON object with exactly:
      - "title": (string) A catchy title for the challenge.
      - "description": (string) A clear problem statement with examples.
      - "initialCode": (string) Boilerplate code to start with.
      
      Return ONLY the JSON.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const jsonStr = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
    return JSON.parse(jsonStr);

  } catch (error) {
    console.error("AI Coding Challenge Error:", error);
    return mockChallenge();
  }
};

const mockChallenge = () => {
  return {
    title: "Array Manipulation",
    description: "Write a function that takes an array and returns a new array with all duplicates removed, maintaining the original order.",
    initialCode: "function removeDuplicates(arr) {\n  // Your code here\n}"
  };
};

const synthesizeInterviewVerdict = async (candidate, job, interviews, recruiterNotes) => {
  try {
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key') {
      console.warn("⚠️ GEMINI_API_KEY not configured. Falling back to mock synthesis.");
      return mockVerdict();
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
      You are an elite talent acquisition consultant. Synthesize a "Candidate Verdict" based on the following interview history.
      
      Candidate: ${candidate.name} (${candidate.skills.join(', ')})
      Job: ${job.title} at ${job.company}
      
      Interviews & Human Feedback:
      ${interviews.map(i => `- ${i.type}: Rating ${i.rating}/5. Feedback: ${i.feedback}`).join('\n')}
      Overall Recruiter Notes: ${recruiterNotes}
      
      Provide a highly professional summary in JSON format with exactly:
      - "summary": (string) A 3-sentence executive summary of the candidate's performance and fit.
      - "verdict": (string: "HIRE", "CONSIDER", "REJECT")
      - "confidence": (integer 0-100)
      - "keyStrengths": (array of strings)
      - "potentialRisks": (array of strings)
      
      Return ONLY the JSON.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const jsonStr = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
    return JSON.parse(jsonStr);

  } catch (error) {
    console.error("AI Verdict Synthesis Error:", error);
    return mockVerdict();
  }
};

const mockVerdict = () => {
  return {
    summary: "The candidate demonstrated strong technical depth in core technologies. While soft skills were adequate, their ability to solve complex algorithmic problems stood out during the technical rounds.",
    verdict: "CONSIDER",
    confidence: 85,
    keyStrengths: ["Technical Depth", "Problem Solving", "Core Architecture Knowledge"],
    potentialRisks: ["Communication Overhead", "Limited Experience with Scale"]
  };
};

const analyzeInterviewCode = async (code, question) => {
  try {
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key') {
      console.warn("⚠️ GEMINI_API_KEY not configured. Falling back to mock code analysis.");
      return mockCodeAnalysis();
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
      You are an elite technical interviewer. Analyze the following code solution provided for an interview question.
      
      Question/Challenge: ${question || 'General coding task'}
      Code:
      ${code}
      
      Provide a detailed technical review in JSON format with:
      - "rating": (integer 0-10)
      - "complexity": (string e.g. "O(n) time, O(1) space")
      - "strengths": (array of strings)
      - "improvements": (array of strings)
      - "verdict": (string 1-sentence overall impression)
      
      Return ONLY the JSON.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const jsonStr = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
    return JSON.parse(jsonStr);

  } catch (error) {
    console.error("AI Code Analysis Error:", error);
    return mockCodeAnalysis();
  }
};

const mockCodeAnalysis = () => {
  return {
    rating: 8,
    complexity: "O(n log n) time, O(n) space",
    strengths: ["Clean logic", "Proper variable naming", "Handles edge cases"],
    improvements: ["Could optimize sorting", "Add more comments for readability"],
    verdict: "Solid implementation with a clear understanding of the problem constraints."
  };
};

module.exports = { 
  parseResumeWithAI, 
  analyzeSkillGap, 
  generateInterviewQuestion, 
  generateCodingChallenge,
  synthesizeInterviewVerdict,
  analyzeInterviewCode
};

