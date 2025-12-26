const axios = require('axios');
const logger = require('../utils/logger');

class AIService {
    constructor() {
        // Use Grok API key from environment variables
        this.apiKey = process.env.GROK_API_KEY || process.env.Grok_api;
        this.apiUrl = 'https://api.x.ai/v1/chat/completions';
        this.model = process.env.GROK_MODEL || 'grok-beta';
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
                logger.warn('⚠️ No Grok API key found, using Local Intelligent Analysis');
                return this.generateLocalAnalysis(userProfile, job);
            }

            logger.info('🚀 Calling Grok AI for comprehensive profile analysis');
            const prompt = this.buildProfileAnalysisPrompt(userProfile, job);

            const response = await axios.post(
                this.apiUrl,
                {
                    model: this.model,
                    messages: [
                        {
                            role: 'system',
                            content: 'You are an elite career strategist and recruitment expert. Analyze the provided real candidate data against specific job requirements. Provide an uncompromising, data-driven report in JSON format.'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    temperature: 0,
                    max_tokens: 2000,
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
            logger.info('✅ Grok AI profile analysis completed successfully');
            return analysis;
        } catch (error) {
            const err = error;
            const grokError = err.response?.data?.error;

            if (grokError?.message?.includes('credits') || grokError?.message?.includes('quota') || err.message?.includes('401')) {
                logger.warn('⚠️ Grok API Credits/Auth issues detected. Falling back to Local Heuristic Analysis to ensure user gets a data-driven report.');
                return this.generateLocalAnalysis(userProfile, job);
            }

            logger.error(`❌ Grok Analysis failed: ${err.message}`);
            // If it's a non-credit error, we still try local analysis to keep the app working
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
                            content: 'You are a master resume optimizer and ATS specialist. Output in JSON format.'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    temperature: 0.1,
                    max_tokens: 2000,
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
                            content: 'You are a highly skilled professional writer.'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 1000
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
        return `Analyze the match between the following REAL candidate data and the job requirement.
        
[CANDIDATE DATA - AGGREGATED FROM PROFILE AND RESUMES]
Name: ${userProfile.name || 'N/A'}
Skills: ${userProfile.skills?.join(', ') || 'N/A'}
Experience: ${userProfile.experience?.join('\n- ') || 'N/A'}
Education: ${userProfile.education?.join('; ') || 'N/A'}
Projects: ${userProfile.projects?.join('\n- ') || 'N/A'}
Certifications: ${userProfile.certifications?.join(', ') || 'N/A'}
Languages: ${userProfile.languages?.join(', ') || 'N/A'}
Summary/Bio: ${userProfile.summary || 'N/A'}

[JOB REQUIREMENTS]
Title: ${job.title}
Company: ${job.company}
Target Skills: ${job.skills?.join(', ') || 'N/A'}
Requirements: ${job.requirements?.join('; ') || 'N/A'}
Description: ${job.description || 'N/A'}

Analyze precisely how the candidate's actual experience and projects map to the job requirements.
Provide your analysis in the FOLLOWING JSON format:
{
  "matchPercentage": <integer 0-100>,
  "strengths": [<list 3-5 specific, evidence-based strengths>],
  "improvements": [<list 3-5 specific gaps for this role>],
  "suggestedSkills": [<list 3-5 specific tech or soft skills to acquire>],
  "detailedAnalysis": "<A concise, professional paragraph explaining the match based ONLY on the data provided.>"
}`;
    }

    /**
     * Build prompt for resume optimization
     */
    buildResumeOptimizationPrompt(userProfile, job) {
        return `Optimize the resume based on these real details and target job.
        
REAL CANDIDATE PROFILE:
Name: ${userProfile.name || 'N/A'}
Skills: ${userProfile.skills?.join(', ') || 'N/A'}
Experience: ${userProfile.experience?.join('\n- ') || 'N/A'}
Education: ${userProfile.education?.join('; ') || 'N/A'}
Projects: ${userProfile.projects?.join('\n- ') || 'N/A'}
Certifications: ${userProfile.certifications?.join(', ') || 'N/A'}
Summary: ${userProfile.summary || 'N/A'}

TARGET JOB:
Title: ${job.title}
Company: ${job.company}
Required Skills: ${job.skills?.join(', ') || 'N/A'}
Requirements: ${job.requirements?.join('; ') || 'N/A'}

Provide optimization suggestions in JSON format:
{
  "optimizedSummary": "<a rewritten, high-impact summary tailored to this job>",
  "keywordSuggestions": [<essential keywords missing from profile>],
  "experienceImprovements": [<specific tips for experience section>],
  "skillsToHighlight": [<skills to emphasize>],
  "formattingTips": [<structure advice>],
  "atsScore": <integer 0-100>
}`;
    }

    /**
     * Build prompt for cover letter generation
     */
    buildCoverLetterPrompt(userProfile, job) {
        return `Write a bespoke cover letter using the candidate's REAL data and the specific job details.
        
CANDIDATE:
Name: ${userProfile.name || 'N/A'}
Key Skills: ${userProfile.skills?.join(', ') || 'N/A'}
Experience Highlight: ${userProfile.experience?.[0] || 'N/A'}
Summary: ${userProfile.summary || 'N/A'}

JOB:
Title: ${job.title}
Company: ${job.company}
Top Requirements: ${job.requirements?.slice(0, 3).join(', ') || 'N/A'}

Write a professional, 3-paragraph letter:
1. Enthusiastic opening mentioning the specific role and company.
2. Evidence-based middle paragraph linking their actual experience (${userProfile.experience?.[0]}) to the job requirements.
3. Strong closing with a call to action.

No placeholders. Professional tone. Max 300 words.`;
    }
}

module.exports = new AIService();
