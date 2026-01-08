# Smart Apply AI Flow

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
│  ApplicationModal.tsx                                           │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Profile    │  │   Resume     │  │    Cover     │         │
│  │   Analysis   │  │ Optimization │  │    Letter    │         │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘         │
│         │                  │                  │                  │
└─────────┼──────────────────┼──────────────────┼──────────────────┘
          │                  │                  │
          │ POST /api/v1/ai/ │                  │
          ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                         BACKEND                                  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  AI Routes (aiRoutes.js)                                 │  │
│  │  • /analyze-profile                                      │  │
│  │  • /optimize-resume                                      │  │
│  │  • /generate-cover-letter                                │  │
│  │  • /smart-apply (all-in-one)                             │  │
│  └────────────────────────┬─────────────────────────────────┘  │
│                            │                                     │
│                            ▼                                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  AI Controller (aiController.js)                         │  │
│  │  • Validates requests                                    │  │
│  │  • Fetches job & user data                               │  │
│  │  • Calls AI Service                                      │  │
│  │  • Returns formatted response                            │  │
│  └────────────────────────┬─────────────────────────────────┘  │
│                            │                                     │
│                            ▼                                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  AI Service (aiService.js)                               │  │
│  │  • Builds GPT prompts                                    │  │
│  │  • Makes OpenAI API calls                                │  │
│  │  • Handles errors                                        │  │
│  │  • Provides fallbacks                                    │  │
│  └────────────────────────┬─────────────────────────────────┘  │
│                            │                                     │
└────────────────────────────┼─────────────────────────────────────┘
                             │
                             │ HTTPS Request
                             ▼
                    ┌─────────────────┐
                    │   OpenAI API    │
                    │   GPT-3.5/4     │
                    └─────────────────┘
```

## Request Flow

### 1. User Clicks "Smart Apply"

```
User Action
    │
    ├─► Frontend: ApplicationModal opens
    │
    ├─► Step 1: Profile Review
    │   └─► performAIAnalysis() called
    │       └─► POST /api/v1/ai/analyze-profile
    │
    ├─► Step 2: Resume Optimization  
    │   └─► optimizeResume() called
    │       └─► POST /api/v1/ai/optimize-resume
    │
    └─► Step 3: Application Preview
        └─► generateAICoverLetter() called
            └─► POST /api/v1/ai/generate-cover-letter
```

### 2. Backend Processing

```
API Request
    │
    ├─► Authentication Check (JWT)
    │
    ├─► Controller: aiController.js
    │   ├─► Fetch Job from DB
    │   ├─► Get User Profile
    │   └─► Build request data
    │
    ├─► Service: aiService.js
    │   ├─► Check API key exists
    │   ├─► Build GPT prompt
    │   ├─► Call OpenAI API
    │   │   ├─► Success → Parse response
    │   │   └─► Error → Use fallback
    │   └─► Return formatted data
    │
    └─► Response sent to frontend
```

### 3. Data Flow Example

```javascript
// Frontend sends:
{
  jobId: "123abc",
  userProfile: {
    name: "John Doe",
    skills: ["JavaScript", "React"],
    experience: ["5 years..."],
    education: ["BS CS"],
    summary: "Experienced dev..."
  }
}

// Backend processes:
1. Fetch job details from DB
2. Build GPT prompt with job + profile
3. Call OpenAI API
4. Parse AI response

// Backend returns:
{
  success: true,
  data: {
    matchPercentage: 87,
    strengths: [
      "Strong JavaScript skills",
      "Relevant React experience"
    ],
    improvements: [
      "Add TypeScript to skillset",
      "Highlight leadership"
    ],
    suggestedSkills: ["TypeScript", "Docker"],
    detailedAnalysis: "Your profile shows..."
  }
}

// Frontend displays:
✓ 87% Match
✓ Strengths highlighted
✓ Improvement suggestions
✓ Skills to add
```

## Error Handling Flow

```
API Call
    │
    ├─► API Key Missing?
    │   └─► Use Fallback (rule-based)
    │
    ├─► API Call Failed?
    │   └─► Use Fallback (templates)
    │
    ├─► Rate Limited?
    │   └─► Use Fallback (cached)
    │
    └─► Success
        └─► Return AI response
```

## Fallback Mechanism

```
┌─────────────────────────────────────┐
│  Try: OpenAI API Call               │
│  ├─► Success → Return AI response   │
│  └─► Error → Fallback Mode          │
│      ├─► Rule-based matching        │
│      ├─► Template generation        │
│      └─► Basic analysis             │
└─────────────────────────────────────┘
```

## Security Flow

```
Request
    │
    ├─► JWT Token Validation
    │   └─► Invalid → 401 Unauthorized
    │
    ├─► User Authorization
    │   └─► Not allowed → 403 Forbidden
    │
    ├─► API Key (Backend Only)
    │   └─► Never exposed to frontend
    │
    └─► Proceed with request
```

## Performance Optimization

```
Request Received
    │
    ├─► Check Cache (future enhancement)
    │   ├─► Hit → Return cached result
    │   └─► Miss → Continue
    │
    ├─► Make API Call
    │   └─► Timeout: 30 seconds
    │
    ├─► Store in Cache (future)
    │
    └─► Return Response
```

## Monitoring Points

```
┌─────────────────────────────────────┐
│  Metrics to Track:                  │
│  • API call success rate            │
│  • Response time                    │
│  • Fallback usage                   │
│  • OpenAI costs                     │
│  • User satisfaction                │
└─────────────────────────────────────┘
```

## Cost Calculation

```
Per Application:
    Profile Analysis    → 1 API call (~500 tokens)
    Resume Optimization → 1 API call (~800 tokens)
    Cover Letter        → 1 API call (~400 tokens)
    ─────────────────────────────────────────────
    Total              → 3 API calls (~1700 tokens)

GPT-3.5-turbo Cost:
    Input:  $0.0015 / 1K tokens
    Output: $0.002 / 1K tokens
    ─────────────────────────────
    Per Application: ~$0.005 (half a cent!)

1000 applications = ~$5.00
```

## Future Enhancements

```
Planned Features:
    │
    ├─► Response Caching
    │   └─► Redis integration
    │
    ├─► Batch Processing
    │   └─► Queue system
    │
    ├─► A/B Testing
    │   └─► Different prompts
    │
    ├─► Analytics Dashboard
    │   └─► Success metrics
    │
    └─► Fine-tuned Models
        └─► Custom training
```
