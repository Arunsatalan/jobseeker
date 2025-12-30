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
    }

    // 2. Enrich from ALL resumes (merging all unique data points)
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
