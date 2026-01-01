/**
 * Calendar Integration Utility
 * Supports Google Calendar, Outlook, and Apple Calendar
 */

export interface CalendarEvent {
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  meetingLink?: string;
  timezone?: string;
}

/**
 * Generate Google Calendar link
 */
export function generateGoogleCalendarLink(event: CalendarEvent): string {
  const formatDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const details = event.description || '';
  const location = event.location || event.meetingLink || '';
  const fullDescription = event.meetingLink 
    ? `${details}\n\nMeeting Link: ${event.meetingLink}` 
    : details;

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${formatDate(event.startTime)}/${formatDate(event.endTime)}`,
    details: fullDescription,
    location: location,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Generate Outlook Calendar link
 */
export function generateOutlookCalendarLink(event: CalendarEvent): string {
  const formatDate = (date: Date): string => {
    return date.toISOString();
  };

  const details = event.description || '';
  const location = event.location || event.meetingLink || '';
  const fullDescription = event.meetingLink 
    ? `${details}\n\nMeeting Link: ${event.meetingLink}` 
    : details;

  const params = new URLSearchParams({
    subject: event.title,
    startdt: formatDate(event.startTime),
    enddt: formatDate(event.endTime),
    body: fullDescription,
    location: location,
  });

  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}

/**
 * Generate Apple Calendar (.ics file) download
 */
export function generateAppleCalendarFile(event: CalendarEvent): string {
  const formatDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const details = event.description || '';
  const location = event.location || event.meetingLink || '';
  const fullDescription = event.meetingLink 
    ? `${details}\\n\\nMeeting Link: ${event.meetingLink}` 
    : details;

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Interview Scheduler//EN',
    'BEGIN:VEVENT',
    `UID:${Date.now()}@interviewscheduler.com`,
    `DTSTAMP:${formatDate(new Date())}`,
    `DTSTART:${formatDate(event.startTime)}`,
    `DTEND:${formatDate(event.endTime)}`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${fullDescription.replace(/\n/g, '\\n')}`,
    location ? `LOCATION:${location}` : '',
    'END:VEVENT',
    'END:VCALENDAR',
  ].filter(Boolean).join('\r\n');

  return icsContent;
}

/**
 * Download .ics file for Apple Calendar
 */
export function downloadAppleCalendar(event: CalendarEvent): void {
  const icsContent = generateAppleCalendarFile(event);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${event.title.replace(/[^a-z0-9]/gi, '_')}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Calculate smart reminder times
 */
export function getSmartReminders(startTime: Date): {
  oneWeek: Date | null;
  oneDay: Date | null;
  oneHour: Date | null;
  fifteenMin: Date | null;
  nextReminder: string | null;
} {
  const now = new Date();
  const interviewTime = new Date(startTime);
  const diff = interviewTime.getTime() - now.getTime();

  const oneWeek = diff > 7 * 24 * 60 * 60 * 1000 
    ? new Date(interviewTime.getTime() - 7 * 24 * 60 * 60 * 1000)
    : null;
  const oneDay = diff > 24 * 60 * 60 * 1000 
    ? new Date(interviewTime.getTime() - 24 * 60 * 60 * 1000)
    : null;
  const oneHour = diff > 60 * 60 * 1000 
    ? new Date(interviewTime.getTime() - 60 * 60 * 1000)
    : null;
  const fifteenMin = diff > 15 * 60 * 1000 
    ? new Date(interviewTime.getTime() - 15 * 60 * 1000)
    : null;

  let nextReminder: string | null = null;
  if (oneWeek && now < oneWeek) {
    nextReminder = `1 week before (${oneWeek.toLocaleDateString()})`;
  } else if (oneDay && now < oneDay) {
    nextReminder = `1 day before (${oneDay.toLocaleDateString()})`;
  } else if (oneHour && now < oneHour) {
    nextReminder = `1 hour before (${oneHour.toLocaleTimeString()})`;
  } else if (fifteenMin && now < fifteenMin) {
    nextReminder = `15 minutes before (${fifteenMin.toLocaleTimeString()})`;
  } else if (now < interviewTime) {
    nextReminder = 'Interview starting soon';
  } else {
    nextReminder = 'Interview has passed';
  }

  return {
    oneWeek,
    oneDay,
    oneHour,
    fifteenMin,
    nextReminder,
  };
}

/**
 * Format time in user's timezone
 */
export function formatTimeInTimezone(
  date: Date | string,
  timezone?: string,
  options?: Intl.DateTimeFormatOptions
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const userTimezone = timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: userTimezone,
  };

  return dateObj.toLocaleString('en-US', { ...defaultOptions, ...options });
}

/**
 * Get timezone abbreviation
 */
export function getTimezoneAbbreviation(timezone?: string): string {
  const tz = timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
  const date = new Date();
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    timeZoneName: 'short',
  });
  const parts = formatter.formatToParts(date);
  const tzName = parts.find(part => part.type === 'timeZoneName');
  return tzName?.value || tz;
}

