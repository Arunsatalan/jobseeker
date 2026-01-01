const { google } = require('googleapis');
const config = require('../config/environment');
const logger = require('../utils/logger');

class GoogleCalendarService {
  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      config.GOOGLE_CLIENT_ID,
      config.GOOGLE_CLIENT_SECRET,
      config.GOOGLE_REDIRECT_URI
    );
  }

  /**
   * Get authorization URL for OAuth flow
   */
  getAuthUrl() {
    const scopes = [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events',
    ];

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent',
    });
  }

  /**
   * Exchange authorization code for tokens
   */
  async getTokens(code) {
    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      return tokens;
    } catch (error) {
      logger.error('Error getting Google Calendar tokens:', error);
      throw error;
    }
  }

  /**
   * Set credentials for a user
   */
  setCredentials(tokens) {
    this.oauth2Client.setCredentials(tokens);
  }

  /**
   * Check if user has calendar access
   */
  async checkCalendarAccess(tokens) {
    try {
      this.setCredentials(tokens);
      const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
      await calendar.calendarList.list();
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get available time slots from user's calendar
   */
  async getAvailableSlots(tokens, startDate, endDate, durationMinutes = 60) {
    try {
      this.setCredentials(tokens);
      const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });

      // Get busy times from primary calendar
      const response = await calendar.freebusy.query({
        requestBody: {
          timeMin: startDate.toISOString(),
          timeMax: endDate.toISOString(),
          items: [{ id: 'primary' }],
        },
      });

      const busyTimes = response.data.calendars.primary.busy || [];
      
      // Generate available slots (simplified - in production, use a more sophisticated algorithm)
      const availableSlots = [];
      const current = new Date(startDate);
      
      while (current < endDate) {
        const slotEnd = new Date(current.getTime() + durationMinutes * 60000);
        const isBusy = busyTimes.some(busy => {
          const busyStart = new Date(busy.start);
          const busyEnd = new Date(busy.end);
          return (current >= busyStart && current < busyEnd) ||
                 (slotEnd > busyStart && slotEnd <= busyEnd) ||
                 (current <= busyStart && slotEnd >= busyEnd);
        });

        if (!isBusy) {
          availableSlots.push({
            start: new Date(current),
            end: new Date(slotEnd),
          });
        }

        // Move to next hour
        current.setHours(current.getHours() + 1);
      }

      return availableSlots;
    } catch (error) {
      logger.error('Error getting available slots:', error);
      throw error;
    }
  }

  /**
   * Create a calendar event for confirmed interview
   */
  async createCalendarEvent(tokens, eventData) {
    try {
      this.setCredentials(tokens);
      const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });

      const event = {
        summary: eventData.title || 'Interview Scheduled',
        description: eventData.description || '',
        start: {
          dateTime: eventData.startTime,
          timeZone: eventData.timezone || 'UTC',
        },
        end: {
          dateTime: eventData.endTime,
          timeZone: eventData.timezone || 'UTC',
        },
        attendees: eventData.attendees || [],
        conferenceData: eventData.meetingLink ? {
          createRequest: {
            requestId: `interview-${Date.now()}`,
            conferenceSolutionKey: { type: 'hangoutsMeet' },
          },
        } : undefined,
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 }, // 1 day before
            { method: 'popup', minutes: 15 }, // 15 minutes before
          ],
        },
      };

      const response = await calendar.events.insert({
        calendarId: 'primary',
        conferenceDataVersion: eventData.meetingLink ? 1 : 0,
        requestBody: event,
      });

      return {
        eventId: response.data.id,
        meetingLink: response.data.hangoutLink || response.data.conferenceData?.entryPoints?.[0]?.uri || eventData.meetingLink,
        htmlLink: response.data.htmlLink,
      };
    } catch (error) {
      logger.error('Error creating calendar event:', error);
      throw error;
    }
  }

  /**
   * Update calendar event
   */
  async updateCalendarEvent(tokens, eventId, eventData) {
    try {
      this.setCredentials(tokens);
      const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });

      const event = await calendar.events.get({
        calendarId: 'primary',
        eventId: eventId,
      });

      const updatedEvent = {
        ...event.data,
        summary: eventData.title || event.data.summary,
        description: eventData.description || event.data.description,
        start: {
          dateTime: eventData.startTime || event.data.start.dateTime,
          timeZone: eventData.timezone || event.data.start.timeZone,
        },
        end: {
          dateTime: eventData.endTime || event.data.end.dateTime,
          timeZone: eventData.timezone || event.data.end.timeZone,
        },
      };

      const response = await calendar.events.update({
        calendarId: 'primary',
        eventId: eventId,
        requestBody: updatedEvent,
      });

      return response.data;
    } catch (error) {
      logger.error('Error updating calendar event:', error);
      throw error;
    }
  }

  /**
   * Delete calendar event
   */
  async deleteCalendarEvent(tokens, eventId) {
    try {
      this.setCredentials(tokens);
      const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });

      await calendar.events.delete({
        calendarId: 'primary',
        eventId: eventId,
      });

      return true;
    } catch (error) {
      logger.error('Error deleting calendar event:', error);
      throw error;
    }
  }
}

module.exports = new GoogleCalendarService();

