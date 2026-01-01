const InterviewSlot = require('../models/InterviewSlot');
const Application = require('../models/Application');
const Notification = require('../models/Notification');
const googleCalendarService = require('../services/googleCalendarService');
const interviewAIService = require('../services/interviewAIService');
const emailService = require('../services/emailService');
const asyncHandler = require('../middleware/async');
const { sendSuccess, sendError } = require('../utils/response');
const logger = require('../utils/logger');

// @desc Add a single interview slot (for incremental adding)
// @route POST /api/v1/interviews/add-slot
// @access Private/Employer
exports.addSingleSlot = asyncHandler(async (req, res, next) => {
  const { applicationId, slot, votingDeadline, meetingType } = req.body;

  const application = await Application.findById(applicationId)
    .populate('job', 'title')
    .populate('applicant', 'email firstName lastName')
    .populate('employer', 'email firstName lastName');

  if (!application) {
    return sendError(res, 404, 'Application not found');
  }

  if (application.employer._id.toString() !== req.user._id.toString()) {
    return sendError(res, 403, 'Not authorized to add slots for this application');
  }

  // Find or create interview slot
  let interviewSlot = await InterviewSlot.findOne({ application: applicationId });

  if (!interviewSlot) {
    // Create new interview slot
    const deadline = votingDeadline ? new Date(votingDeadline) : new Date();
    deadline.setDate(deadline.getDate() + 3); // Default 3 days

    interviewSlot = await InterviewSlot.create({
      application: applicationId,
      job: application.job._id,
      employer: req.user._id,
      candidate: application.applicant._id,
      proposedSlots: [],
      votingDeadline: deadline,
      status: 'pending',
    });
  }

  // Add the new slot
  const newSlot = {
    startTime: new Date(slot.startTime),
    endTime: new Date(slot.endTime),
    timezone: slot.timezone || 'UTC',
    meetingType: meetingType || 'video',
    meetingLink: slot.meetingLink || '',
    location: slot.location || '',
    notes: slot.notes || '',
    aiScore: slot.aiScore || 0,
  };

  interviewSlot.proposedSlots.push(newSlot);
  
  // Update status to voting if we have at least one slot
  if (interviewSlot.proposedSlots.length >= 1) {
    interviewSlot.status = 'voting';
  }

  await interviewSlot.save();

  logger.info(`Single slot added for application ${applicationId}`);

  return sendSuccess(res, 200, 'Slot added successfully', interviewSlot);
});

// @desc Propose interview slots
// @route POST /api/v1/interviews/propose
// @access Private/Employer
exports.proposeInterviewSlots = asyncHandler(async (req, res, next) => {
  const { applicationId, proposedSlots, votingDeadline, meetingType } = req.body;

  const application = await Application.findById(applicationId)
    .populate('job', 'title')
    .populate('applicant', 'email firstName lastName')
    .populate('employer', 'email firstName lastName');

  if (!application) {
    return sendError(res, 404, 'Application not found');
  }

  if (application.employer._id.toString() !== req.user._id.toString()) {
    return sendError(res, 403, 'Not authorized to propose slots for this application');
  }

  // Validate proposed slots
  if (!proposedSlots || !Array.isArray(proposedSlots) || proposedSlots.length < 1) {
    return sendError(res, 400, 'Please propose at least 1 time slot');
  }

  // Validate voting deadline
  const deadline = new Date(votingDeadline);
  if (deadline <= new Date()) {
    return sendError(res, 400, 'Voting deadline must be in the future');
  }

  // Check if interview slot already exists
  let interviewSlot = await InterviewSlot.findOne({ application: applicationId });

  if (interviewSlot) {
    // Update existing proposal
    interviewSlot.proposedSlots = proposedSlots.map(slot => ({
      startTime: new Date(slot.startTime),
      endTime: new Date(slot.endTime),
      timezone: slot.timezone || 'UTC',
      meetingType: meetingType || 'video',
      meetingLink: slot.meetingLink || '',
      location: slot.location || '',
      notes: slot.notes || '',
      aiScore: slot.aiScore || 0,
    }));
    interviewSlot.votingDeadline = deadline;
    interviewSlot.status = 'voting';
  } else {
    // Create new interview slot proposal
    interviewSlot = await InterviewSlot.create({
      application: applicationId,
      job: application.job._id,
      employer: req.user._id,
      candidate: application.applicant._id,
      proposedSlots: proposedSlots.map(slot => ({
        startTime: new Date(slot.startTime),
        endTime: new Date(slot.endTime),
        timezone: slot.timezone || 'UTC',
        meetingType: meetingType || 'video',
        meetingLink: slot.meetingLink || '',
        location: slot.location || '',
        notes: slot.notes || '',
        aiScore: slot.aiScore || 0,
      })),
      votingDeadline: deadline,
      status: 'voting',
    });
  }

  // Calculate AI scores for slots
  const aiScores = await Promise.all(
    interviewSlot.proposedSlots.map(async (slot, index) => {
      const score = interviewAIService.suggestOptimalSlot([slot]);
      interviewSlot.proposedSlots[index].aiScore = score?.allScores?.[0]?.score || 0;
      return interviewSlot.proposedSlots[index];
    })
  );
  interviewSlot.proposedSlots = aiScores;
  await interviewSlot.save();

  // Send notification to candidate
  try {
    await Notification.create({
      user: application.applicant._id,
      userId: application.applicant._id,
      type: 'application_status',
      title: 'Interview Slots Available',
      message: `Interview time slots have been proposed for ${application.job.title}. Please vote for your preferred times.`,
      relatedJob: application.job._id,
      relatedApplication: applicationId,
      actionUrl: `/applications/${applicationId}/interview-slots`,
      isRead: false,
    });

    // Send email notification
    await emailService.sendInterviewProposalEmail(
      application.applicant.email,
      application.job.title,
      interviewSlot.proposedSlots.length,
      deadline
    );

    interviewSlot.notificationsSent.proposalSent = true;
    await interviewSlot.save();
  } catch (error) {
    logger.warn('Failed to send notification:', error);
  }

  logger.info(`Interview slots proposed for application ${applicationId}`);

  return sendSuccess(res, 201, 'Interview slots proposed successfully', interviewSlot);
});

// @desc Get interview slots for candidate
// @route GET /api/v1/interviews/slots/:applicationId
// @access Private
exports.getInterviewSlots = asyncHandler(async (req, res, next) => {
  const { applicationId } = req.params;

  const interviewSlot = await InterviewSlot.findOne({ application: applicationId })
    .populate('job', 'title')
    .populate('employer', 'firstName lastName email')
    .populate('candidate', 'firstName lastName email');

  if (!interviewSlot) {
    return sendError(res, 404, 'Interview slots not found');
  }

  // Check authorization
  const isEmployer = interviewSlot.employer._id.toString() === req.user._id.toString();
  const isCandidate = interviewSlot.candidate._id.toString() === req.user._id.toString();

  if (!isEmployer && !isCandidate) {
    return sendError(res, 403, 'Not authorized to view these slots');
  }

  return sendSuccess(res, 200, 'Interview slots retrieved successfully', interviewSlot);
});

// @desc Vote on interview slots
// @route POST /api/v1/interviews/vote
// @access Private/JobSeeker
exports.voteOnSlots = asyncHandler(async (req, res, next) => {
  const { interviewSlotId, votes } = req.body;

  const interviewSlot = await InterviewSlot.findById(interviewSlotId)
    .populate('job', 'title')
    .populate('employer', 'firstName lastName email')
    .populate('candidate', 'email firstName lastName');

  if (!interviewSlot) {
    return sendError(res, 404, 'Interview slot not found');
  }

  if (interviewSlot.candidate._id.toString() !== req.user._id.toString()) {
    return sendError(res, 403, 'Not authorized to vote on these slots');
  }

  if (new Date() > interviewSlot.votingDeadline) {
    return sendError(res, 400, 'Voting deadline has passed');
  }

  if (interviewSlot.status === 'confirmed') {
    return sendError(res, 400, 'Interview slot has already been confirmed');
  }

  // Validate votes
  if (!votes || !Array.isArray(votes) || votes.length === 0) {
    return sendError(res, 400, 'Please provide at least one vote');
  }

  // Validate slot indices
  votes.forEach(vote => {
    if (vote.slotIndex < 0 || vote.slotIndex >= interviewSlot.proposedSlots.length) {
      return sendError(res, 400, `Invalid slot index: ${vote.slotIndex}`);
    }
  });

  // Update votes
  interviewSlot.candidateVotes = votes.map(vote => ({
    slotIndex: vote.slotIndex,
    rank: vote.rank,
    notes: vote.notes || '',
    availability: vote.availability || 'available',
    votedAt: new Date(),
  }));

  interviewSlot.status = 'voting';
  await interviewSlot.save();

  // Try to auto-confirm if confidence is high
  const autoConfirmResult = await interviewAIService.autoConfirmSlot(interviewSlotId, 75);

  if (autoConfirmResult.confirmed) {
    // Send confirmation notifications
    try {
      await Notification.create({
        user: interviewSlot.candidate._id,
        userId: interviewSlot.candidate._id,
        type: 'application_status',
        title: 'Interview Confirmed',
        message: `Your interview for ${interviewSlot.job.title} has been confirmed.`,
        relatedJob: interviewSlot.job._id,
        relatedApplication: interviewSlot.application,
        actionUrl: `/applications/${interviewSlot.application}/interview`,
        isRead: false,
      });

      await Notification.create({
        user: interviewSlot.employer._id,
        userId: interviewSlot.employer._id,
        type: 'application_status',
        title: 'Interview Auto-Confirmed',
        message: `Interview with ${interviewSlot.candidate.firstName} ${interviewSlot.candidate.lastName} has been auto-confirmed.`,
        relatedJob: interviewSlot.job._id,
        relatedApplication: interviewSlot.application,
        isRead: false,
      });

      interviewSlot.notificationsSent.confirmedSent = true;
      await interviewSlot.save();
    } catch (error) {
      logger.warn('Failed to send confirmation notifications:', error);
    }
  }

  logger.info(`Votes submitted for interview slot ${interviewSlotId}`);

  return sendSuccess(res, 200, 'Votes submitted successfully', {
    interviewSlot,
    autoConfirmed: autoConfirmResult.confirmed,
    confidence: autoConfirmResult.confidence,
  });
});

// @desc Confirm interview slot manually
// @route POST /api/v1/interviews/confirm
// @access Private/Employer
exports.confirmInterviewSlot = asyncHandler(async (req, res, next) => {
  const { interviewSlotId, slotIndex, createCalendarEvent } = req.body;

  const interviewSlot = await InterviewSlot.findById(interviewSlotId)
    .populate('job', 'title')
    .populate('employer', 'email firstName lastName')
    .populate('candidate', 'email firstName lastName phone');

  if (!interviewSlot) {
    return sendError(res, 404, 'Interview slot not found');
  }

  if (interviewSlot.employer._id.toString() !== req.user._id.toString()) {
    return sendError(res, 403, 'Not authorized to confirm this interview');
  }

  if (slotIndex < 0 || slotIndex >= interviewSlot.proposedSlots.length) {
    return sendError(res, 400, 'Invalid slot index');
  }

  const selectedSlot = interviewSlot.proposedSlots[slotIndex];
  let calendarEventId = null;
  let meetingLink = selectedSlot.meetingLink;

  // Create Google Calendar event if requested
  if (createCalendarEvent && req.user.googleCalendarTokens) {
    try {
      const calendarResult = await googleCalendarService.createCalendarEvent(
        req.user.googleCalendarTokens,
        {
          title: `Interview: ${interviewSlot.job.title}`,
          description: `Interview with ${interviewSlot.candidate.firstName} ${interviewSlot.candidate.lastName}`,
          startTime: selectedSlot.startTime.toISOString(),
          endTime: selectedSlot.endTime.toISOString(),
          timezone: selectedSlot.timezone,
          meetingLink: selectedSlot.meetingLink,
          attendees: [
            { email: interviewSlot.candidate.email },
            { email: interviewSlot.employer.email },
          ],
        }
      );

      calendarEventId = calendarResult.eventId;
      meetingLink = calendarResult.meetingLink || meetingLink;
    } catch (error) {
      logger.warn('Failed to create calendar event:', error);
      // Continue without calendar event
    }
  }

  // Update interview slot
  interviewSlot.confirmedSlot = {
    slotIndex,
    startTime: selectedSlot.startTime,
    endTime: selectedSlot.endTime,
    meetingLink,
    calendarEventId,
    confirmedAt: new Date(),
    confirmedBy: 'employer',
  };

  interviewSlot.status = 'confirmed';
  await interviewSlot.save();

  // Update application status
  await Application.findByIdAndUpdate(interviewSlot.application, {
    status: 'interview',
    interviewDate: selectedSlot.startTime,
    interviewLink: meetingLink,
  });

  // Send notifications
  try {
    await Notification.create({
      user: interviewSlot.candidate._id,
      userId: interviewSlot.candidate._id,
      type: 'application_status',
      title: 'Interview Confirmed',
      message: `Your interview for ${interviewSlot.job.title} has been confirmed for ${new Date(selectedSlot.startTime).toLocaleString()}.`,
      relatedJob: interviewSlot.job._id,
      relatedApplication: interviewSlot.application,
      actionUrl: `/applications/${interviewSlot.application}/interview`,
      isRead: false,
    });

    interviewSlot.notificationsSent.confirmedSent = true;
    await interviewSlot.save();
  } catch (error) {
    logger.warn('Failed to send notification:', error);
  }

  logger.info(`Interview slot confirmed: ${interviewSlotId}`);

  return sendSuccess(res, 200, 'Interview slot confirmed successfully', interviewSlot);
});

// @desc Get AI suggestions for optimal slots
// @route GET /api/v1/interviews/ai-suggestions
// @access Private/Employer
exports.getAISuggestions = asyncHandler(async (req, res, next) => {
  const { startDate, endDate, durationMinutes = 60 } = req.query;

  if (!startDate || !endDate) {
    return sendError(res, 400, 'Start date and end date are required');
  }

  // Get user's calendar availability if connected
  let availableSlots = [];
  if (req.user.googleCalendarTokens) {
    try {
      availableSlots = await googleCalendarService.getAvailableSlots(
        req.user.googleCalendarTokens,
        new Date(startDate),
        new Date(endDate),
        parseInt(durationMinutes)
      );
    } catch (error) {
      logger.warn('Failed to get calendar availability:', error);
    }
  }

  // If no calendar slots available, generate default time slots
  if (availableSlots.length === 0) {
    // Generate default slots for the next 2 weeks (business hours)
    const start = new Date(startDate);
    const end = new Date(endDate);
    const current = new Date(start);
    
    while (current < end && availableSlots.length < 20) {
      const dayOfWeek = current.getDay();
      // Only weekdays (Monday-Friday)
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        // Generate slots for 9 AM, 11 AM, 2 PM, 4 PM
        const times = [9, 11, 14, 16];
        for (const hour of times) {
          const slotStart = new Date(current);
          slotStart.setHours(hour, 0, 0, 0);
          const slotEnd = new Date(slotStart);
          slotEnd.setHours(hour + 1, 0, 0, 0);
          
          if (slotStart >= start && slotEnd <= end) {
            availableSlots.push({
              start: slotStart,
              end: slotEnd,
            });
          }
        }
      }
      current.setDate(current.getDate() + 1);
    }
  }

  // Generate AI-suggested optimal slots
  const slotsForAI = availableSlots.map(slot => ({
    startTime: slot.start,
    endTime: slot.end,
  }));

  const suggestions = slotsForAI.length > 0 
    ? interviewAIService.suggestOptimalSlot(slotsForAI)
    : null;

  return sendSuccess(res, 200, 'AI suggestions retrieved successfully', {
    suggestions,
    availableSlots: availableSlots.map(slot => ({
      start: slot.start.toISOString(),
      end: slot.end.toISOString(),
    })),
  });
});

// @desc Get interview slots for employer
// @route GET /api/v1/interviews/employer/slots
// @access Private/Employer
exports.getEmployerInterviewSlots = asyncHandler(async (req, res, next) => {
  const { status, jobId } = req.query;

  const query = { employer: req.user._id };
  if (status) query.status = status;
  if (jobId) query.job = jobId;

  const interviewSlots = await InterviewSlot.find(query)
    .populate('job', 'title')
    .populate('candidate', 'firstName lastName email')
    .populate('application', 'status')
    .sort({ createdAt: -1 });

  return sendSuccess(res, 200, 'Interview slots retrieved successfully', interviewSlots);
});

// @desc Get interview slots for candidate
// @route GET /api/v1/interviews/candidate/slots
// @access Private/JobSeeker
exports.getCandidateInterviewSlots = asyncHandler(async (req, res, next) => {
  const { status } = req.query;

  const query = { candidate: req.user._id };
  if (status) query.status = status;

  const interviewSlots = await InterviewSlot.find(query)
    .populate('job', 'title company')
    .populate('employer', 'firstName lastName')
    .populate('application', 'status')
    .sort({ createdAt: -1 });

  return sendSuccess(res, 200, 'Interview slots retrieved successfully', interviewSlots);
});

// @desc Cancel a confirmed interview
// @route POST /api/v1/interviews/cancel
// @access Private (Both Employer and Candidate)
exports.cancelInterview = asyncHandler(async (req, res, next) => {
  const { interviewSlotId, reason } = req.body;

  const interviewSlot = await InterviewSlot.findById(interviewSlotId)
    .populate('job', 'title')
    .populate('employer', 'email firstName lastName')
    .populate('candidate', 'email firstName lastName');

  if (!interviewSlot) {
    return sendError(res, 404, 'Interview slot not found');
  }

  // Check authorization - either employer or candidate can cancel
  const isEmployer = interviewSlot.employer._id.toString() === req.user._id.toString();
  const isCandidate = interviewSlot.candidate._id.toString() === req.user._id.toString();

  if (!isEmployer && !isCandidate) {
    return sendError(res, 403, 'Not authorized to cancel this interview');
  }

  // Check if interview is confirmed
  if (interviewSlot.status !== 'confirmed') {
    return sendError(res, 400, 'Only confirmed interviews can be cancelled');
  }

  // Check if interview has a confirmed slot with start time
  if (!interviewSlot.confirmedSlot || !interviewSlot.confirmedSlot.startTime) {
    return sendError(res, 400, 'Interview does not have a confirmed time slot');
  }

  // Check if cancellation is at least 4 hours before the interview
  const interviewStartTime = new Date(interviewSlot.confirmedSlot.startTime);
  const now = new Date();
  const hoursUntilInterview = (interviewStartTime.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (hoursUntilInterview < 4) {
    return sendError(res, 400, 'Interviews can only be cancelled at least 4 hours before the scheduled time');
  }

  // Update interview status
  interviewSlot.status = 'cancelled';
  interviewSlot.cancelledAt = new Date();
  interviewSlot.cancelledBy = isEmployer ? 'employer' : 'candidate';
  interviewSlot.cancellationReason = reason || 'No reason provided';
  await interviewSlot.save();

  // Send notifications
  try {
    const cancelledByName = isEmployer 
      ? `${interviewSlot.employer.firstName} ${interviewSlot.employer.lastName}`
      : `${interviewSlot.candidate.firstName} ${interviewSlot.candidate.lastName}`;

    // Notify the other party
    const notifyUser = isEmployer ? interviewSlot.candidate : interviewSlot.employer;
    await Notification.create({
      user: notifyUser._id,
      userId: notifyUser._id,
      type: 'interview_cancelled',
      title: 'Interview Cancelled',
      message: `The interview for ${interviewSlot.job.title} scheduled for ${interviewStartTime.toLocaleString()} has been cancelled by ${cancelledByName}.`,
      relatedJob: interviewSlot.job._id,
      relatedApplication: interviewSlot.application,
      isRead: false,
    });

    // Also notify the person who cancelled
    await Notification.create({
      user: req.user._id,
      userId: req.user._id,
      type: 'interview_cancelled',
      title: 'Interview Cancelled',
      message: `You have cancelled the interview for ${interviewSlot.job.title} scheduled for ${interviewStartTime.toLocaleString()}.`,
      relatedJob: interviewSlot.job._id,
      relatedApplication: interviewSlot.application,
      isRead: false,
    });
  } catch (error) {
    logger.warn('Failed to send cancellation notifications:', error);
  }

  logger.info(`Interview cancelled: ${interviewSlotId} by ${isEmployer ? 'employer' : 'candidate'}`);

  return sendSuccess(res, 200, 'Interview cancelled successfully', interviewSlot);
});

