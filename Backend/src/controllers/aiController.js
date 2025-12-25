const asyncHandler = require('../middleware/async');
const { sendSuccess, sendError } = require('../utils/response');
const aiService = require('../services/aiService');
const Job = require('../models/Job');
const User = require('../models/User');
const JobSeeker = require('../models/JobSeeker');
const Resume = require('../models/Resume');
const logger = require('../utils/logger');

/**
 * Merges profile data from multiple sources (provided, User, JobSeeker, Resume)
 */
const getComprehensiveProfile = async (userId, providedProfile) => {
    console.log('🔄 Gathering comprehensive profile for user:', userId);

    // Start with provided profile or basic User info
    const user = await User.findById(userId);
    let profile = {
        name: providedProfile?.name || (user ? `${user.firstName} ${user.lastName}` : 'Anonymous'),
        email: providedProfile?.email || user?.email || '',
        skills: providedProfile?.skills || [],
        experience: providedProfile?.experience || [],
        education: providedProfile?.education || [],
        summary: providedProfile?.summary || user?.bio || ''
    };

    // 1. Enrich from JobSeeker collection
    const jobSeeker = await JobSeeker.findOne({ user: userId });
    if (jobSeeker) {
        console.log('✅ Found JobSeeker records');
        // Merge skills
        if (jobSeeker.skills?.length > 0) {
            profile.skills = [...new Set([...profile.skills, ...jobSeeker.skills])];
        }
        // Merge summary/headline
        if (jobSeeker.headline && (!profile.summary || profile.summary.length < jobSeeker.headline.length)) {
            profile.summary = jobSeeker.headline;
        }
        // Merge experience
        if (jobSeeker.experience && !profile.experience.includes(jobSeeker.experience)) {
            profile.experience.push(jobSeeker.experience);
        }
    }

    // 2. Enrich from all user Resumes (prioritizing primary)
    const resumes = await Resume.find({ user: userId }).sort({ isPrimary: -1, createdAt: -1 });

    if (resumes.length > 0) {
        console.log(`✅ Found ${resumes.length} resume(s)`);
        resumes.forEach(resume => {
            if (resume.parsedData) {
                const { parsedData } = resume;

                // Merge experience
                if (parsedData.experience && Array.isArray(parsedData.experience)) {
                    const formattedExp = parsedData.experience.map(exp =>
                        `${exp.role || 'Professional'} at ${exp.company || 'Unknown'} (${exp.startDate || ''} - ${exp.endDate || 'Present'}): ${exp.description || ''}`
                    );
                    profile.experience = [...new Set([...profile.experience, ...formattedExp])];
                }

                // Merge skills from parsed resume
                if (parsedData.skills && Array.isArray(parsedData.skills)) {
                    parsedData.skills.forEach(skillCategory => {
                        if (skillCategory.items && Array.isArray(skillCategory.items)) {
                            profile.skills = [...new Set([...profile.skills, ...skillCategory.items])];
                        }
                    });
                }

                // Legacy skills
                if (parsedData.skills_legacy && Array.isArray(parsedData.skills_legacy)) {
                    profile.skills = [...new Set([...profile.skills, ...parsedData.skills_legacy])];
                }

                // Merge summary
                if (parsedData.summary && (!profile.summary || profile.summary.length < parsedData.summary.length)) {
                    profile.summary = parsedData.summary;
                }
            }
        });
    }

    console.log('📊 Final Profile Context:', {
        skillsCount: profile.skills.length,
        experienceLines: profile.experience.length,
        summaryLength: profile.summary?.length || 0
    });

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

    // Fetch job details
    const job = await Job.findById(jobId);
    if (!job) {
        return sendError(res, 404, 'Job not found');
    }

    // Get comprehensive profile data
    const profile = await getComprehensiveProfile(req.user._id, userProfile);

    try {
        // Perform AI analysis
        const analysis = await aiService.analyzeProfileMatch(profile, {
            title: job.title,
            company: job.company,
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

    // Fetch job details
    const job = await Job.findById(jobId);
    if (!job) {
        return sendError(res, 404, 'Job not found');
    }

    // Get comprehensive profile data
    const profile = await getComprehensiveProfile(req.user._id, userProfile);

    try {
        // Perform AI optimization
        const optimization = await aiService.optimizeResume(profile, {
            title: job.title,
            company: job.company,
            skills: job.skills,
            requirements: job.requirements,
            description: job.description
        });

        logger.info(`Resume optimization completed for user ${req.user._id} and job ${jobId}`);

        return sendSuccess(res, 200, 'Resume optimization completed', optimization);
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

    // Fetch job details
    const job = await Job.findById(jobId);
    if (!job) {
        return sendError(res, 404, 'Job not found');
    }

    // Get comprehensive profile data
    const profile = await getComprehensiveProfile(req.user._id, userProfile);

    try {
        // Generate cover letter
        const coverLetter = await aiService.generateCoverLetter(profile, {
            title: job.title,
            company: job.company,
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

    // Fetch job details
    const job = await Job.findById(jobId);
    if (!job) {
        return sendError(res, 404, 'Job not found');
    }

    // Get comprehensive profile data
    const profile = await getComprehensiveProfile(req.user._id, userProfile);

    const jobData = {
        title: job.title,
        company: job.company,
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
