const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const interviewController = require('../controllers/interviewController');
const googleCalendarService = require('../services/googleCalendarService');
const logger = require('../utils/logger');

// All routes require authentication
router.use(protect);

// @route   POST /api/v1/interviews/add-slot
// @desc    Add a single interview slot (incremental)
// @access  Private/Employer
router.post('/add-slot', authorize('employer'), interviewController.addSingleSlot);

// @route   POST /api/v1/interviews/propose
// @desc    Propose interview slots
// @access  Private/Employer
router.post('/propose', authorize('employer'), interviewController.proposeInterviewSlots);

// @route   GET /api/v1/interviews/slots/:applicationId
// @desc    Get interview slots for an application
// @access  Private
router.get('/slots/:applicationId', interviewController.getInterviewSlots);

// @route   POST /api/v1/interviews/vote
// @desc    Vote on interview slots
// @access  Private/JobSeeker
router.post('/vote', authorize('jobseeker'), interviewController.voteOnSlots);

// @route   POST /api/v1/interviews/confirm
// @desc    Confirm interview slot (Employer or Candidate - one-click booking)
// @access  Private (Both Employer and Candidate)
router.post('/confirm', async (req, res, next) => {
  // Check if user is employer or candidate and route accordingly
  if (req.user.role === 'employer') {
    return interviewController.confirmInterviewSlot(req, res, next);
  } else if (req.user.role === 'jobseeker') {
    return interviewController.candidateConfirmSlot(req, res, next);
  } else {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }
});

// @route   GET /api/v1/interviews/ai-suggestions
// @desc    Get AI suggestions for optimal interview times
// @access  Private/Employer
router.get('/ai-suggestions', authorize('employer'), interviewController.getAISuggestions);

// @route   GET /api/v1/interviews/employer/slots
// @desc    Get all interview slots for employer
// @access  Private/Employer
router.get('/employer/slots', authorize('employer'), interviewController.getEmployerInterviewSlots);

// @route   GET /api/v1/interviews/candidate/slots
// @desc    Get all interview slots for candidate
// @access  Private/JobSeeker
router.get('/candidate/slots', authorize('jobseeker'), interviewController.getCandidateInterviewSlots);

// @route   POST /api/v1/interviews/cancel
// @desc    Cancel a confirmed interview (requires 4 hours notice)
// @access  Private (Both Employer and Candidate)
router.post('/cancel', interviewController.cancelInterview);

// Google Calendar OAuth routes
// @route   GET /api/v1/interviews/calendar/auth
// @desc    Get Google Calendar authorization URL
// @access  Private
router.get('/calendar/auth', (req, res) => {
  const authUrl = googleCalendarService.getAuthUrl();
  return res.json({ success: true, authUrl });
});

// @route   GET /api/v1/interviews/calendar/oauth/callback
// @desc    Handle Google Calendar OAuth callback
// @access  Private
router.get('/calendar/oauth/callback', async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) {
      return res.redirect(`${process.env.CLIENT_URL}/employer-dashboard?calendar_auth=error`);
    }

    const tokens = await googleCalendarService.getTokens(code);
    
    // Store tokens in user document (you'll need to implement this)
    // await User.findByIdAndUpdate(req.user._id, { googleCalendarTokens: tokens });

    return res.redirect(`${process.env.CLIENT_URL}/employer-dashboard?calendar_auth=success`);
  } catch (error) {
    logger.error('Calendar OAuth error:', error);
    return res.redirect(`${process.env.CLIENT_URL}/employer-dashboard?calendar_auth=error`);
  }
});

module.exports = router;

