
const Job = require('../models/Job');
const Application = require('../models/Application');
const InterviewSlot = require('../models/InterviewSlot');
const mongoose = require('mongoose');

exports.getDashboardAnalytics = async (req, res) => {
    try {
        const employerId = req.user.id;

        // 1. Overall Stats
        const totalJobs = await Job.countDocuments({ employer: employerId });
        const activeJobs = await Job.countDocuments({ employer: employerId, status: 'published' });
        const totalApplications = await Application.countDocuments({ employer: employerId });
        const totalInterviews = await InterviewSlot.countDocuments({ employer: employerId, status: 'confirmed' });
        const hiresMade = await Application.countDocuments({ employer: employerId, status: 'hired' });

        // 2. Job Performance (Top 5 jobs by applications)
        const jobPerformance = await Job.find({ employer: employerId })
            .select('title status stats createdAt')
            .sort({ 'stats.applications': -1 })
            .limit(5);

        // 3. Application Status Distribution (Funnel)
        const applicationStats = await Application.aggregate([
            { $match: { employer: new mongoose.Types.ObjectId(employerId) } },
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        // Normalize application stats for funnel
        const funnelData = applicationStats.map(stat => ({
            status: stat._id,
            count: stat.count
        }));

        // 4. Interview Status Stats
        const interviewStats = await InterviewSlot.aggregate([
            { $match: { employer: new mongoose.Types.ObjectId(employerId) } },
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        const interviewData = interviewStats.map(stat => ({
            status: stat._id,
            count: stat.count
        }));


        res.status(200).json({
            success: true,
            data: {
                summary: {
                    totalJobs,
                    activeJobs,
                    totalApplications,
                    totalInterviews,
                    hiresMade,
                    conversionRate: totalJobs > 0 ? ((hiresMade / totalApplications) * 100).toFixed(1) : 0
                },
                jobPerformance,
                funnelData,
                interviewData
            }
        });

    } catch (error) {
        console.error('Analytics Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch analytics data'
        });
    }
};

exports.getJobPerformance = async (req, res) => {
    try {
        const employerId = req.user.id;
        const { days = 30 } = req.query;

        // Fetch all jobs with stats
        const jobs = await Job.find({ employer: employerId })
            .select('title stats status createdAt')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: jobs
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getCandidateInsights = async (req, res) => {
    try {
        const employerId = req.user.id;

        // Detailed Hiring Pipeline
        const pipeline = await Application.aggregate([
            { $match: { employer: new mongoose.Types.ObjectId(employerId) } },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    avgRating: { $avg: '$rating' }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: pipeline
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
