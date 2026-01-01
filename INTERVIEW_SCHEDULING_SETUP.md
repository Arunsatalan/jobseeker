# AI-Powered Interview Scheduling System - Setup Guide

## Overview
This system enables employers to propose multiple interview time slots, candidates to vote/rank their preferences, and AI to automatically match the best slot with high confidence.

## Features Implemented

### 1. **Backend Components**
- ✅ `InterviewSlot` MongoDB model for storing proposals, votes, and confirmations
- ✅ Google Calendar API integration service
- ✅ AI matching algorithm service
- ✅ Interview controller with full CRUD operations
- ✅ Email notifications for interview proposals
- ✅ Notification system integration

### 2. **Frontend Components**
- ✅ `InterviewSlotProposal` - Employer interface for proposing slots
- ✅ `InterviewSlotVoting` - Candidate interface for voting on slots
- ✅ Integration with `ApplicantTracking` component
- ✅ Integration with `CareerProgress` component for notifications

### 3. **Key Features**
- ✅ AI-powered slot suggestions based on calendar availability
- ✅ Candidate voting with ranking (1-5 preferences)
- ✅ Auto-confirmation when AI confidence ≥75%
- ✅ Google Calendar event creation
- ✅ Real-time notifications
- ✅ Mobile-responsive design

## Setup Instructions

### Step 1: Install Backend Dependencies

```bash
cd Backend
npm install googleapis
```

### Step 2: Configure Environment Variables

Add to `Backend/.env`:

```env
# Google Calendar API
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:5000/api/v1/interviews/calendar/oauth/callback
GOOGLE_API_KEY=your-google-api-key

# OpenAI (for AI matching - optional but recommended)
OPENAI_API_KEY=your-openai-api-key
OPENAI_MODEL=gpt-3.5-turbo
```

### Step 3: Set Up Google Calendar API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable "Google Calendar API"
4. Create OAuth 2.0 credentials:
   - Application type: Web application
   - Authorized redirect URIs: `http://localhost:5000/api/v1/interviews/calendar/oauth/callback`
5. Copy Client ID and Client Secret to `.env`

### Step 4: Update User Model (Optional)

Add Google Calendar tokens to User model if not already present:

```javascript
// Backend/src/models/User.js
googleCalendarTokens: {
  access_token: String,
  refresh_token: String,
  expiry_date: Number,
}
```

### Step 5: Test the System

1. **As Employer:**
   - Navigate to Applicant Tracking
   - Click "Schedule Interview" on a shortlisted candidate
   - Propose 5-10 time slots
   - Use AI suggestions for optimal times
   - Submit proposal

2. **As Candidate:**
   - Check notifications (bell icon in navbar)
   - Or check Career Progress component
   - Click "Vote Now" on interview notification
   - Rank at least 3 slots (1 = most preferred)
   - Submit votes

3. **Auto-Confirmation:**
   - If AI confidence ≥75%, interview auto-confirms
   - Both parties receive notifications
   - Google Calendar event created (if connected)

## API Endpoints

### Interview Management
- `POST /api/v1/interviews/propose` - Propose interview slots (Employer)
- `GET /api/v1/interviews/slots/:applicationId` - Get slots for application
- `POST /api/v1/interviews/vote` - Vote on slots (Candidate)
- `POST /api/v1/interviews/confirm` - Manually confirm slot (Employer)
- `GET /api/v1/interviews/ai-suggestions` - Get AI suggestions (Employer)
- `GET /api/v1/interviews/employer/slots` - Get all employer slots
- `GET /api/v1/interviews/candidate/slots` - Get all candidate slots

### Google Calendar OAuth
- `GET /api/v1/interviews/calendar/auth` - Get OAuth URL
- `GET /api/v1/interviews/calendar/oauth/callback` - OAuth callback

## User Flow

### Employer Flow:
1. View applicant in tracking system
2. Click "Schedule Interview" button
3. Modal opens with calendar interface
4. Optionally use AI suggestions
5. Add 5-10 time slots manually or via AI
6. Set voting deadline (3-5 days recommended)
7. Submit proposal
8. Candidate receives notification
9. Wait for votes or auto-confirmation
10. Review votes and confirm if needed
11. Google Calendar event created

### Candidate Flow:
1. Receive notification about interview slots
2. Click notification or navigate to Career Progress
3. View all proposed time slots
4. Rank preferences (1-5) for at least 3 slots
5. Mark availability (Available/Maybe/Unavailable)
6. Add notes if needed
7. Submit votes
8. If AI confidence high, interview auto-confirms
9. Receive confirmation notification
10. Interview added to calendar

## AI Matching Algorithm

The AI matching considers:
- **Candidate Preference** (40%): Rank 1 = 100 points, Rank 5 = 20 points
- **Availability Status** (30%): Available = +30, Maybe = +10
- **Time Optimization** (20%): Business hours (9-5) = +20, Weekdays = +15
- **Recency** (10%): 1-7 days = +15, 1-2 weeks = +5
- **Historical Data** (AI Score): Based on past successful interviews

**Confidence Calculation:**
- Score difference >50: 90% confidence
- Score difference >30: 80% confidence
- Score difference >15: 70% confidence
- Otherwise: 60% confidence

**Auto-Confirm Threshold:** 75% confidence (configurable)

## Database Schema

### InterviewSlot Model:
```javascript
{
  application: ObjectId,
  job: ObjectId,
  employer: ObjectId,
  candidate: ObjectId,
  proposedSlots: [{
    startTime: Date,
    endTime: Date,
    timezone: String,
    meetingType: String,
    meetingLink: String,
    location: String,
    notes: String,
    aiScore: Number
  }],
  candidateVotes: [{
    slotIndex: Number,
    rank: Number (1-5),
    notes: String,
    availability: String,
    votedAt: Date
  }],
  confirmedSlot: {
    slotIndex: Number,
    startTime: Date,
    endTime: Date,
    meetingLink: String,
    calendarEventId: String,
    confirmedAt: Date,
    confirmedBy: String
  },
  status: String,
  aiMatchData: {
    bestSlotIndex: Number,
    confidence: Number,
    reasoning: String,
    matchedAt: Date
  },
  votingDeadline: Date
}
```

## Pros & Cons

### Pros:
✅ Reduces back-and-forth email communication
✅ AI optimizes scheduling based on multiple factors
✅ Improves candidate experience with voting
✅ Automatic confirmation saves time
✅ Calendar integration for seamless scheduling
✅ Mobile-responsive for on-the-go access
✅ Real-time notifications keep everyone informed

### Cons:
⚠️ Requires Google Calendar API setup
⚠️ AI matching may not always be perfect
⚠️ Requires candidates to actively vote
⚠️ Timezone handling can be complex
⚠️ API rate limits may apply

## Potential Challenges & Solutions

### Challenge 1: Google Calendar API Rate Limits
**Solution:** Implement caching and batch operations. Use refresh tokens for long-term access.

### Challenge 2: Timezone Confusion
**Solution:** Always display times in user's local timezone. Store UTC in database.

### Challenge 3: No Votes Before Deadline
**Solution:** Send reminder notifications 24 hours before deadline. Allow employer to extend deadline.

### Challenge 4: Low AI Confidence
**Solution:** Fall back to manual confirmation. Show reasoning to employer for decision-making.

### Challenge 5: Calendar Sync Issues
**Solution:** Implement retry logic. Provide manual calendar link as fallback.

## Future Enhancements

1. **Multi-round Interviews:** Support for multiple interview stages
2. **Group Interviews:** Schedule multiple candidates simultaneously
3. **Interviewer Availability:** Check multiple interviewer calendars
4. **Rescheduling:** Allow rescheduling with new slot proposals
5. **Analytics:** Track interview success rates by time/day
6. **SMS Notifications:** Add SMS for time-sensitive reminders
7. **Video Integration:** Direct Zoom/Teams integration
8. **Interview Prep:** AI-generated interview questions based on job description

## Testing Checklist

- [ ] Employer can propose slots
- [ ] AI suggestions load correctly
- [ ] Candidate receives notification
- [ ] Candidate can vote on slots
- [ ] Ranking system works (1-5)
- [ ] Auto-confirmation triggers at 75% confidence
- [ ] Manual confirmation works
- [ ] Google Calendar event created
- [ ] Notifications sent correctly
- [ ] Mobile responsive design
- [ ] Timezone handling correct
- [ ] Deadline enforcement works

## Support

For issues or questions:
1. Check backend logs: `Backend/logs/app.log`
2. Check browser console for frontend errors
3. Verify environment variables are set
4. Test API endpoints with Postman/Thunder Client
5. Check MongoDB for data consistency

---

**Status:** ✅ Fully Implemented and Ready for Testing

