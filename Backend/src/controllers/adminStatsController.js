const asyncHandler = require('../middleware/async');
const { sendSuccess, sendError } = require('../utils/response');
const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const CreditTransaction = require('../models/CreditTransaction');
const mongoose = require('mongoose');

// @desc Get overview statistics
// @route GET /api/v1/admin/stats/overview
// @access Private/Admin
exports.getOverviewStats = asyncHandler(async (req, res, next) => {
    const totalUsers = await User.countDocuments();
    const totalEmployers = await User.countDocuments({ role: 'employer' });
    const totalJobSeekers = await User.countDocuments({ role: 'jobseeker' });

    // Calculate new registrations (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newRegistrations = await User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });

    // Calculate daily active users (approximation based on lastLogin if available, or just recent activity)
    // Since we might not strictly track daily_active_users in a separate table yet, we can use lastLogin >= 24h ago
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    const dailyActiveUsers = await User.countDocuments({ lastLogin: { $gte: oneDayAgo } });

    const activeJobs = await Job.countDocuments({ status: 'published' });
    const totalApplications = await Application.countDocuments();

    // Additional Admin Stats
    const Message = require('../models/Message');
    const unreadMessages = await Message.countDocuments({ recipient: req.user.id, isRead: false });
    const flaggedContent = await Message.countDocuments({ flagged: true });

    // Aggregate job categories from Jobs
    const jobCategories = await Job.aggregate([
        { $match: { status: 'published' } },
        { $group: { _id: "$category", count: { $sum: 1 } } }, // Assuming 'category' field exists, or we use 'industry'
        { $sort: { count: -1 } },
        { $limit: 5 }
    ]);

    // Format categories helper
    const formatCategories = (cats) => cats.map(c => ({ name: c._id || 'Uncategorized', value: c.count }));

    const responseData = {
        userStats: {
            totalUsers,
            totalEmployers,
            totalJobSeekers,
            newRegistrations,
            dailyActiveUsers
        },
        jobStats: {
            activeJobs,
            totalApplications,
            categories: jobCategories.length > 0 ? formatCategories(jobCategories) : []
        },
        adminStats: {
            unreadMessages,
            flaggedContent
        }
    };

    // Fallback if category is empty/null, might be Industry
    if (jobCategories.length === 0) {
        const industryCategories = await Job.aggregate([
            { $match: { status: 'published' } },
            { $group: { _id: "$industry", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);
        responseData.jobStats.categories = formatCategories(industryCategories);
    }

    return sendSuccess(res, 200, 'Overview stats retrieved', responseData);
});

// @desc Get revenue statistics
// @route GET /api/v1/admin/stats/revenue
// @access Private/Admin
exports.getRevenueStats = asyncHandler(async (req, res, next) => {
    try {
        // Check if collection exists/has data
        const count = await CreditTransaction.countDocuments();

        if (count === 0) {
            return sendSuccess(res, 200, 'Revenue stats retrieved (empty)', []);
        }

        // Monthly Revenue from CreditTransactions (type='purchase')
        const revenueAggregation = await CreditTransaction.aggregate([
            { $match: { type: 'purchase' } },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" }
                    },
                    revenue: { $sum: "$amount" }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } },
            { $limit: 6 } // Last 6 months typically
        ]);

        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const revenueData = revenueAggregation.map(item => {
            const MonthIndex = (item._id.month || 1) - 1;
            return {
                name: months[MonthIndex] || 'Unknown',
                revenue: item.revenue || 0,
                subscriptions: Math.floor((item.revenue || 0) / 49),
                year: item._id.year
            };
        });

        return sendSuccess(res, 200, 'Revenue stats retrieved', revenueData);
    } catch (error) {
        console.error("Revenue Stats Aggr Error:", error);
        // Return empty data instead of crashing
        return sendSuccess(res, 200, 'Revenue stats retrieved (fallback)', []);
    }
});

// @desc Get user growth statistics
// @route GET /api/v1/admin/stats/user-growth
// @access Private/Admin
exports.getUserGrowthStats = asyncHandler(async (req, res, next) => {
    const userGrowth = await User.aggregate([
        {
            $group: {
                _id: { $month: "$createdAt" },
                users: { $sum: 1 }
            }
        },
        { $sort: { "_id": 1 } }
    ]);

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const growthData = userGrowth.map(item => ({
        name: months[item._id - 1],
        users: item.users
    }));

    return sendSuccess(res, 200, 'User growth stats retrieved', growthData);
});

// @desc Get geographic statistics
// @route GET /api/v1/admin/stats/geography
// @access Private/Admin
exports.getGeographyStats = asyncHandler(async (req, res, next) => {
    // Aggregate by location
    // Simple aggregation on 'location' string field. Data quality depends on user input.
    const geoStats = await User.aggregate([
        { $match: { location: { $exists: true, $ne: "" } } },
        {
            $group: {
                _id: "$location",
                value: { $sum: 1 }
            }
        },
        { $sort: { value: -1 } },
        { $limit: 10 }
    ]);

    const formattedStats = geoStats.map(stat => ({
        name: stat._id,
        value: stat.value
    }));

    return sendSuccess(res, 200, 'Geography stats retrieved', formattedStats);
});

// @desc Get recent activities
// @route GET /api/v1/admin/activities/recent
// @access Private/Admin
exports.getRecentActivities = asyncHandler(async (req, res, next) => {
    // We will manually fetch recent items from multiple collections and merge them

    // 1. Recent Users
    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5).lean();
    const userActivities = recentUsers.map(u => ({
        id: u._id.toString(),
        user: `${u.firstName} ${u.lastName}`,
        action: "New Registration",
        time: u.createdAt,
        type: 'user'
    }));

    // 2. Recent Jobs
    const recentJobs = await Job.find().sort({ createdAt: -1 }).limit(5).populate('employer', 'firstName lastName').lean();
    const jobActivities = recentJobs.map(j => ({
        id: j._id.toString(),
        user: j.employer ? `${j.employer.firstName} ${j.employer.lastName}` : 'Unknown Employer',
        action: `Posted job: ${j.title}`,
        time: j.createdAt,
        type: 'job'
    }));

    // 3. Recent Applications
    const recentApps = await Application.find().sort({ createdAt: -1 }).limit(5).populate('applicant', 'firstName lastName').lean();
    const appActivities = recentApps.map(a => ({
        id: a._id.toString(),
        user: a.applicant ? `${a.applicant.firstName} ${a.applicant.lastName}` : 'Unknown Applicant',
        action: "Submitted Application",
        time: a.createdAt,
        type: 'application'
    }));

    // Merge and sort
    const allActivities = [...userActivities, ...jobActivities, ...appActivities]
        .sort((a, b) => new Date(b.time) - new Date(a.time))
        .slice(0, 10); // Top 10

    return sendSuccess(res, 200, 'Recent activities retrieved', allActivities);
});

// @desc Get applications statistics and list
// @route GET /api/v1/admin/stats/applications
// @access Private/Admin
exports.getApplicationsStats = asyncHandler(async (req, res, next) => {
    // 1. Stats Cards Data
    const total = await Application.countDocuments();
    const pending = await Application.countDocuments({ status: 'applied' });
    const inReview = await Application.countDocuments({ status: { $in: ['reviewing', 'shortlisted', 'interview', 'offered'] } });
    const hired = await Application.countDocuments({ status: 'accepted' });
    const rejected = await Application.countDocuments({ status: 'rejected' });

    // Simplified flagged logic 
    const flagged = 0;

    // 2. Trends Data (Last 6 Months)
    const trendsAggregation = await Application.aggregate([
        {
            $group: {
                _id: {
                    year: { $year: "$createdAt" },
                    month: { $month: "$createdAt" },
                    status: "$status"
                },
                count: { $sum: 1 }
            }
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const trendsMap = {};

    // Fill last 6 months 
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const name = monthNames[d.getMonth()];
        trendsMap[name] = { month: name, applied: 0, reviewed: 0, interviewed: 0, hired: 0 };
    }

    trendsAggregation.forEach(item => {
        const key = monthNames[item._id.month - 1];
        if (trendsMap[key]) {
            const status = item._id.status;
            if (status === 'applied') trendsMap[key].applied += item.count;
            if (['reviewing', 'shortlisted', 'offered'].includes(status)) trendsMap[key].reviewed += item.count;
            if (status === 'interview') trendsMap[key].interviewed += item.count;
            if (status === 'accepted') trendsMap[key].hired += item.count;
        }
    });
    const trendsData = Object.values(trendsMap);

    // 3. Status Distribution
    const statusDistribution = [
        { status: 'Applied', count: pending, color: '#3b82f6' },
        { status: 'In Review', count: inReview, color: '#f59e0b' },
        { status: 'Interview', count: await Application.countDocuments({ status: 'interview' }), color: '#8b5cf6' },
        { status: 'Rejected', count: rejected, color: '#ef4444' },
        { status: 'Hired', count: hired, color: '#10b981' },
    ];

    // 4. Detailed Applications List 
    const { status } = req.query;
    let query = {};
    if (status && status !== 'all') query.status = status.toLowerCase();

    const recentApplications = await Application.find(query)
        .populate('applicant', 'firstName lastName email profilePhoto')
        .populate({ path: 'job', select: 'title company', populate: { path: 'employer', select: 'firstName lastName' } })
        .sort({ createdAt: -1 })
        .limit(50);

    const formattedApplications = recentApplications.map(app => {
        const displayStatus = app.status ? (app.status.charAt(0).toUpperCase() + app.status.slice(1)) : 'Unknown';
        return {
            id: app._id,
            applicantName: app.applicant ? `${app.applicant.firstName} ${app.applicant.lastName}` : 'Unknown',
            applicantAvatar: app.applicant?.profilePhoto?.url || "",
            applicantEmail: app.applicant?.email || "",
            jobTitle: app.job?.title || "Unknown Job",
            company: "TechCorp (Demo)",
            companyLogo: "",
            status: displayStatus,
            appliedDate: app.createdAt,
            experience: "N/A",
            rating: app.rating || null,
            flagged: false,
            matchScore: app.aiScore || 0,
            resumeAttached: !!app.resume,
            coverLetter: !!app.coverLetter
        };
    });

    return sendSuccess(res, 200, 'Applications stats retrieved', {
        stats: { total, pending, inReview, hired, flagged },
        trends: trendsData.length > 0 ? trendsData : [{ month: 'No Data', applied: 0 }],
        distribution: statusDistribution,
        applications: formattedApplications
    });
});
