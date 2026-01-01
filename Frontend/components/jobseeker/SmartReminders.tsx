"use client";
import { Badge } from "@/components/ui/badge";
import { Clock, Bell } from "lucide-react";
import { getSmartReminders } from "@/utils/calendarIntegration";

interface SmartRemindersProps {
  startTime: Date | string;
  className?: string;
}

export function SmartReminders({ startTime, className = "" }: SmartRemindersProps) {
  const reminders = getSmartReminders(new Date(startTime));
  const interviewTime = new Date(startTime);
  const now = new Date();
  const isPast = interviewTime < now;

  if (isPast) {
    return null;
  }

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <Bell className="h-3 w-3 text-gray-500" />
      <span className="text-xs text-gray-600">Reminders:</span>
      {reminders.oneWeek && (
        <Badge variant="outline" className="text-xs">
          <Clock className="h-3 w-3 mr-1" />
          1 week
        </Badge>
      )}
      {reminders.oneDay && (
        <Badge variant="outline" className="text-xs">
          <Clock className="h-3 w-3 mr-1" />
          1 day
        </Badge>
      )}
      {reminders.oneHour && (
        <Badge variant="outline" className="text-xs">
          <Clock className="h-3 w-3 mr-1" />
          1 hour
        </Badge>
      )}
      {reminders.fifteenMin && (
        <Badge variant="outline" className="text-xs">
          <Clock className="h-3 w-3 mr-1" />
          15 min
        </Badge>
      )}
      {reminders.nextReminder && (
        <span className="text-xs text-gray-500 italic">
          Next: {reminders.nextReminder}
        </span>
      )}
    </div>
  );
}

