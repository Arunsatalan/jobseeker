const asyncHandler = require('../middleware/async');
const { sendSuccess, sendError } = require('../utils/response');
const aiService = require('../services/aiService');
const Job = require('../models/Job');
const User = require('../models/User');
const JobSeeker = require('../models/JobSeeker');
const JobSeekerPreferences = require('../models/JobSeekerPreferences');
const Resume = require('../models/Resume');
const InterviewSession = require('../models/InterviewSession');
const logger = require('../utils/logger');

/**
 * Merges profile data from multiple sources (provided, User, JobSeeker, Resume)
 */
const getComprehensiveProfile = async (userId, providedProfile) => {
    logger.info(`🔍 Deep fetching all records for user: ${userId} to provide REAL data analysis`);

    // Start with basic User info
    const user = await User.findById(userId);
    let profile = {
        name: providedProfile?.name || (user ? `${user.firstName} ${user.lastName}` : 'Anonymous'),
        email: providedProfile?.email || user?.email || '',
        skills: providedProfile?.skills || [],
        experience: providedProfile?.experience || [],
        education: providedProfile?.education || [],
        summary: providedProfile?.summary || user?.bio || '',
        projects: [],
        certifications: [],
        languages: []
    };

    // 1. Enrich from JobSeeker collection
    const jobSeeker = await JobSeeker.findOne({ user: userId });
    if (jobSeeker) {
        logger.info('✅ Including JobSeeker collection data');
        if (jobSeeker.skills?.length > 0) {
            profile.skills = [...new Set([...profile.skills, ...jobSeeker.skills])];
        }
        if (jobSeeker.headline && (!profile.summary || profile.summary.length < jobSeeker.headline.length)) {
            profile.summary = jobSeeker.headline;
        }
        if (jobSeeker.experience && !profile.experience.includes(jobSeeker.experience)) {
            profile.experience.push(jobSeeker.experience);
        }
    } else {
        logger.warn(`⚠️ No JobSeeker record found for user: ${userId}`);
    }

    // 2. Enrich from JobSeekerPreferences collection
    let jobSeekerPreferences = null;
    if (jobSeeker) {
        jobSeekerPreferences = await JobSeekerPreferences.findOne({ jobSeeker: jobSeeker._id });
        if (jobSeekerPreferences) {
            logger.info('✅ Including JobSeekerPreferences collection data');
            logger.info(`   Desired Roles: ${jobSeekerPreferences.desiredRoles?.join(', ') || 'None'}`);
            logger.info(`   Locations: ${jobSeekerPreferences.locations?.join(', ') || 'None'}`);
            logger.info(`   Experience: ${jobSeekerPreferences.experienceLevel || 'None'}`);
            logger.info(`   Salary: $${jobSeekerPreferences.salaryMin || 0} - $${jobSeekerPreferences.salaryMax || 0}`);

            profile.preferences = {
                desiredRoles: jobSeekerPreferences.desiredRoles || [],
                locations: jobSeekerPreferences.locations || [],
                salaryRange: {
                    min: jobSeekerPreferences.salaryMin,
                    max: jobSeekerPreferences.salaryMax,
                    period: jobSeekerPreferences.salaryPeriod
                },
                experienceLevel: jobSeekerPreferences.experienceLevel,
                workType: jobSeekerPreferences.workType || [],
                availability: jobSeekerPreferences.availability
            };
        } else {
            logger.warn(`⚠️ No JobSeekerPreferences found for jobSeeker: ${jobSeeker._id}`);
        }
    } else {
        logger.warn(`⚠️ Cannot fetch JobSeekerPreferences - no JobSeeker record exists`);
    }

    // 3. Enrich from ALL resumes (merging all unique data points)
    const resumes = await Resume.find({ user: userId }).sort({ isPrimary: -1, createdAt: -1 });

    if (resumes.length > 0) {
        logger.info(`✅ Aggregating data from ${resumes.length} resume(s)`);
        resumes.forEach(resume => {
            if (resume.parsedData) {
                const { parsedData } = resume;

                // Merge Summary
                if (parsedData.summary && (!profile.summary || profile.summary.length < parsedData.summary.length)) {
                    profile.summary = parsedData.summary;
                }

                // Merge Experience
                if (parsedData.experience && Array.isArray(parsedData.experience)) {
                    const formattedExp = parsedData.experience.map(exp =>
                        `${exp.role || 'Professional'} at ${exp.company || 'Unknown'} (${exp.startDate || ''} - ${exp.endDate || 'Present'}): ${exp.description || ''}`
                    );
                    profile.experience = [...new Set([...profile.experience, ...formattedExp])];
                }

                // Merge Education
                if (parsedData.education && Array.isArray(parsedData.education)) {
                    const formattedEdu = parsedData.education.map(edu =>
                        `${edu.degree || 'Degree'} in ${edu.field || 'Field'} from ${edu.school || 'Unknown School'} (${edu.graduationDate || ''})`
                    );
                    profile.education = [...new Set([...profile.education, ...formattedEdu])];
                }

                // Merge Skills
                if (parsedData.skills && Array.isArray(parsedData.skills)) {
                    parsedData.skills.forEach(cat => {
                        if (cat.items) profile.skills = [...new Set([...profile.skills, ...cat.items])];
                    });
                }
                if (parsedData.skills_legacy) {
                    profile.skills = [...new Set([...profile.skills, ...parsedData.skills_legacy])];
                }

                // Merge Projects
                if (parsedData.projects && Array.isArray(parsedData.projects)) {
                    const formattedProj = parsedData.projects.map(p =>
                        `${p.name}: ${p.description || ''} (Tech: ${p.technologies || ''})`
                    );
                    profile.projects = [...new Set([...profile.projects, ...formattedProj])];
                }

                // Merge Certifications
                if (parsedData.certifications && Array.isArray(parsedData.certifications)) {
                    const formattedCert = parsedData.certifications.map(c =>
                        `${c.title} by ${c.issuer || 'N/A'} (${c.date || ''})`
                    );
                    profile.certifications = [...new Set([...profile.certifications, ...formattedCert])];
                }

                // Merge Languages
                if (parsedData.languages && Array.isArray(parsedData.languages)) {
                    const formattedLang = parsedData.languages.map(l =>
                        `${l.language} (${l.proficiency || 'N/A'})`
                    );
                    profile.languages = [...new Set([...profile.languages, ...formattedLang])];
                }
            }
        });
    }

    logger.info(`📊 Data gathering complete. Sent to Grok: ${profile.skills.length} skills, ${profile.experience.length} exp, ${profile.projects.length} projects.`);
    return profile;
};

// @desc Analyze profile match with job
// @route POST /api/v1/ai/analyze-profile
// @access Private
exports.analyzeProfile = asyncHandler(async (req, res, next) => {
    const { jobId, userProfile } = req.body;

    if (!jobId) {
        return sendError(res, 400, 'Job ID is required');
    }

    // Fetch job details with populated company
    const job = await Job.findById(jobId).populate('company');
    if (!job) {
        return sendError(res, 404, 'Job not found');
    }

    // Get comprehensive profile data
    const profile = await getComprehensiveProfile(req.user._id, userProfile);

    try {
        // Perform AI analysis
        const analysis = await aiService.analyzeProfileMatch(profile, {
            title: job.title,
            company: job.company?.name || 'N/A',
            industry: job.industry,
            skills: job.skills,
            requirements: job.requirements,
            description: job.description
        });

        logger.info(`Profile analysis completed for user ${req.user._id} and job ${jobId}`);

        return sendSuccess(res, 200, 'Profile analysis completed', analysis);
    } catch (error) {
        logger.error('Profile analysis error:', error);
        return sendError(res, 500, error.message || 'Failed to analyze profile');
    }
});

// @desc Optimize resume for job
// @route POST /api/v1/ai/optimize-resume
// @access Private
exports.optimizeResume = asyncHandler(async (req, res, next) => {
    const { jobId, userProfile } = req.body;

    if (!jobId) {
        return sendError(res, 400, 'Job ID is required');
    }

    // Fetch job details with populated company
    const job = await Job.findById(jobId).populate('company');
    if (!job) {
        return sendError(res, 404, 'Job not found');
    }

    // Get comprehensive profile data
    const profile = await getComprehensiveProfile(req.user._id, userProfile);

    try {
        // Perform AI optimization
        const optimization = await aiService.optimizeResume(profile, {
            title: job.title,
            company: job.company?.name || 'N/A',
            industry: job.industry,
            skills: job.skills,
            requirements: job.requirements,
            description: job.description
        });

        // Save as new Resume
        const savedResume = await Resume.create({
            user: req.user._id,
            title: `${job.title} - AI Optimized`,
            role: job.title,
            isPrimary: false,
            parsedData: {
                name: optimization.personalInfo?.name || profile.name,
                email: optimization.personalInfo?.email || profile.email,
                phone: optimization.personalInfo?.phone || profile.phone,
                location: optimization.personalInfo?.location || profile.location,
                linkedin: optimization.personalInfo?.linkedin || profile.linkedin,
                github: optimization.personalInfo?.github || profile.github,
                summary: optimization.summary || profile.summary,
                experience: optimization.experience || [],
                education: optimization.education || [],
                skills: optimization.skills || [],
                projects: optimization.projects || [],
                certifications: optimization.certifications || [],
                languages: optimization.languages || [],
                references: [],
                optimizationMetadata: optimization.optimizationMetadata || {}
            }
        });

        logger.info(`Resume optimization completed and saved: ${savedResume._id}`);

        return sendSuccess(res, 200, 'Resume optimization completed', {
            optimizedResumeId: savedResume._id,
            changes: optimization.optimizationMetadata?.changesSummary || [],
            addedKeywords: optimization.optimizationMetadata?.addedKeywords || [],
            matchScore: optimization.optimizationMetadata?.matchScore || 0,
            optimizationData: optimization
        });
    } catch (error) {
        logger.error('Resume optimization error:', error);
        return sendError(res, 500, error.message || 'Failed to optimize resume');
    }
});

// @desc Generate cover letter
// @route POST /api/v1/ai/generate-cover-letter
// @access Private
exports.generateCoverLetter = asyncHandler(async (req, res, next) => {
    const { jobId, userProfile } = req.body;

    if (!jobId) {
        return sendError(res, 400, 'Job ID is required');
    }

    // Fetch job details with populated company
    const job = await Job.findById(jobId).populate('company');
    if (!job) {
        return sendError(res, 404, 'Job not found');
    }

    // Get comprehensive profile data
    const profile = await getComprehensiveProfile(req.user._id, userProfile);

    try {
        // Generate cover letter
        const coverLetter = await aiService.generateCoverLetter(profile, {
            title: job.title,
            company: job.company?.name || 'N/A',
            industry: job.industry,
            skills: job.skills,
            requirements: job.requirements,
            description: job.description
        });

        logger.info(`Cover letter generated for user ${req.user._id} and job ${jobId}`);

        return sendSuccess(res, 200, 'Cover letter generated', { coverLetter });
    } catch (error) {
        logger.error('Cover letter generation error:', error);
        return sendError(res, 500, error.message || 'Failed to generate cover letter');
    }
});

// @desc Get comprehensive AI application assistance
// @route POST /api/v1/ai/smart-apply
// @access Private
exports.smartApply = asyncHandler(async (req, res, next) => {
    const { jobId, userProfile } = req.body;

    if (!jobId) {
        return sendError(res, 400, 'Job ID is required');
    }

    // Fetch job details with populated company
    const job = await Job.findById(jobId).populate('company');
    if (!job) {
        return sendError(res, 404, 'Job not found');
    }

    // Get comprehensive profile data
    const profile = await getComprehensiveProfile(req.user._id, userProfile);

    const jobData = {
        title: job.title,
        company: job.company?.name || 'N/A',
        industry: job.industry,
        skills: job.skills,
        requirements: job.requirements,
        description: job.description
    };

    try {
        // Perform all AI operations in parallel
        const [analysis, optimization, coverLetter] = await Promise.all([
            aiService.analyzeProfileMatch(profile, jobData),
            aiService.optimizeResume(profile, jobData),
            aiService.generateCoverLetter(profile, jobData)
        ]);

        logger.info(`Smart apply completed for user ${req.user._id} and job ${jobId}`);

        return sendSuccess(res, 200, 'Smart apply analysis completed', {
            analysis,
            optimization,
            coverLetter
        });
    } catch (error) {
        logger.error('Smart apply error:', error);
        return sendError(res, 500, error.message || 'Failed to complete smart apply analysis');
    }
});
// @desc Generate support message
// @route POST /api/v1/ai/generate-support-message
// @access Private
// @desc Start AI interaction session
// @route POST /api/v1/ai/start-interview
// @access Private
exports.startInterview = asyncHandler(async (req, res, next) => {
    const { jobId, userProfile, difficulty } = req.body;

    if (!jobId) return sendError(res, 400, 'Job ID is required');

    // Fetch context
    const job = await Job.findById(jobId).populate('company');
    if (!job) return sendError(res, 404, 'Job not found');

    const profile = await getComprehensiveProfile(req.user._id, userProfile);

    try {
        // Start AI session
        const initialInteraction = await aiService.startInterviewSession(profile, {
            title: job.title,
            company: job.company?.name || 'Company',
            description: job.description,
            skills: job.skills
        });

        // Create Session Record
        const session = await InterviewSession.create({
            user: req.user._id,
            job: jobId,
            difficulty: difficulty || 'medium',
            messages: [initialInteraction]
        });

        return sendSuccess(res, 201, 'Interview session started', {
            sessionId: session._id,
            message: initialInteraction
        });
    } catch (error) {
        logger.error('Start interview error:', error);
        return sendError(res, 500, 'Failed to start interview');
    }
});

// @desc Generate next question
// @route POST /api/v1/ai/ask-question
// @access Private
exports.askQuestion = asyncHandler(async (req, res, next) => {
    const { sessionId } = req.body;

    const session = await InterviewSession.findById(sessionId).populate('job user');
    if (!session) return sendError(res, 404, 'Session not found');

    // verify ownership
    if (session.user._id.toString() !== req.user._id.toString()) {
        return sendError(res, 403, 'Unauthorized');
    }

    // Get comprehensive profile again or rely on what matches? 
    // Ideally we'd store profile snapshot, but for now re-fetch is safer for freshness
    const profile = await getComprehensiveProfile(req.user._id, {});

    try {
        const question = await aiService.generateInterviewQuestion(
            session.messages,
            profile,
            {
                title: session.job.title,
                company: 'the company', // Populate company deep if needed
                description: session.job.description,
                skills: session.job.skills
            }
        );

        session.messages.push(question);
        await session.save();

        return sendSuccess(res, 200, 'Question generated', { message: question });
    } catch (error) {
        logger.error('Ask question error:', error);
        return sendError(res, 500, 'Failed to generate question');
    }
});

// @desc Submit answer and get feedback
// @route POST /api/v1/ai/submit-answer
// @access Private
exports.submitAnswer = asyncHandler(async (req, res, next) => {
    const { sessionId, answer } = req.body;

    const session = await InterviewSession.findById(sessionId).populate('job user');
    if (!session) return sendError(res, 404, 'Session not found');

    // verify ownership
    if (session.user._id.toString() !== req.user._id.toString()) {
        return sendError(res, 403, 'Unauthorized');
    }

    // Add user answer to history
    session.messages.push({ role: 'user', content: answer });
    await session.save();

    const profile = await getComprehensiveProfile(req.user._id, {});

    // Find the last question asked
    // It's the message before the one we just pushed (which was user's answer)
    // Actually we just pushed, so it is at length-1. The question is at length-2.
    // However, if we want to be safe, filter for last 'assistant' message.
    const lastQuestion = session.messages.slice().reverse().find(m => m.role === 'assistant');

    try {
        const feedback = await aiService.evaluateInterviewAnswer(
            lastQuestion ? lastQuestion.content : "Tell me about yourself",
            answer,
            profile,
            {
                title: session.job.title,
                company: 'the company',
                description: session.job.description,
                skills: session.job.skills
            }
        );

        // Optionally store feedback in the session messages or separate field?
        // User might want to see it in chat.
        const feedbackMessage = {
            role: 'system',
            content: JSON.stringify(feedback) // Store structured feedback or parsed text
        };
        // For chat purposes, maybe we want a text response from AI too? 
        // Evaluating answer usually returns JSON. Let's send it to frontend, 
        // frontend can display it nicely. 
        // We can also have the "Coach" say something.

        // Let's create a conversational response from the feedback
        const coachResponse = {
            role: 'assistant',
            content: `Feedback: ${feedback.feedback}\n\nRating: ${feedback.rating}/10\n\nTo improve: ${feedback.improvement_suggestion}`
        };

        session.messages.push(coachResponse);
        await session.save();

        return sendSuccess(res, 200, 'Answer analyzed', {
            feedback,
            message: coachResponse
        });
    } catch (error) {
        logger.error('Submit answer error:', error);
        return sendError(res, 500, 'Failed to analyze answer');
    }
});
