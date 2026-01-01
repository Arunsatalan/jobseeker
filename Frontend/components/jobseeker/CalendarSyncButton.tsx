"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Calendar, ChevronDown, Download, ExternalLink } from "lucide-react";
import {
  generateGoogleCalendarLink,
  generateOutlookCalendarLink,
  downloadAppleCalendar,
  type CalendarEvent,
} from "@/utils/calendarIntegration";

interface CalendarSyncButtonProps {
  event: CalendarEvent;
  className?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "default" | "lg";
}

export function CalendarSyncButton({
  event,
  className = "",
  variant = "outline",
  size = "sm",
}: CalendarSyncButtonProps) {
  const [syncing, setSyncing] = useState(false);

  const handleGoogleCalendar = () => {
    setSyncing(true);
    const link = generateGoogleCalendarLink(event);
    window.open(link, '_blank');
    setTimeout(() => setSyncing(false), 500);
  };

  const handleOutlookCalendar = () => {
    setSyncing(true);
    const link = generateOutlookCalendarLink(event);
    window.open(link, '_blank');
    setTimeout(() => setSyncing(false), 500);
  };

  const handleAppleCalendar = () => {
    setSyncing(true);
    downloadAppleCalendar(event);
    setTimeout(() => setSyncing(false), 500);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={className}
          disabled={syncing}
        >
          <Calendar className="h-4 w-4 mr-2" />
          Add to Calendar
          <ChevronDown className="h-4 w-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={handleGoogleCalendar}>
          <ExternalLink className="h-4 w-4 mr-2" />
          Google Calendar
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleOutlookCalendar}>
          <ExternalLink className="h-4 w-4 mr-2" />
          Outlook Calendar
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleAppleCalendar}>
          <Download className="h-4 w-4 mr-2" />
          Apple Calendar (.ics)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

