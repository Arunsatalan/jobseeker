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
     * @param {Object} userProfile - User profile data
     * @param {Object} job - Job details
     * @returns {Promise<Object>} AI analysis results
     */
    async analyzeProfileMatch(userProfile, job) {
        try {
            if (!this.apiKey) {
                logger.warn('⚠️  OpenAI API key not configured, using fallback analysis');
                console.log('⚠️  FALLBACK MODE: No API key found');
                return this.getFallbackAnalysis(userProfile, job);
            }

            logger.info('✅ OpenAI API key found, calling GPT API for profile analysis');
            console.log('✅ REAL GPT MODE: Making API call to OpenAI');

            const prompt = this.buildProfileAnalysisPrompt(userProfile, job);

            console.log('📤 Sending request to OpenAI API...');
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
            console.log('✅ GPT API Response received:', analysis);

            return analysis;
        } catch (error) {
            logger.error('❌ AI profile analysis failed:', error.message);
            console.error('❌ GPT API Error:', error.response?.data || error.message);

            // Fallback to rule-based analysis if API fails
            console.log('⚠️  Falling back to rule-based analysis');
            return this.getFallbackAnalysis(userProfile, job);
        }
    }

    /**
     * Generate optimized resume content
     * @param {Object} userProfile - User profile data
     * @param {Object} job - Job details
     * @returns {Promise<Object>} Optimized resume suggestions
     */
    async optimizeResume(userProfile, job) {
        try {
            if (!this.apiKey) {
                logger.warn('OpenAI API key not configured, using fallback optimization');
                return this.getFallbackOptimization(userProfile, job);
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

            const optimization = JSON.parse(response.data.choices[0].message.content);
            logger.info('AI resume optimization completed successfully');

            return optimization;
        } catch (error) {
            logger.error('AI resume optimization failed:', error.message);

            // Fallback to rule-based optimization if API fails
            return this.getFallbackOptimization(userProfile, job);
        }
    }

    /**
     * Generate personalized cover letter
     * @param {Object} userProfile - User profile data
     * @param {Object} job - Job details
     * @returns {Promise<string>} Generated cover letter
     */
    async generateCoverLetter(userProfile, job) {
        try {
            if (!this.apiKey) {
                logger.warn('OpenAI API key not configured, using fallback cover letter');
                return this.getFallbackCoverLetter(userProfile, job);
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

            const coverLetter = response.data.choices[0].message.content.trim();
            logger.info('AI cover letter generated successfully');

            return coverLetter;
        } catch (error) {
            logger.error('AI cover letter generation failed:', error.message);

            // Fallback to template-based cover letter if API fails
            return this.getFallbackCoverLetter(userProfile, job);
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

    /**
     * Fallback analysis when API is unavailable
     */
    getFallbackAnalysis(userProfile, job) {
        const userSkills = new Set(userProfile.skills?.map(s => s.toLowerCase()) || []);
        const jobSkills = new Set(job.skills?.map(s => s.toLowerCase()) || []);

        // Calculate match based on skill overlap
        const matchingSkills = [...userSkills].filter(skill => jobSkills.has(skill));
        const matchPercentage = Math.min(95, Math.max(60,
            Math.round((matchingSkills.length / Math.max(jobSkills.size, 1)) * 100)
        ));

        const missingSkills = [...jobSkills].filter(skill => !userSkills.has(skill)).slice(0, 3);

        return {
            matchPercentage,
            strengths: [
                `Strong ${userProfile.skills?.[0] || 'technical'} skills`,
                'Relevant experience in the field',
                'Good cultural fit based on profile'
            ],
            improvements: [
                missingSkills.length > 0 ? `Consider adding ${missingSkills[0]} to your skillset` : 'Highlight leadership experience more prominently',
                'Add specific metrics to quantify achievements',
                'Tailor your summary to this specific role'
            ],
            suggestedSkills: missingSkills.length > 0 ? missingSkills : ['Python', 'Communication', 'Project Management'],
            detailedAnalysis: `Your profile shows a ${matchPercentage}% match with this position. You have strong foundational skills, and with some targeted improvements, you would be an excellent candidate.`
        };
    }

    /**
     * Fallback optimization when API is unavailable
     */
    getFallbackOptimization(userProfile, job) {
        const jobKeywords = [...new Set([
            ...job.skills || [],
            ...job.requirements?.flatMap(r => r.split(' ').filter(w => w.length > 4)) || []
        ])].slice(0, 10);

        return {
            optimizedSummary: `${userProfile.summary || 'Experienced professional'} with expertise in ${job.skills?.slice(0, 3).join(', ')}. Proven track record in delivering results and contributing to team success.`,
            keywordSuggestions: jobKeywords,
            experienceImprovements: [
                'Add specific metrics and numbers to quantify achievements',
                'Use action verbs to start each bullet point',
                'Align experience descriptions with job requirements'
            ],
            skillsToHighlight: job.skills?.slice(0, 5) || [],
            formattingTips: [
                'Use consistent formatting throughout',
                'Keep bullet points concise (1-2 lines)',
                'Ensure proper use of white space for readability'
            ],
            atsScore: 75
        };
    }

    /**
     * Fallback cover letter when API is unavailable
     */
    getFallbackCoverLetter(userProfile, job) {
        return `Dear ${job.company} Hiring Team,

I am excited to apply for the ${job.title} position at ${job.company}. With my background in ${userProfile.skills?.slice(0, 3).join(', ') || 'relevant technologies'}, I am confident I can contribute effectively to your team.

My experience includes ${userProfile.experience?.[0] || 'relevant industry experience'}, which aligns well with your requirements for ${job.requirements?.[0] || 'this role'}. I am particularly drawn to ${job.company} because of your reputation for innovation and commitment to excellence.

I have developed strong skills in ${userProfile.skills?.slice(0, 2).join(' and ') || 'key areas'}, which I believe would be valuable assets to your organization. I am eager to bring my expertise and passion to contribute to your team's success.

I would welcome the opportunity to discuss how my skills and experience align with your needs. Thank you for considering my application.

Best regards,
${userProfile.name || 'Applicant'}`;
    }
}

module.exports = new AIService();
