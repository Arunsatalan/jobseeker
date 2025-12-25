const asyncHandler = require('../middleware/async');
const { sendSuccess, sendError } = require('../utils/response');
const aiService = require('../services/aiService');
const Job = require('../models/Job');
const User = require('../models/User');
const logger = require('../utils/logger');

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

    // Use provided profile or fetch from user
    let profile = userProfile;
    if (!profile) {
        const user = await User.findById(req.user._id);
        profile = {
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
            skills: user.skills || [],
            experience: user.experience?.map(exp =>
                `${exp.title} at ${exp.company} (${exp.duration || 'N/A'})`
            ) || [],
            education: user.education?.map(edu =>
                `${edu.degree} in ${edu.field} from ${edu.institution}`
            ) || [],
            summary: user.summary || user.bio || ''
        };
    }

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
        return sendError(res, 500, 'Failed to analyze profile');
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

    // Use provided profile or fetch from user
    let profile = userProfile;
    if (!profile) {
        const user = await User.findById(req.user._id);
        profile = {
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
            skills: user.skills || [],
            experience: user.experience?.map(exp =>
                `${exp.title} at ${exp.company} (${exp.duration || 'N/A'})`
            ) || [],
            education: user.education?.map(edu =>
                `${edu.degree} in ${edu.field} from ${edu.institution}`
            ) || [],
            summary: user.summary || user.bio || ''
        };
    }

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
        return sendError(res, 500, 'Failed to optimize resume');
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

    // Use provided profile or fetch from user
    let profile = userProfile;
    if (!profile) {
        const user = await User.findById(req.user._id);
        profile = {
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
            skills: user.skills || [],
            experience: user.experience?.map(exp =>
                `${exp.title} at ${exp.company} (${exp.duration || 'N/A'})`
            ) || [],
            education: user.education?.map(edu =>
                `${edu.degree} in ${edu.field} from ${edu.institution}`
            ) || [],
            summary: user.summary || user.bio || ''
        };
    }

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
        return sendError(res, 500, 'Failed to generate cover letter');
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

    // Use provided profile or fetch from user
    let profile = userProfile;
    if (!profile) {
        const user = await User.findById(req.user._id);
        profile = {
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
            skills: user.skills || [],
            experience: user.experience?.map(exp =>
                `${exp.title} at ${exp.company} (${exp.duration || 'N/A'})`
            ) || [],
            education: user.education?.map(edu =>
                `${edu.degree} in ${edu.field} from ${edu.institution}`
            ) || [],
            summary: user.summary || user.bio || ''
        };
    }

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
        return sendError(res, 500, 'Failed to complete smart apply analysis');
    }
});
