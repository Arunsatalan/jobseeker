const logger = require('../utils/logger');

class MessageModerationService {
  /**
   * AI-powered content moderation
   * Analyzes message content for inappropriate language, spam, harassment, etc.
   */
  async moderateContent(content) {
    try {
      // Inappropriate words/phrases (basic filter - can be enhanced with ML)
      const inappropriatePatterns = [
        /\b(spam|scam|fraud|phishing)\b/gi,
        /\b(f\*\*k|sh\*\*t|b\*\*ch|a\*\*hole)\b/gi,
        /\b(kill|murder|violence|threat)\b/gi,
        /\b(sex|sexual|porn|nude)\b/gi,
      ];

      // Spam indicators
      const spamPatterns = [
        /(click here|buy now|limited time|act now|urgent|guaranteed)/gi,
        /(http|https|www\.)\S+/g, // Multiple URLs
        /([A-Z]{5,})/g, // Excessive caps
        /(.)\1{4,}/g, // Repeated characters
      ];

      let score = 100; // Start with perfect score
      const reasons = [];

      // Check for inappropriate content
      for (const pattern of inappropriatePatterns) {
        if (pattern.test(content)) {
          score -= 40;
          reasons.push('Inappropriate language detected');
          break;
        }
      }

      // Check for spam indicators
      let spamCount = 0;
      for (const pattern of spamPatterns) {
        const matches = content.match(pattern);
        if (matches) {
          spamCount += matches.length;
        }
      }

      if (spamCount > 2) {
        score -= 30;
        reasons.push('Spam indicators detected');
      }

      // Check message length (very short or very long might be suspicious)
      if (content.length < 5) {
        score -= 10;
        reasons.push('Message too short');
      } else if (content.length > 5000) {
        score -= 15;
        reasons.push('Message unusually long');
      }

      // Check for excessive punctuation
      const punctuationCount = (content.match(/[!?.]{3,}/g) || []).length;
      if (punctuationCount > 2) {
        score -= 10;
        reasons.push('Excessive punctuation');
      }

      // Ensure score is between 0 and 100
      score = Math.max(0, Math.min(100, score));

      const flagged = score < 50; // Flag if score is below 50

      return {
        score,
        flagged,
        reason: reasons.length > 0 ? reasons.join('; ') : null,
        confidence: flagged ? 'high' : score < 70 ? 'medium' : 'low',
      };
    } catch (error) {
      logger.error('Error in content moderation:', error);
      // Return safe default (don't block message if moderation fails)
      return {
        score: 100,
        flagged: false,
        reason: null,
        confidence: 'low',
      };
    }
  }

  /**
   * Enhanced moderation using external AI service (if available)
   */
  async moderateWithAI(content) {
    try {
      // If OpenAI API key is available, use it for better moderation
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        // Fallback to basic moderation
        return this.moderateContent(content);
      }

      const axios = require('axios');
      const response = await axios.post(
        'https://api.openai.com/v1/moderations',
        {
          input: content,
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const moderationResult = response.data.results[0];
      const flagged = moderationResult.flagged;
      const categories = moderationResult.categories;
      const categoryScores = moderationResult.category_scores;

      // Calculate overall score (inverse of OpenAI's score)
      const maxCategoryScore = Math.max(...Object.values(categoryScores));
      const score = Math.round((1 - maxCategoryScore) * 100);

      // Build reason from flagged categories
      const flaggedCategories = Object.entries(categories)
        .filter(([_, isFlagged]) => isFlagged)
        .map(([category, _]) => category.replace(/_/g, ' '));

      return {
        score,
        flagged,
        reason: flaggedCategories.length > 0 ? flaggedCategories.join(', ') : null,
        confidence: flagged ? 'high' : 'medium',
        categories: flaggedCategories,
      };
    } catch (error) {
      logger.warn('AI moderation failed, using basic moderation:', error);
      return this.moderateContent(content);
    }
  }
}

module.exports = new MessageModerationService();

