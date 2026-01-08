
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Calendar,
    Clock,
    Video,
    Phone,
    MapPin,
    Briefcase,
    XCircle,
    Star
} from "lucide-react";
import { formatInterviewDate, getRelativeTime } from "@/utils/dateUtils";

interface InterviewCardProps {
    interview: any;
    onCancel: (id: string) => void;
    isCancelling?: boolean;
}

export function InterviewCard({ interview, onCancel, isCancelling }: InterviewCardProps) {
    const interviewTime = interview.confirmedSlot?.startTime;
    const timeInfo = interviewTime ? getRelativeTime(interviewTime) : null;
    const meetingType = interview.confirmedSlot?.meetingType ||
        interview.proposedSlots?.[interview.confirmedSlot?.slotIndex]?.meetingType ||
        'video';

    // Logic from original file to determine if cancellable
    const canCancel = (() => {
        if (!interviewTime) return false;
        const iTime = new Date(interviewTime);
        const now = new Date();
        const hoursUntil = (iTime.getTime() - now.getTime()) / (1000 * 60 * 60);
        return hoursUntil >= 4;
    })();

    const getVoteInfo = () => {
        if (!interview.candidateVotes?.length) return null;
        const confirmedSlotIndex = interview.confirmedSlot?.slotIndex;
        if (confirmedSlotIndex === undefined) return null;
        return interview.candidateVotes.find((v: any) => v.slotIndex === confirmedSlotIndex);
    };
    const voteInfo = getVoteInfo();

    return (
        <div className="group relative p-5 bg-white rounded-xl border-2 border-slate-200 hover:border-amber-300 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            {/* Status Indicator */}
            <div className="absolute top-4 right-4">
                {timeInfo && (
                    <Badge variant={timeInfo.variant as any} className={`${timeInfo.color} bg-opacity-10 border-0 font-medium`}>
                        <Clock className="h-3 w-3 mr-1" />
                        {timeInfo.text}
                    </Badge>
                )}
            </div>

            <div className="flex items-start gap-4">
                {/* Avatar/Icon */}
                <div
                    className="h-14 w-14 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0"
                    style={{ backgroundColor: '#02243b' }}
                >
                    {meetingType === 'video' ? (
                        <Video className="h-7 w-7 text-white" />
                    ) : meetingType === 'phone' ? (
                        <Phone className="h-7 w-7 text-white" />
                    ) : (
                        <MapPin className="h-7 w-7 text-white" />
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                        <div>
                            <h3 className="font-bold text-slate-900 text-lg mb-1 truncate">
                                {interview.candidate?.firstName} {interview.candidate?.lastName}
                            </h3>
                            <p className="text-sm font-medium text-slate-600 flex items-center gap-1">
                                <Briefcase className="h-3 w-3" />
                                {interview.job?.title}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-2 mt-3">
                        {interviewTime && (
                            <div className="flex items-center gap-2 text-sm">
                                <Calendar className="h-4 w-4" style={{ color: '#02243b' }} />
                                <span className="font-medium text-slate-700">
                                    {formatInterviewDate(interviewTime)}
                                </span>
                            </div>
                        )}

                        {/* Vote Info */}
                        {voteInfo && (
                            <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
                                <div className="flex items-center gap-1">
                                    <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                                    <span className="text-xs font-semibold text-slate-700">
                                        Ranked #{voteInfo.rank} by candidate
                                    </span>
                                </div>
                                {voteInfo.availability && (
                                    <Badge
                                        variant="outline"
                                        className={`text-xs ${voteInfo.availability === 'available'
                                                ? 'border-green-300 text-green-700 bg-green-50'
                                                : voteInfo.availability === 'maybe'
                                                    ? 'border-amber-300 text-amber-700 bg-amber-50'
                                                    : 'border-red-300 text-red-700 bg-red-50'
                                            }`}
                                    >
                                        {voteInfo.availability}
                                    </Badge>
                                )}
                            </div>
                        )}

                        {/* Meeting Type */}
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                            <span className="capitalize font-medium">{meetingType}</span>
                            {interview.confirmedSlot?.location && (
                                <>
                                    <span>•</span>
                                    <span className="flex items-center gap-1">
                                        <MapPin className="h-3 w-3" />
                                        {interview.confirmedSlot.location}
                                    </span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100">
                        {interview.confirmedSlot?.meetingLink && (
                            <Button
                                size="sm"
                                className="text-white hover:opacity-90 flex-1"
                                style={{ backgroundColor: '#02243b' }}
                                onClick={() => window.open(interview.confirmedSlot.meetingLink, '_blank')}
                                aria-label="Join Meeting"
                            >
                                <Video className="h-4 w-4 mr-2" />
                                Join Meeting
                            </Button>
                        )}
                        {canCancel && (
                            <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 border-red-300 hover:bg-red-50"
                                onClick={() => onCancel(interview._id)}
                                disabled={isCancelling}
                                aria-label="Cancel Interview"
                            >
                                {isCancelling ? (
                                    <span className="h-4 w-4 mr-1 animate-spin text-red-600 rounded-full border-2 border-b-transparent border-red-600 inline-block" />
                                ) : (
                                    <XCircle className="h-4 w-4 mr-1" />
                                )}
                                Cancel
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
