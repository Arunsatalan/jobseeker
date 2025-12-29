const axios = require('axios');
const logger = require('../utils/logger');

class AIService {
    constructor() {
        // Use OpenAI GPT-4 API key from environment variables (paid API)
        this.apiKey = process.env.OPENAI_API_KEY || process.env.chatgpt_api_key;
        this.apiUrl = 'https://api.openai.com/v1/chat/completions';
        // Use GPT-4 Turbo for best quality analysis with paid API
        this.model = process.env.OPENAI_MODEL || 'gpt-4-turbo-preview';
    }

    /**
     * Analyze user profile against job requirements using Grok AI
     * @param {any} userProfile - User profile data (from JobSeeker, Resume, User collections)
     * @param {any} job - Job details
     * @returns {Promise<any>} AI analysis results
     */
    /**
     * Analyze user profile against job requirements using Grok AI or Local Heuristic Fallback
     */
    async analyzeProfileMatch(userProfile, job) {
        try {
            if (!this.apiKey) {
                logger.warn('⚠️ No OpenAI API key found, using Local Intelligent Analysis');
                return this.generateLocalAnalysis(userProfile, job);
            }

            logger.info('🚀 Calling GPT-4 for comprehensive profile analysis with paid API');
            const prompt = this.buildProfileAnalysisPrompt(userProfile, job);

            const response = await axios.post(
                this.apiUrl,
                {
                    model: this.model,
                    messages: [
                        {
                            role: 'system',
                            content: `You are an elite career strategist and recruitment expert with deep knowledge of ATS systems, hiring practices, and industry requirements. 

Analyze the provided candidate data against job requirements with extreme precision:
- Evaluate EXACT skill matches and quantify proficiency levels
- Identify hidden transferable skills from experience descriptions
- Assess cultural and role fit based on career trajectory
- Provide ACTIONABLE, specific improvements (not generic advice)
- Consider both technical skills AND soft skills relevance
- Rate match percentage based on: 40% hard skills, 30% experience relevance, 20% education/certifications, 10% career progression

Return analysis in pure JSON format with detailed, evidence-based insights.`
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    temperature: 0.3,
                    max_tokens: 3000,
                    response_format: { type: 'json_object' }
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            const analysis = JSON.parse(response.data.choices[0].message.content);
            logger.info('✅ GPT-4 profile analysis completed successfully');
            return analysis;
        } catch (error) {
            const err = error;
            const openAIError = err.response?.data?.error;

            if (openAIError?.message?.includes('quota') || openAIError?.message?.includes('insufficient') || err.message?.includes('401')) {
                logger.warn('⚠️ OpenAI API Credits/Auth issues detected. Falling back to Local Heuristic Analysis.');
                return this.generateLocalAnalysis(userProfile, job);
            }

            logger.error(`❌ GPT-4 Analysis failed: ${err.message}`);
            // If it's a non-quota error, we still try local analysis to keep the app working
            return this.generateLocalAnalysis(userProfile, job);
        }
    }

    /**
     * Generate optimized resume suggestions using Grok AI or Local Fallback
     */
    async optimizeResume(userProfile, job) {
        try {
            if (!this.apiKey) return this.generateLocalOptimization(userProfile, job);

            const prompt = this.buildResumeOptimizationPrompt(userProfile, job);

            const response = await axios.post(
                this.apiUrl,
                {
                    model: this.model,
                    messages: [
                        {
                            role: 'system',
                            content: `You are a master resume optimizer and ATS specialist with 15+ years experience.

Your expertise includes:
- Reverse-engineering ATS algorithms to ensure 95%+ parse rates
- Keyword density optimization without keyword stuffing
- Action verb selection for maximum impact (Led, Architected, Spearheaded, etc.)
- Quantification strategies (ROI, %, time saved, scale)
- Format optimization for both human reviewers and parsing systems
- Industry-specific terminology and buzzwords

Provide specific, actionable optimizations in JSON format. Every suggestion must be measurable and implementable.`
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    temperature: 0.4,
                    max_tokens: 2500,
                    response_format: { type: 'json_object' }
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return JSON.parse(response.data.choices[0].message.content);
        } catch (error) {
            logger.warn('⚠️ Resume Optimization falling back to Local Heuristic');
            return this.generateLocalOptimization(userProfile, job);
        }
    }

    /**
     * Generate personalized cover letter using Grok AI or Local Fallback
     */
    async generateCoverLetter(userProfile, job) {
        try {
            if (!this.apiKey) return this.generateLocalCoverLetter(userProfile, job);

            const prompt = this.buildCoverLetterPrompt(userProfile, job);

            const response = await axios.post(
                this.apiUrl,
                {
                    model: this.model,
                    messages: [
                        {
                            role: 'system',
                            content: `You are a highly skilled professional writer and career coach specializing in cover letters.

Your cover letters:
- Hook the reader in the first sentence with genuine enthusiasm
- Demonstrate deep research about the company
- Connect specific achievements to job requirements (with numbers/metrics when possible)
- Show personality while maintaining professionalism
- End with a confident, action-oriented closing
- Are concise (250-350 words maximum)
- Avoid clichés and generic phrases
- Use the candidate's REAL experience and achievements

Write a compelling, personalized cover letter that makes the hiring manager want to interview this candidate.`
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 1200
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return response.data.choices[0].message.content.trim();
        } catch (error) {
            logger.warn('⚠️ Cover Letter generation falling back to Local Heuristic');
            return this.generateLocalCoverLetter(userProfile, job);
        }
    }

    /**
     * Local Heuristic Analyzer - Uses real data to calculate matches without API calls
     */
    generateLocalAnalysis(userProfile, job) {
        const userSkills = (userProfile.skills || []).map(s => s.toLowerCase());
        const jobSkills = (job.skills || []).map(s => s.toLowerCase());

        const matches = jobSkills.filter(skill => userSkills.includes(skill));
        const missing = jobSkills.filter(skill => !userSkills.includes(skill));

        const matchPercentage = jobSkills.length > 0
            ? Math.round((matches.length / jobSkills.length) * 100)
            : 50;

        const strengths = [
            `Strong alignment with core technologies like ${matches.slice(0, 2).join(', ') || 'essential skills'}`,
            userProfile.experience?.length > 0 ? `Demonstrated professional experience (${userProfile.experience.length} roles found)` : 'Willingness to apply existing knowledge to this domain',
            userProfile.projects?.length > 0 ? `Rich project portfolio with ${userProfile.projects.length} relevant entries` : 'Focused professional summary aligning with job title'
        ];

        return {
            matchPercentage,
            strengths: strengths.slice(0, 3),
            improvements: missing.length > 0
                ? [`Focus on acquiring or highlighting ${missing.slice(0, 2).join(' and ')}`, 'Quantify results in your experience section', 'Align project descriptions with industry keywords']
                : ['Add more specific certifications', 'Highlight leadership roles', 'Include links to live demos'],
            suggestedSkills: missing.slice(0, 4),
            detailedAnalysis: `Based on a deep scan of ${userProfile.name}'s profile and ${job.company}'s requirements, we found a ${matchPercentage}% technical overlap. The candidate shows strong proficiency in ${matches.join(', ') || 'base skills'}, but should address gaps in ${missing.slice(0, 2).join(', ') || 'niche areas'} to become a top-tier applicant.`
        };
    }

    generateLocalOptimization(userProfile, job) {
        return {
            optimizedSummary: `Dedicated professional with expertise in ${userProfile.skills?.slice(0, 3).join(', ') || 'relevant fields'}, seeking to leverage experience at ${job.company} as a ${job.title}.`,
            keywordSuggestions: job.skills?.slice(0, 5) || [],
            experienceImprovements: ["Use action verbs (e.g., Led, Developed, Optimized)", "Include metrics like percentages or dollar amounts", "Highlight technology stack for each role"],
            skillsToHighlight: userProfile.skills?.slice(0, 5) || [],
            formattingTips: ["Use a clean, single-column layout", "Ensure contact info is prominently displayed", "Use standard section headings for ATS"],
            atsScore: 75
        };
    }

    generateLocalCoverLetter(userProfile, job) {
        return `Dear ${job.company} Hiring Team,

I am writing to express my strong interest in the ${job.title} position. With my background in ${userProfile.skills?.slice(0, 2).join(' and ') || 'the industry'}, I am confident that I can contribute significantly to your team.

My experience includes ${userProfile.experience?.[0]?.split(':')[0] || 'various professional roles'} where I consistently delivered high-quality results. I am particularly drawn to ${job.company} because of your reputation in the ${job.industry || 'field'}.

Thank you for your time and consideration. I look forward to the possibility of discussing how my skills and experiences can benefit your organization.

Sincerely,
${userProfile.name}`;
    }

    /**
     * Build prompt for profile analysis
     */
    buildProfileAnalysisPrompt(userProfile, job) {
        return `Conduct a comprehensive career-fit analysis between this candidate and job opportunity.

═══════════════════════════════════════════════════
📋 CANDIDATE PROFILE (Real Data from Resume & Profile)
═══════════════════════════════════════════════════
👤 Name: ${userProfile.name || 'N/A'}

💼 PROFESSIONAL SUMMARY:
${userProfile.summary || 'No summary provided'}

🎯 CORE SKILLS (${userProfile.skills?.length || 0} total):
${userProfile.skills?.join(', ') || 'N/A'}

💻 WORK EXPERIENCE:
${userProfile.experience?.map((exp, i) => `${i + 1}. ${exp}`).join('\n') || 'N/A'}

🎓 EDUCATION:
${userProfile.education?.join('\n') || 'N/A'}

🚀 PROJECTS:
${userProfile.projects?.join('\n') || 'N/A'}

🏆 CERTIFICATIONS:
${userProfile.certifications?.join('\n') || 'N/A'}

🌐 LANGUAGES:
${userProfile.languages?.join(', ') || 'N/A'}

═══════════════════════════════════════════════════
🎯 TARGET JOB REQUIREMENTS
═══════════════════════════════════════════════════
🏢 Company: ${job.company}
📌 Position: ${job.title}
📍 Location: ${job.location || 'N/A'}

🔧 REQUIRED SKILLS:
${job.skills?.join(', ') || 'N/A'}

📝 KEY REQUIREMENTS:
${job.requirements?.join('\n- ') || 'N/A'}

📄 JOB DESCRIPTION:
${job.description || 'N/A'}

💰 SALARY RANGE:
${job.salary || 'Not disclosed'}

═══════════════════════════════════════════════════
🤖 ANALYSIS INSTRUCTIONS
═══════════════════════════════════════════════════

Perform a deep, evidence-based analysis:

1. **Match Percentage (0-100)**: Calculate based on:
   - Hard Skills Match: 40% weight (exact tech/tool matches)
   - Experience Relevance: 30% weight (similar roles, industries, responsibilities)
   - Education/Certs: 20% weight (degree relevance, certifications)
   - Career Trajectory: 10% weight (progression toward this role)

2. **Strengths (3-5 items)**: Identify SPECIFIC advantages citing:
   - Exact skill/experience matches from the data
   - Quantifiable achievements (if present in experience)
   - Unique qualifications or standout projects
   - Cultural/industry fit indicators

3. **Improvements (3-5 items)**: Provide ACTIONABLE gaps:
   - Missing hard skills with priority ranking
   - Experience gaps (e.g., "No cloud deployment experience shown")
   - Resume presentation issues
   - Specific certifications that would help

4. **Suggested Skills (3-5 items)**: List SPECIFIC technologies/skills to acquire:
   - Technologies mentioned in job but missing from profile
   - Industry-standard tools for this role
   - Complementary skills that enhance candidacy

5. **Detailed Analysis (1-2 paragraphs)**: Synthesize:
   - Overall fit assessment
   - Likelihood of passing ATS screening
   - Key selling points for this specific role
   - Honest assessment of competitiveness

═══════════════════════════════════════════════════

Return ONLY valid JSON in this EXACT format:
{
  "matchPercentage": <integer 0-100>,
  "strengths": ["<specific strength 1>", "<specific strength 2>", ...],
  "improvements": ["<actionable improvement 1>", "<actionable improvement 2>", ...],
  "suggestedSkills": ["<skill 1>", "<skill 2>", ...],
  "detailedAnalysis": "<professional 2-paragraph assessment>"
}`;
    }

    /**
     * Build prompt for resume optimization
     */
    buildResumeOptimizationPrompt(userProfile, job) {
        return `You are optimizing a resume for ATS systems and human reviewers. Provide specific, implementable suggestions.

═══════════════════════════════════════════════════
📋 CURRENT RESUME DATA
═══════════════════════════════════════════════════
Name: ${userProfile.name || 'N/A'}

Summary/Objective:
${userProfile.summary || 'N/A'}

Skills Listed:
${userProfile.skills?.join(', ') || 'N/A'}

Experience Section:
${userProfile.experience?.map((exp, i) => `${i + 1}. ${exp}`).join('\n') || 'N/A'}

Education:
${userProfile.education?.join('\n') || 'N/A'}

Projects:
${userProfile.projects?.join('\n') || 'N/A'}

Certifications:
${userProfile.certifications?.join('\n') || 'N/A'}

═══════════════════════════════════════════════════
🎯 TARGET JOB
═══════════════════════════════════════════════════
Position: ${job.title}
Company: ${job.company}
Industry: ${job.industry || 'N/A'}

Required Skills:
${job.skills?.join(', ') || 'N/A'}

Key Requirements:
${job.requirements?.join('\n- ') || 'N/A'}

Description Excerpt:
${job.description?.substring(0, 500) || 'N/A'}...

═══════════════════════════════════════════════════
🎯 OPTIMIZATION TASK
═══════════════════════════════════════════════════

Analyze and optimize for:
1. **ATS Keyword Match**: Identify missing critical keywords from job posting
2. **Impact & Metrics**: Suggest how to quantify achievements (%, $, time, scale)
3. **Action Verbs**: Recommend stronger verbs (Led→Spearheaded, Made→Architected)
4. **Format for Parsing**: Ensure ATS-friendly structure
5. **Relevance Ranking**: Suggest which experiences/skills to emphasize

Provide response in this JSON format:
{
  "optimizedSummary": "<rewritten professional summary with job-specific keywords>",
  "keywordSuggestions": ["<critical keyword 1>", "<critical keyword 2>", ...],
  "experienceImprovements": [
    "<specific improvement 1 with example>",
    "<specific improvement 2 with example>",
    ...
  ],
  "skillsToHighlight": ["<skill 1>", "<skill 2>", ...],
  "formattingTips": [
    "<formatting tip 1>",
    "<formatting tip 2>",
    ...
  ],
  "atsScore": <integer 0-100 based on current keyword match and format>,
  "priorityChanges": ["<most impactful change 1>", "<most impactful change 2>", ...]
}`;
    }

    /**
     * Build prompt for cover letter generation
     */
    buildCoverLetterPrompt(userProfile, job) {
        return `Write a compelling, personalized cover letter using REAL candidate data.

═══════════════════════════════════════════════════
👤 CANDIDATE INFORMATION
═══════════════════════════════════════════════════
Name: ${userProfile.name || 'N/A'}
Email: ${userProfile.email || 'N/A'}

Core Expertise:
${userProfile.skills?.slice(0, 8).join(', ') || 'N/A'}

Career Highlight:
${userProfile.experience?.[0] || userProfile.summary || 'N/A'}

Most Recent/Notable Experience:
${userProfile.experience?.[1] || 'See above'}

Key Projects:
${userProfile.projects?.slice(0, 2).join('\n') || 'N/A'}

Professional Summary:
${userProfile.summary || 'N/A'}

═══════════════════════════════════════════════════
🎯 TARGET POSITION
═══════════════════════════════════════════════════
Company: ${job.company}
Position: ${job.title}
Location: ${job.location || 'N/A'}

Top 3 Requirements:
${job.requirements?.slice(0, 3).join('\n- ') || job.description?.substring(0, 200) || 'N/A'}

Key Skills Needed:
${job.skills?.slice(0, 5).join(', ') || 'N/A'}

═══════════════════════════════════════════════════
✍️ COVER LETTER INSTRUCTIONS
═══════════════════════════════════════════════════

Write a professional 3-paragraph cover letter (250-350 words):

**PARAGRAPH 1 - Opening Hook:**
- Express genuine enthusiasm for the specific role and company
- Mention 1-2 specific things about the company that resonate
- State how you learned about the role (if applicable)

**PARAGRAPH 2 - Value Proposition:**
- Connect YOUR actual experience (${userProfile.experience?.[0]}) to THEIR needs
- Use specific examples from projects/achievements
- Include metrics/numbers if present in experience
- Highlight 2-3 key skills that align perfectly with requirements

**PARAGRAPH 3 - Strong Close:**
- Reiterate excitement and fit
- Include confident call-to-action
- Thank them for consideration
- Professional sign-off

WRITING GUIDELINES:
✓ Use active voice and confident tone
✓ Be specific - avoid generic phrases
✓ Show personality while remaining professional
✓ Make every sentence earn its place
✓ Use the candidate's REAL achievements
✗ No clichés ("team player", "think outside the box")
✗ No desperation or over-apologizing
✗ No placeholder text like [Company Name]

Format:
[Date]

Hiring Manager
${job.company}
${job.location || ''}

Dear Hiring Manager,

[Paragraph 1]

[Paragraph 2]

[Paragraph 3]

Sincerely,
${userProfile.name}
${userProfile.email}`;
    }
}

module.exports = new AIService();
