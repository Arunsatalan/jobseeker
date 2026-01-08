# AI Integration Setup Guide

## Overview
The Smart Apply feature uses OpenAI's GPT API to provide intelligent profile analysis, resume optimization, and cover letter generation.

## Features
- **AI Profile Analysis**: Analyzes how well your profile matches job requirements
- **Resume Optimization**: Provides ATS-optimized suggestions and keyword recommendations
- **Cover Letter Generation**: Creates personalized cover letters tailored to each job
- **Smart Apply**: Comprehensive AI assistance for job applications

## Setup Instructions

### 1. Get an OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in to your account
3. Navigate to API Keys section
4. Click "Create new secret key"
5. Copy the API key (you won't be able to see it again!)

### 2. Configure Backend

Add the following environment variables to your backend `.env` file:

```env
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-3.5-turbo
```

**Note**: You can use different models:
- `gpt-3.5-turbo` - Faster and cheaper (recommended for development)
- `gpt-4` - More accurate but more expensive
- `gpt-4-turbo` - Balance of speed and accuracy

### 3. Install Required Dependencies

The backend already includes `axios` for API calls. No additional dependencies needed.

### 4. API Endpoints

The following AI endpoints are available:

#### Analyze Profile
```
POST /api/v1/ai/analyze-profile
Authorization: Bearer <token>

Body:
{
  "jobId": "job_id_here",
  "userProfile": {
    "name": "John Doe",
    "email": "john@example.com",
    "skills": ["JavaScript", "React", "Node.js"],
    "experience": ["Software Engineer at Company X"],
    "education": ["BS Computer Science"],
    "summary": "Experienced developer..."
  }
}

Response:
{
  "success": true,
  "data": {
    "matchPercentage": 85,
    "strengths": ["Strong technical skills", ...],
    "improvements": ["Add more metrics", ...],
    "suggestedSkills": ["TypeScript", ...],
    "detailedAnalysis": "Your profile shows..."
  }
}
```

#### Optimize Resume
```
POST /api/v1/ai/optimize-resume
Authorization: Bearer <token>

Body: (same as analyze-profile)

Response:
{
  "success": true,
  "data": {
    "optimizedSummary": "Enhanced professional summary...",
    "keywordSuggestions": ["React", "Node.js", ...],
    "experienceImprovements": ["Add metrics", ...],
    "skillsToHighlight": ["JavaScript", ...],
    "formattingTips": ["Use bullet points", ...],
    "atsScore": 85
  }
}
```

#### Generate Cover Letter
```
POST /api/v1/ai/generate-cover-letter
Authorization: Bearer <token>

Body: (same as analyze-profile)

Response:
{
  "success": true,
  "data": {
    "coverLetter": "Dear Hiring Team,\n\n..."
  }
}
```

#### Smart Apply (All-in-One)
```
POST /api/v1/ai/smart-apply
Authorization: Bearer <token>

Body: (same as analyze-profile)

Response:
{
  "success": true,
  "data": {
    "analysis": { ... },
    "optimization": { ... },
    "coverLetter": "..."
  }
}
```

## Fallback Mechanism

If the OpenAI API key is not configured or the API call fails, the system automatically falls back to:
- Rule-based profile matching
- Template-based cover letters
- Basic resume optimization suggestions

This ensures the application continues to work even without AI integration.

## Cost Considerations

- GPT-3.5-turbo: ~$0.002 per request (very affordable)
- GPT-4: ~$0.03-0.06 per request (more expensive)

For development/testing, GPT-3.5-turbo is recommended. You can set usage limits in your OpenAI account.

## Security Best Practices

1. **Never commit your API key** to version control
2. Keep `.env` file in `.gitignore`
3. Use environment variables for all sensitive data
4. Rotate API keys periodically
5. Set usage limits in OpenAI dashboard

## Troubleshooting

### API Key Not Working
- Verify the key is correctly copied (no extra spaces)
- Check if you have credits in your OpenAI account
- Ensure the key has the necessary permissions

### Rate Limiting
- OpenAI has rate limits based on your plan
- Implement request queuing if needed
- Consider caching results for similar requests

### Error Handling
The service includes comprehensive error handling:
- Logs all errors for debugging
- Provides fallback responses
- Returns user-friendly error messages

## Testing

Test the AI integration:

```bash
# Test profile analysis
curl -X POST http://localhost:5000/api/v1/ai/analyze-profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "jobId": "JOB_ID",
    "userProfile": {
      "name": "Test User",
      "skills": ["JavaScript", "React"],
      "experience": ["Developer at Company"],
      "education": ["BS Computer Science"],
      "summary": "Experienced developer"
    }
  }'
```

## Support

For issues or questions:
1. Check the logs in `Backend/logs/`
2. Verify environment variables are set correctly
3. Test with a simple API call to OpenAI directly
4. Review the OpenAI API documentation

## Future Enhancements

Potential improvements:
- Cache AI responses to reduce API calls
- Add more sophisticated prompts
- Implement streaming responses for real-time feedback
- Add support for other AI providers (Anthropic, Google AI)
- Fine-tune models for better job-specific recommendations
