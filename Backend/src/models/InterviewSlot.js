const mongoose = require('mongoose');

const interviewSlotSchema = new mongoose.Schema(
  {
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      required: true,
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    employer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Proposed time slots by employer
    proposedSlots: [{
      startTime: {
        type: Date,
        required: true,
      },
      endTime: {
        type: Date,
        required: true,
      },
      timezone: {
        type: String,
        default: 'UTC',
      },
      meetingType: {
        type: String,
        enum: ['video', 'phone', 'in-person'],
        default: 'video',
      },
      meetingLink: String, // Google Meet link
      location: String, // For in-person interviews
      notes: String, // Additional notes from employer
      aiScore: {
        type: Number,
        default: 0, // AI-generated optimality score
      },
    }],
    // Candidate votes/rankings
    candidateVotes: [{
      slotIndex: {
        type: Number,
        required: true, // Index in proposedSlots array
      },
      rank: {
        type: Number,
        required: true, // 1 = most preferred, 5 = least preferred
        min: 1,
        max: 5,
      },
      notes: String, // Candidate's notes about this slot
      availability: {
        type: String,
        enum: ['available', 'maybe', 'unavailable'],
        default: 'available',
      },
      votedAt: {
        type: Date,
        default: Date.now,
      },
    }],
    // Confirmed interview details
    confirmedSlot: {
      slotIndex: Number, // Index of confirmed slot in proposedSlots
      startTime: Date,
      endTime: Date,
      meetingLink: String,
      calendarEventId: String, // Google Calendar event ID
      confirmedAt: Date,
      confirmedBy: {
        type: String,
        enum: ['employer', 'candidate', 'ai'],
      },
    },
    status: {
      type: String,
      enum: ['pending', 'voting', 'confirmed', 'cancelled', 'completed'],
      default: 'pending',
    },
    // Cancellation details
    cancelledAt: Date,
    cancelledBy: {
      type: String,
      enum: ['employer', 'candidate'],
    },
    cancellationReason: String,
    // AI matching data
    aiMatchData: {
      bestSlotIndex: Number,
      confidence: Number, // 0-100
      reasoning: String,
      matchedAt: Date,
    },
    // Notification tracking
    notificationsSent: {
      proposalSent: { type: Boolean, default: false },
      reminderSent: { type: Boolean, default: false },
      confirmedSent: { type: Boolean, default: false },
    },
    // Deadline for voting
    votingDeadline: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

// Indexes for efficient querying
interviewSlotSchema.index({ application: 1 });
interviewSlotSchema.index({ candidate: 1 });
interviewSlotSchema.index({ employer: 1 });
interviewSlotSchema.index({ status: 1 });
interviewSlotSchema.index({ 'confirmedSlot.startTime': 1 });
interviewSlotSchema.index({ votingDeadline: 1 });

module.exports = mongoose.model('InterviewSlot', interviewSlotSchema);

