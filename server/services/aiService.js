// =====================================================================
// LevelUp AI Service — Elite Resume Analyzer & Roadmap Generator
// Uses Groq API with local heuristic algorithms as fallback
// =====================================================================
import { getGroqChatCompletion } from './groqService.js';

// ---- Industry keyword database organized by domain ----
const SKILL_DATABASE = {
  programming: {
    languages: ['java', 'python', 'javascript', 'typescript', 'c++', 'c#', 'go', 'rust', 'kotlin', 'swift', 'php', 'ruby', 'scala', 'r'],
    frameworks: ['react', 'angular', 'vue', 'next.js', 'express', 'spring boot', 'django', 'flask', 'node.js', 'nestjs', '.net', 'flutter', 'react native'],
    databases: ['mongodb', 'mysql', 'postgresql', 'redis', 'firebase', 'dynamodb', 'sqlite', 'oracle', 'cassandra', 'elasticsearch'],
    devops: ['docker', 'kubernetes', 'aws', 'azure', 'gcp', 'ci/cd', 'jenkins', 'github actions', 'terraform', 'nginx', 'linux'],
    tools: ['git', 'jira', 'figma', 'postman', 'vscode', 'webpack', 'babel', 'npm', 'yarn', 'rest api', 'graphql', 'websocket']
  },
  softSkills: ['communication', 'teamwork', 'leadership', 'problem solving', 'critical thinking', 'time management', 'adaptability', 'collaboration'],
  resumeSections: ['education', 'experience', 'projects', 'skills', 'certifications', 'achievements', 'internship', 'volunteer'],
  actionVerbs: ['developed', 'implemented', 'designed', 'built', 'created', 'optimized', 'improved', 'reduced', 'increased', 'managed', 'led', 'architected', 'deployed', 'automated', 'integrated', 'analyzed', 'resolved', 'delivered', 'mentored', 'collaborated'],
  quantifiers: ['%', 'percent', 'increased by', 'reduced by', 'improved', 'saving', 'users', 'customers', 'revenue', 'traffic', 'performance']
};

// ---- TF-IDF-inspired scoring for keyword relevance ----
const calculateTfIdf = (text, keywords) => {
  const words = text.toLowerCase().split(/\s+/);
  const totalWords = words.length;
  const found = [];
  
  for (const keyword of keywords) {
    const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    const matches = text.match(regex);
    if (matches) {
      const tf = matches.length / totalWords;
      // IDF approximation: rarer skills score higher
      const idf = Math.log(keywords.length / (1 + keywords.indexOf(keyword)));
      found.push({
        keyword,
        count: matches.length,
        score: parseFloat((tf * Math.abs(idf) * 100).toFixed(2))
      });
    }
  }
  
  return found.sort((a, b) => b.score - a.score);
};

// ---- Main Resume Analyzer ----
export const heuristicAnalyzeResume = (text) => {
  if (!text || text.trim().length < 50) {
    return {
      score: 0,
      error: 'Resume text is too short or empty. Please upload a valid PDF.',
      skills: [], strengths: [], weaknesses: [], missingKeywords: [], suggestions: [], sectionAnalysis: {}
    };
  }

  const textLower = text.toLowerCase();
  const wordCount = text.split(/\s+/).length;

  // 1. Flatten all technical keywords
  const allTechKeywords = [
    ...SKILL_DATABASE.programming.languages,
    ...SKILL_DATABASE.programming.frameworks,
    ...SKILL_DATABASE.programming.databases,
    ...SKILL_DATABASE.programming.devops,
    ...SKILL_DATABASE.programming.tools
  ];

  // 2. Find skills using TF-IDF
  const foundSkills = calculateTfIdf(text, allTechKeywords);
  const foundSkillNames = foundSkills.map(s => s.keyword);

  // 3. Check resume sections
  const sectionAnalysis = {};
  for (const section of SKILL_DATABASE.resumeSections) {
    sectionAnalysis[section] = textLower.includes(section);
  }
  const sectionsPresent = Object.values(sectionAnalysis).filter(Boolean).length;

  // 4. Check action verbs
  const actionVerbsFound = SKILL_DATABASE.actionVerbs.filter(v => textLower.includes(v));

  // 5. Check quantification
  const hasQuantifiers = SKILL_DATABASE.quantifiers.some(q => textLower.includes(q));

  // 6. Check soft skills
  const softSkillsFound = SKILL_DATABASE.softSkills.filter(s => textLower.includes(s));

  // ---- Composite Scoring Algorithm ----
  let score = 0;
  const maxScore = 100;

  // Technical skills (max 30 pts)
  const techScore = Math.min(30, foundSkills.length * 4);
  score += techScore;

  // Resume sections completeness (max 20 pts)
  const sectionScore = Math.min(20, (sectionsPresent / SKILL_DATABASE.resumeSections.length) * 20);
  score += sectionScore;

  // Action verbs usage (max 15 pts)
  const verbScore = Math.min(15, actionVerbsFound.length * 2.5);
  score += verbScore;

  // Quantification of achievements (max 10 pts)
  score += hasQuantifiers ? 10 : 0;

  // Word count / length appropriateness (max 10 pts — ideal: 300-800 words)
  if (wordCount >= 200 && wordCount <= 1000) score += 10;
  else if (wordCount >= 100) score += 5;

  // Soft skills (max 10 pts)
  const softScore = Math.min(10, softSkillsFound.length * 2.5);
  score += softScore;

  // Contact info detection (max 5 pts)
  const hasEmail = /[\w.-]+@[\w.-]+\.\w+/.test(text);
  const hasPhone = /[\d]{10}|(\+\d{1,3}[\s.-]?\d{3,})/.test(text);
  if (hasEmail) score += 2.5;
  if (hasPhone) score += 2.5;

  score = Math.round(Math.min(maxScore, score));

  // ---- Generate intelligent feedback ----
  const strengths = [];
  const weaknesses = [];
  const suggestions = [];

  // Strengths
  if (foundSkills.length >= 5) strengths.push(`Strong technical profile with ${foundSkills.length} relevant technologies identified`);
  if (actionVerbsFound.length >= 4) strengths.push(`Effective use of action verbs (${actionVerbsFound.slice(0, 5).join(', ')})`);
  if (hasQuantifiers) strengths.push('Achievements are quantified with measurable impact');
  if (sectionAnalysis.projects) strengths.push('Dedicated Projects section demonstrates hands-on experience');
  if (sectionAnalysis.experience || sectionAnalysis.internship) strengths.push('Work experience / internship section adds credibility');
  if (hasEmail && hasPhone) strengths.push('Contact information is complete and accessible');
  if (softSkillsFound.length >= 2) strengths.push(`Soft skills highlighted (${softSkillsFound.join(', ')})`);

  // Weaknesses
  if (foundSkills.length < 3) weaknesses.push('Very few technical skills detected — add relevant technologies');
  if (actionVerbsFound.length < 3) weaknesses.push('Weak action verbs — use power words like "Architected", "Deployed", "Optimized"');
  if (!hasQuantifiers) weaknesses.push('No measurable achievements — quantify impact (e.g., "Improved load time by 40%")');
  if (!sectionAnalysis.projects) weaknesses.push('Missing a dedicated "Projects" section — critical for freshers');
  if (!sectionAnalysis.certifications) weaknesses.push('No certifications mentioned — add relevant ones (AWS, Google, etc.)');
  if (wordCount < 150) weaknesses.push('Resume is too short — aim for 300-600 words for a 1-page resume');
  if (wordCount > 1000) weaknesses.push('Resume may be too long — keep it concise (1-2 pages)');
  if (!hasEmail) weaknesses.push('No email address detected');

  // Missing keywords
  const topMissing = allTechKeywords
    .filter(k => !foundSkillNames.includes(k))
    .slice(0, 8);

  // Personalized suggestions
  if (!sectionAnalysis.projects) {
    suggestions.push('Add a "Projects" section with 2-3 significant projects. Include tech stack, your role, and outcomes.');
  }
  if (!hasQuantifiers) {
    suggestions.push('Quantify your achievements: "Reduced API response time by 35%" or "Served 10K+ daily users".');
  }
  if (actionVerbsFound.length < 3) {
    suggestions.push('Start each bullet point with a strong action verb: Developed, Architected, Deployed, Optimized.');
  }
  if (foundSkills.length < 5) {
    suggestions.push(`Expand your skills section. Consider adding: ${topMissing.slice(0, 4).join(', ')}.`);
  }
  if (!sectionAnalysis.certifications) {
    suggestions.push('Add industry certifications (AWS Cloud Practitioner, Google Data Analytics, etc.) to stand out.');
  }
  if (softSkillsFound.length < 2) {
    suggestions.push('Weave soft skills into your experience descriptions rather than listing them generically.');
  }
  suggestions.push('Tailor your resume for each job application by mirroring keywords from the job description.');

  return {
    score,
    skills: foundSkills.map(s => ({ name: s.keyword, relevance: s.score })),
    skillNames: foundSkillNames,
    strengths: strengths.length > 0 ? strengths : ['Resume uploaded successfully'],
    weaknesses: weaknesses.length > 0 ? weaknesses : ['No major issues detected'],
    missingKeywords: topMissing,
    suggestions,
    sectionAnalysis,
    metadata: {
      wordCount,
      techSkillCount: foundSkills.length,
      actionVerbCount: actionVerbsFound.length,
      softSkillCount: softSkillsFound.length,
      hasEmail,
      hasPhone,
      sectionsFound: sectionsPresent
    }
  };
};


// ---- AI Roadmap Generator (Heuristic Decision Tree) ----
export const heuristicGenerateRoadmap = (profile) => {
  const { skills = [], resumeScore = 0, quizScores = {}, targetRole = 'SDE', targetMonths = 3 } = profile;

  const roadmap = { phases: [], targetRole, totalMonths: targetMonths };

  // Determine skill gaps
  const coreForSDE = ['javascript', 'react', 'node.js', 'mongodb', 'git', 'docker', 'sql', 'rest api'];
  const coreForDataScience = ['python', 'sql', 'pandas', 'numpy', 'machine learning', 'statistics', 'tensorflow'];
  const coreForDevOps = ['docker', 'kubernetes', 'aws', 'linux', 'ci/cd', 'terraform', 'jenkins'];

  let targetSkills;
  switch (targetRole.toLowerCase()) {
    case 'data science': targetSkills = coreForDataScience; break;
    case 'devops': targetSkills = coreForDevOps; break;
    default: targetSkills = coreForSDE;
  }

  const knownSkills = skills.map(s => s.toLowerCase());
  const gaps = targetSkills.filter(s => !knownSkills.includes(s));
  const strongSkills = targetSkills.filter(s => knownSkills.includes(s));

  // Phase 1: Foundation (Month 1 or first third)
  const phase1End = Math.max(1, Math.floor(targetMonths / 3));
  roadmap.phases.push({
    name: 'Foundation & Core Skills',
    months: `Month 1–${phase1End}`,
    tasks: [
      ...(resumeScore < 60 ? ['Rebuild your resume using the AI Resume Analyzer to reach 75+ score'] : []),
      ...gaps.slice(0, 3).map(skill => `Learn ${skill} — complete tutorials and build a mini project`),
      'Solve 30 aptitude problems (logical reasoning + quantitative)',
      'Practice 2 mock interviews focusing on self-introduction and HR questions'
    ],
    priority: 'HIGH'
  });

  // Phase 2: Building (Middle third)
  const phase2End = Math.max(2, Math.floor(targetMonths * 2 / 3));
  roadmap.phases.push({
    name: 'Project Building & Deep Dive',
    months: `Month ${phase1End + 1}–${phase2End}`,
    tasks: [
      ...gaps.slice(3, 6).map(skill => `Master ${skill} with intermediate-level projects`),
      'Build 1 full-stack portfolio project (e.g., a CRUD app with auth)',
      'Solve 50+ DSA problems on LeetCode (Arrays, Strings, Trees, Graphs)',
      'Record and review 3 mock interviews analyzing filler words and pace',
      'Get your resume reviewed by peers and iterate'
    ],
    priority: 'MEDIUM'
  });

  // Phase 3: Polish & Apply (Final third)
  roadmap.phases.push({
    name: 'Interview Prep & Application Sprint',
    months: `Month ${phase2End + 1}–${targetMonths}`,
    tasks: [
      'Complete 5+ full mock interviews with feedback',
      'Apply to 15–20 companies per week with tailored resumes',
      'Practice system design basics (for SDE-2+ roles)',
      'Solve 2 DSA problems daily for consistency',
      'Participate in at least 1 hackathon or coding competition',
      ...(strongSkills.length >= 3 ? ['Showcase your expertise in ' + strongSkills.slice(0, 2).join(' & ') + ' during interviews'] : [])
    ],
    priority: 'CRITICAL'
  });

  // Weekly plan for current phase
  roadmap.weeklyPlan = {
    monday: 'DSA Practice (1 hour) + Resume Polish',
    tuesday: 'Core Skill Learning (2 hours)',
    wednesday: 'Project Building (2 hours)',
    thursday: 'Aptitude Practice (1 hour) + Mock Interview',
    friday: 'Core Skill Learning (2 hours)',
    saturday: 'Full Project Sprint (3 hours)',
    sunday: 'Review + Plan Next Week'
  };
  roadmap.gapAnalysis = {
    skillsToLearn: gaps,
    currentStrengths: strongSkills,
    estimatedReadiness: strongSkills.length >= targetSkills.length * 0.6 ? 'On Track' : 'Needs Focus'
  };

  return roadmap;
};

// ---- Groq AI Wrappers ----
export const analyzeResume = async (text, jobTitle, companyName) => {
  try {
    const prompt = `You are an elite technical recruiter with 20+ years of experience at FAANG companies, top-tier startups, and Fortune 500 firms. You have screened over 100,000 resumes and know exactly what causes instant rejection vs. shortlisting.

Your task: analyze the resume text below against the provided job title (${jobTitle || 'Target Role'}) and company (${companyName || 'Target Company'}). Return ONLY a valid JSON object — no preamble, no markdown fences, no explanation outside the JSON.

Scoring philosophy:
- Be a strict, unforgiving grader. Reserve 85–100 for truly exceptional resumes.
- A score of 70 means "would get a second look." Below 50 means "instant reject pile."
- Every score must have specific, evidence-based reasoning tied to actual text in the resume.
- Penalize harshly for: vague language, no quantified results, missing contact info, inconsistent dates, unexplained gaps, generic objective statements, and skills listed without demonstrated use.

Evaluate on these 5 dimensions:
1. Tone
2. Content
3. Structure
4. ATS
5. Skills

CRITICAL REQUIREMENT FOR FEEDBACK:
- You MUST provide AT LEAST 3 to 5 highly specific tips for EACH dimension (toneAndStyle, content, structure, skills).
- For each tip's "explanation" field, be extremely detailed. Explain the exact issue, cite specific examples from the resume, and provide exact actionable advice on how to fix it. Do not give generic advice. Aim for 2-4 comprehensive sentences per explanation.

The JSON must have this exact structure:
{
  "basicSummary": "A detailed 4-5 sentence professional summary evaluating the candidate's overall profile based on the resume.",
  "overallScore": (number 1-100),
  "toneAndStyle": { "score": (number), "tips": [{"type": "good"|"improve", "tip": "Short summary", "explanation": "Detailed 2-4 sentence deep dive citing specifics"}] },
  "content": { "score": (number), "tips": [{"type": "good"|"improve", "tip": "Short summary", "explanation": "Detailed 2-4 sentence deep dive citing specifics"}] },
  "structure": { "score": (number), "tips": [{"type": "good"|"improve", "tip": "Short summary", "explanation": "Detailed 2-4 sentence deep dive citing specifics"}] },
  "skills": { "score": (number), "tips": [{"type": "good"|"improve", "tip": "Short summary", "explanation": "Detailed 2-4 sentence deep dive citing specifics"}], "found": ["skill1", "skill2"] },
  "ats": { "score": (number), "tips": [{"type": "good"|"improve", "tip": "Short summary", "explanation": "Detailed explanation"}], "suggestedKeywords": ["keyword1", "keyword2", "keyword3"] },
  "weakBullets": ["bullet1", "bullet2"],
  "rewrittenBullets": ["rewritten1", "rewritten2"]
}

Limit output strictly to valid JSON without markdown wrapping.

Resume Text:
${text}`;

    const response = await getGroqChatCompletion([{ role: "user", content: prompt }], true, 0.1);
    let result;
    try {
      result = JSON.parse(response);
    } catch (e) {
      // Clean markdown if Groq returns it in \`\`\`json block
      const cleanJson = response.replace(/```json/g, '').replace(/```/g, '').trim();
      result = JSON.parse(cleanJson);
    }
    
    // Add default shape mappings expected by frontend including legacy ones for roadmap
    return {
      overallScore: result.overallScore || 50,
      score: result.overallScore || 50,
      toneAndStyle: result.toneAndStyle || { score: 50, tips: [] },
      content: result.content || { score: 50, tips: [] },
      structure: result.structure || { score: 50, tips: [] },
      skills: {
          score: result.skills?.score || 50,
          tips: result.skills?.tips || [],
          // Keep array format mapping for compatibility
          ...(result.skillNames ? result.skillNames.map(s => ({ name: s, relevance: 80 })) : [])
      },
      ATS: result.ats || result.ATS || { score: 50, tips: [] },
      skillNames: result.skillNames || result.skills?.found || [],
      missingKeywords: result.missingKeywords || [],
      metadata: {}
    };
  } catch (error) {
    console.warn("Groq Resume analysis failed, using heuristic fallback...", error.message);
    const heuristic = heuristicAnalyzeResume(text);
    return {
      ...heuristic,
      overallScore: heuristic.score,
      toneAndStyle: { score: heuristic.score, tips: [{type: 'improve', tip: 'Use Groq', explanation: 'AI was disabled, using heuristics'}] },
      content: { score: heuristic.score, tips: [] },
      structure: { score: heuristic.score, tips: [] },
      skills: { score: heuristic.score, tips: [] },
      ATS: { score: heuristic.score, tips: [] },
    }
  }
};

export const generateRoadmap = async (profile) => {
  try {
    const prompt = `You are an elite, world-class technical career coach. Your task is to generate a highly specific, phase-by-phase learning roadmap.
    
Target Role: ${profile.targetRole}
Timeline: ${profile.targetMonths} months
Current Experience Level: ${profile.experienceLevel}
Known Skills: ${profile.skills.join(', ') || 'None declared'}
Specific Goals / User Focus Areas: ${profile.specificGoals || 'None declared'}

REQUIREMENTS:
1. Act like the industry-standard 'roadmap.sh' guides. Structure your response based on the absolute best-practices for this specific role in the modern tech ecosystem.
2. Tailor the complexity and fundamental depth to the user's "Current Experience Level". (If Beginner, focus heavily on basics. If Advanced, skip trivial concepts and focus on architecture/scaling/deep dives).
3. If "Specific Goals" are declared, YOU MUST weave them prominently into the plan and address them directly.
4. Output STRICTLY as a valid JSON object matching the requested schema. No markdown formatting (\`\`\`json) outside the brackets.

JSON SCHEMA:
{
  "phases": [
    { "name": "Phase 1: [Descriptive Name]", "months": "Month 1", "tasks": ["Task 1 (be incredibly specific)", "Task 2"], "priority": "HIGH|MEDIUM|CRITICAL" }
  ],
  "weeklyPlan": {
    "monday": "Specific routine for Monday",
    "tuesday": "...",
    "wednesday": "...",
    "thursday": "...",
    "friday": "...",
    "saturday": "...",
    "sunday": "..."
  },
  "gapAnalysis": {
    "skillsToLearn": ["skill1", "skill2"],
    "currentStrengths": ["skill3"],
    "estimatedReadiness": "On Track | Needs Focus | Advanced"
  }
}`;

    const response = await getGroqChatCompletion([{ role: "user", content: prompt }], true);
    const result = JSON.parse(response);
    return {
      targetRole: profile.targetRole,
      totalMonths: profile.targetMonths,
      phases: result.phases || [],
      weeklyPlan: result.weeklyPlan || {},
      gapAnalysis: result.gapAnalysis || {}
    };
  } catch (error) {
    console.warn("Groq Roadmap generation failed, using heuristic fallback...", error.message);
    return heuristicGenerateRoadmap(profile);
  }
};

