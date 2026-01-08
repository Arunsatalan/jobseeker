const InterviewSlot = require('../models/InterviewSlot');
const logger = require('../utils/logger');

class InterviewAIService {
  /**
   * Calculate optimal slot based on multiple factors
   */
  calculateOptimalSlot(interviewSlot) {
    const slots = interviewSlot.proposedSlots;
    const votes = interviewSlot.candidateVotes;

    if (!slots || slots.length === 0) {
      return null;
    }

    // If no votes yet, use AI suggestions based on historical data
    if (!votes || votes.length === 0) {
      return this.suggestOptimalSlot(slots);
    }

    // Calculate scores for each slot
    const slotScores = slots.map((slot, index) => {
      const vote = votes.find(v => v.slotIndex === index);
      let score = 0;

      // Base score from candidate preference (rank 1 = 100 points, rank 5 = 20 points)
      if (vote) {
        score += (6 - vote.rank) * 20; // Invert rank (1 = best = 100, 5 = worst = 20)
        
        // Availability bonus
        if (vote.availability === 'available') score += 30;
        else if (vote.availability === 'maybe') score += 10;
      }

      // Time-based scoring (prefer business hours)
      const hour = new Date(slot.startTime).getHours();
      if (hour >= 9 && hour <= 17) {
        score += 20; // Business hours bonus
      } else if (hour >= 18 && hour <= 20) {
        score += 10; // Evening bonus
      }

      // Day of week preference (prefer weekdays)
      const dayOfWeek = new Date(slot.startTime).getDay();
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        score += 15; // Weekday bonus
      }

      // AI score from historical data
      if (slot.aiScore) {
        score += slot.aiScore;
      }

      // Recency penalty (prefer slots that are not too far in future)
      const daysUntil = Math.floor((new Date(slot.startTime) - new Date()) / (1000 * 60 * 60 * 24));
      if (daysUntil >= 1 && daysUntil <= 7) {
        score += 15; // 1-7 days is optimal
      } else if (daysUntil > 7 && daysUntil <= 14) {
        score += 5; // 1-2 weeks is okay
      }

      return {
        slotIndex: index,
        score,
        slot,
        vote,
      };
    });

    // Sort by score (highest first)
    slotScores.sort((a, b) => b.score - a.score);

    const bestSlot = slotScores[0];
    const confidence = this.calculateConfidence(slotScores);

    return {
      bestSlotIndex: bestSlot.slotIndex,
      confidence,
      reasoning: this.generateReasoning(bestSlot, slotScores),
      allScores: slotScores,
    };
  }

  /**
   * Suggest optimal slot when no votes exist (AI prediction)
   */
  suggestOptimalSlot(slots) {
    if (!slots || slots.length === 0) return null;

    const scoredSlots = slots.map((slot, index) => {
      let score = 0;
      const startTime = new Date(slot.startTime);
      const hour = startTime.getHours();
      const dayOfWeek = startTime.getDay();

      // Business hours (9 AM - 5 PM) are preferred
      if (hour >= 9 && hour <= 17) {
        score += 40;
      } else if (hour >= 18 && hour <= 20) {
        score += 20;
      }

      // Weekdays are preferred
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        score += 30;
      }

      // Optimal timing: 1-7 days in future
      const daysUntil = Math.floor((startTime - new Date()) / (1000 * 60 * 60 * 24));
      if (daysUntil >= 1 && daysUntil <= 7) {
        score += 30;
      } else if (daysUntil > 7 && daysUntil <= 14) {
        score += 10;
      }

      // Use AI score if available
      if (slot.aiScore) {
        score += slot.aiScore;
      }

      return { slotIndex: index, score, slot };
    });

    scoredSlots.sort((a, b) => b.score - a.score);
    const best = scoredSlots[0];

    return {
      bestSlotIndex: best.slotIndex,
      confidence: 65, // Lower confidence without votes
      reasoning: `AI suggests this slot based on optimal timing patterns: ${this.getTimeDescription(best.slot.startTime)}`,
      allScores: scoredSlots,
    };
  }

  /**
   * Calculate confidence score (0-100)
   */
  calculateConfidence(slotScores) {
    if (!slotScores || slotScores.length === 0) return 0;

    const topScore = slotScores[0].score;
    const secondScore = slotScores.length > 1 ? slotScores[1].score : 0;
    const scoreDiff = topScore - secondScore;

    // Higher confidence if there's a clear winner
    let confidence = 50; // Base confidence
    if (scoreDiff > 50) confidence = 90;
    else if (scoreDiff > 30) confidence = 80;
    else if (scoreDiff > 15) confidence = 70;
    else confidence = 60;

    // Boost confidence if top slot has high candidate preference
    if (slotScores[0].vote && slotScores[0].vote.rank === 1) {
      confidence = Math.min(100, confidence + 15);
    }

    return Math.min(100, confidence);
  }

  /**
   * Generate human-readable reasoning
   */
  generateReasoning(bestSlot, allScores) {
    const reasons = [];

    if (bestSlot.vote) {
      if (bestSlot.vote.rank === 1) {
        reasons.push('Candidate\'s top preference');
      } else {
        reasons.push(`Candidate ranked this as #${bestSlot.vote.rank} choice`);
      }

      if (bestSlot.vote.availability === 'available') {
        reasons.push('Candidate confirmed availability');
      }
    }

    const hour = new Date(bestSlot.slot.startTime).getHours();
    if (hour >= 9 && hour <= 17) {
      reasons.push('Optimal business hours');
    }

    const dayOfWeek = new Date(bestSlot.slot.startTime).getDay();
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      reasons.push('Weekday scheduling');
    }

    const scoreDiff = bestSlot.score - (allScores[1]?.score || 0);
    if (scoreDiff > 30) {
      reasons.push('Clear preference over other options');
    }

    return reasons.join(', ') || 'Best match based on available data';
  }

  /**
   * Get time description
   */
  getTimeDescription(date) {
    const d = new Date(date);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const day = days[d.getDay()];
    const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    return `${day} at ${time}`;
  }

  /**
   * Auto-confirm best slot if confidence is high enough
   */
  async autoConfirmSlot(interviewSlotId, minConfidence = 80) {
    try {
      const interviewSlot = await InterviewSlot.findById(interviewSlotId)
        .populate('candidate', 'email firstName lastName')
        .populate('employer', 'email firstName lastName')
        .populate('job', 'title');

      if (!interviewSlot) {
        throw new Error('Interview slot not found');
      }

      if (interviewSlot.status === 'confirmed') {
        return { alreadyConfirmed: true, interviewSlot };
      }

      const matchResult = this.calculateOptimalSlot(interviewSlot);

      if (matchResult.confidence >= minConfidence) {
        const confirmedSlot = interviewSlot.proposedSlots[matchResult.bestSlotIndex];

        interviewSlot.confirmedSlot = {
          slotIndex: matchResult.bestSlotIndex,
          startTime: confirmedSlot.startTime,
          endTime: confirmedSlot.endTime,
          meetingLink: confirmedSlot.meetingLink,
          confirmedAt: new Date(),
          confirmedBy: 'ai',
        };

        interviewSlot.status = 'confirmed';
        interviewSlot.aiMatchData = {
          bestSlotIndex: matchResult.bestSlotIndex,
          confidence: matchResult.confidence,
          reasoning: matchResult.reasoning,
          matchedAt: new Date(),
        };

        await interviewSlot.save();

        return {
          confirmed: true,
          interviewSlot,
          matchResult,
        };
      }

      return {
        confirmed: false,
        confidence: matchResult.confidence,
        matchResult,
      };
    } catch (error) {
      logger.error('Error in auto-confirm slot:', error);
      throw error;
    }
  }
}

module.exports = new InterviewAIService();


