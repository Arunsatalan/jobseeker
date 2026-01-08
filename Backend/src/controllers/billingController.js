
const User = require('../models/User');
const CreditTransaction = require('../models/CreditTransaction');
const mongoose = require('mongoose');

// Cost Configuration
const COSTS = {
    JOB_POST: 1.0, // 1 Credit buys 3 jobs? No, prompt says "1 credit = 3 job posts". So cost is 1/3 = 0.33
    APPLICATION: 0.02 // 1 credit = 50 applications. So cost is 1/50 = 0.02
};

// Precise costs to avoid floating point issues, maybe store as integer "microcredits"?
// Let's stick to floats for now but rounded.
const JOB_COST = 0.33;
const APP_COST = 0.02;

/**
 * Get current plan and credits
 */
exports.getBillingStatus = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('subscription stats');
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        res.status(200).json({
            success: true,
            data: {
                subscription: user.subscription,
                stats: user.stats
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Add credits (Mock payment)
 */
exports.addCredits = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { amount, packageId } = req.body; // packageId could be 'basic_pack' etc.
        // Mock logic: 1 credit = $10 ?
        // Prompt says "Add Buy Credits button".
        // For now, let's just add the requested amount for testing.

        // Validate amount (must be positive)
        const creditsToAdd = Number(amount);
        if (!creditsToAdd || creditsToAdd <= 0) {
            throw new Error('Invalid credit amount');
        }

        const user = await User.findById(req.user.id).session(session);

        user.subscription.credits = (user.subscription.credits || 0) + creditsToAdd;
        await user.save({ session });

        // Record Transaction
        await CreditTransaction.create([{
            employer: user._id,
            amount: creditsToAdd,
            type: 'purchase',
            description: `Purchased ${creditsToAdd} credits`
        }], { session });

        await session.commitTransaction();

        res.status(200).json({
            success: true,
            data: {
                credits: user.subscription.credits,
                message: 'Credits added successfully'
            }
        });
    } catch (error) {
        await session.abortTransaction();
        res.status(500).json({ success: false, message: error.message });
    } finally {
        session.endSession();
    }
};

/**
 * Upgrade Plan
 */
exports.upgradePlan = async (req, res) => {
    try {
        const { plan } = req.body;
        if (!['Professional', 'Enterprise'].includes(plan)) {
            return res.status(400).json({ success: false, message: 'Invalid plan' });
        }

        const user = await User.findById(req.user.id);
        user.subscription.plan = plan;
        user.subscription.status = 'active';
        await user.save();

        res.status(200).json({
            success: true,
            data: {
                plan: user.subscription.plan,
                message: `Upgraded to ${plan} successfully`
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Helper to check and deduct credits
 * Can be used by other controllers
 */
exports.checkAndDeductCredits = async (userId, action, session) => {
    const user = await User.findById(userId).session(session);
    const cost = action === 'JOB_POST' ? JOB_COST : action === 'APPLICATION' ? APP_COST : 0;

    if (user.subscription.plan !== 'Free' || action === 'JOB_POST') {
        // Paid users also deduct? "Paid users... credits are still deducted"
        // Free users deduct? "Deduct credits for every 3 job posts..."
        // Yes, everyone deducts.
    }

    let finalCost = cost;
    // Free Tier Constraint: Max 1 Job Post
    if (action === 'JOB_POST' && user.subscription.plan === 'Free') {
        if (user.stats.jobsPosted >= 1) {
            throw new Error('Free plan limit reached (1 Job Post). Please upgrade to Professional plan to post more jobs.');
        }
        // First job is free
        if (user.stats.jobsPosted < 1) {
            finalCost = 0;
        }
    }

    // Check balance for non-free actions or if cost > 0
    if (user.subscription.credits < finalCost) {
        throw new Error(`Insufficient credits. Required: ${finalCost}, Available: ${user.subscription.credits}. Please purchase more.`);
    }

    user.subscription.credits -= finalCost;
    // user.stats.jobsPosted increment happens in job controller
    await user.save({ session });

    // Async log transaction if convenient, or sync
    if (finalCost > 0) {
        await CreditTransaction.create([{
            employer: userId,
            amount: -finalCost,
            type: 'deduction',
            description: `Used for ${action}`
        }], { session });
    }

    return user.subscription.credits;
};
