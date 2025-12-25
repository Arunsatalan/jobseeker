const axios = require('axios');
const logger = require('../utils/logger');

class AIService {
    constructor() {
        this.apiKey = process.env.OPENAI_API_KEY;
        this.apiUrl = 'https://api.openai.com/v1/chat/completions';
        this.model = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';
    }

    /**
     * Analyze user profile against job requirements
     * @param {any} userProfile - User profile data
     * @param {any} job - Job details
     * @returns {Promise<any>} AI analysis results
     */
    async analyzeProfileMatch(userProfile, job) {
        try {
            if (!this.apiKey) {
                throw new Error('OpenAI API key is missing. Please check your .env file.');
            }

            logger.info('✅ Calling REAL GPT for profile analysis');
            const prompt = this.buildProfileAnalysisPrompt(userProfile, job);

            const response = await axios.post(
                this.apiUrl,
                {
                    model: this.model,
                    messages: [
                        {
                            role: 'system',
                            content: 'You are an expert career advisor and resume analyst. Analyze job applications and provide detailed, actionable feedback in JSON format.'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 1500,
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
            logger.info('✅ AI profile analysis completed successfully');
            return analysis;
        } catch (error) {
            const err = error;
            const openAiError = err.response?.data?.error;

            if (openAiError) {
                logger.error(`❌ OpenAI API Error: ${openAiError.message}`);
                // Throw the REAL error so the user knows exactly what is wrong (e.g., Quota Exceeded)
                throw new Error(`AI Service Error: ${openAiError.message}`);
            }

            logger.error(`❌ AI Analysis failed: ${err.message}`);
            throw err;
        }
    }

    /**
     * Generate optimized resume content
     */
    async optimizeResume(userProfile, job) {
        try {
            if (!this.apiKey) {
                throw new Error('OpenAI API key is missing');
            }

            const prompt = this.buildResumeOptimizationPrompt(userProfile, job);

            const response = await axios.post(
                this.apiUrl,
                {
                    model: this.model,
                    messages: [
                        {
                            role: 'system',
                            content: 'You are an expert resume writer and ATS optimization specialist. Provide specific, actionable resume improvements in JSON format.'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    temperature: 0.7,
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
            const err = error;
            throw new Error(`Resume Optimization Error: ${err.response?.data?.error?.message || err.message}`);
        }
    }

    /**
     * Generate personalized cover letter
     */
    async generateCoverLetter(userProfile, job) {
        try {
            if (!this.apiKey) {
                throw new Error('OpenAI API key is missing');
            }

            const prompt = this.buildCoverLetterPrompt(userProfile, job);

            const response = await axios.post(
                this.apiUrl,
                {
                    model: this.model,
                    messages: [
                        {
                            role: 'system',
                            content: 'You are an expert cover letter writer. Create professional, personalized cover letters that highlight relevant skills and experience.'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    temperature: 0.8,
                    max_tokens: 800
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
            const err = error;
            throw new Error(`Cover Letter Error: ${err.response?.data?.error?.message || err.message}`);
        }
    }

    /**
     * Build prompt for profile analysis
     */
    buildProfileAnalysisPrompt(userProfile, job) {
        return `Analyze how well this candidate's profile matches the job requirements and provide a detailed assessment.

CANDIDATE PROFILE:
Name: ${userProfile.name || 'N/A'}
Skills: ${userProfile.skills?.join(', ') || 'N/A'}
Experience: ${userProfile.experience?.join('; ') || 'N/A'}
Education: ${userProfile.education?.join('; ') || 'N/A'}
Summary: ${userProfile.summary || 'N/A'}

JOB DETAILS:
Title: ${job.title}
Company: ${job.company}
Required Skills: ${job.skills?.join(', ') || 'N/A'}
Requirements: ${job.requirements?.join('; ') || 'N/A'}
Description: ${job.description || 'N/A'}

Provide your analysis in the following JSON format:
{
  "matchPercentage": <number between 0-100>,
  "strengths": [<array of 3-5 specific strengths>],
  "improvements": [<array of 3-5 specific improvement suggestions>],
  "suggestedSkills": [<array of 3-5 skills to add>],
  "detailedAnalysis": "<brief paragraph explaining the match>"
}`;
    }

    /**
     * Build prompt for resume optimization
     */
    buildResumeOptimizationPrompt(userProfile, job) {
        return `Optimize this resume for the specific job posting. Focus on ATS optimization and keyword matching.

CURRENT RESUME:
Name: ${userProfile.name || 'N/A'}
Skills: ${userProfile.skills?.join(', ') || 'N/A'}
Experience: ${userProfile.experience?.join('; ') || 'N/A'}
Education: ${userProfile.education?.join('; ') || 'N/A'}
Summary: ${userProfile.summary || 'N/A'}

TARGET JOB:
Title: ${job.title}
Company: ${job.company}
Required Skills: ${job.skills?.join(', ') || 'N/A'}
Requirements: ${job.requirements?.join('; ') || 'N/A'}

Provide optimization suggestions in the following JSON format:
{
  "optimizedSummary": "<improved professional summary>",
  "keywordSuggestions": [<array of ATS keywords to add>],
  "experienceImprovements": [<array of specific improvements for experience section>],
  "skillsToHighlight": [<array of skills to emphasize>],
  "formattingTips": [<array of formatting improvements>],
  "atsScore": <number between 0-100>
}`;
    }

    /**
     * Build prompt for cover letter generation
     */
    buildCoverLetterPrompt(userProfile, job) {
        return `Write a professional, personalized cover letter for this job application.

CANDIDATE:
Name: ${userProfile.name || 'N/A'}
Skills: ${userProfile.skills?.join(', ') || 'N/A'}
Experience: ${userProfile.experience?.[0] || 'N/A'}
Summary: ${userProfile.summary || 'N/A'}

JOB:
Title: ${job.title}
Company: ${job.company}
Requirements: ${job.requirements?.slice(0, 3).join(', ') || 'N/A'}

Write a concise, professional cover letter (250-300 words) that:
1. Opens with enthusiasm for the position
2. Highlights 2-3 relevant skills/experiences
3. Shows knowledge of the company
4. Closes with a call to action

Use a professional but warm tone. Do not include placeholder text or brackets.`;
    }
}

module.exports = new AIService();
