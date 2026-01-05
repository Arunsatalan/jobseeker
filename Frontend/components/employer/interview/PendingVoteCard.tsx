
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Star, Briefcase, CheckCircle } from "lucide-react";
import { formatInterviewDate } from "@/utils/dateUtils";

interface PendingVoteCardProps {
    interview: any;
    onReview: () => void;
}

export function PendingVoteCard({ interview, onReview }: PendingVoteCardProps) {
    const topVote = interview.candidateVotes
        ?.sort((a: any, b: any) => a.rank - b.rank)[0];
    const topSlot = topVote ? interview.proposedSlots?.[topVote.slotIndex] : null;

    return (
        <div className="group relative p-5 bg-white rounded-xl border-2 border-amber-200 hover:border-amber-400 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-start gap-4">
                <div
                    className="h-14 w-14 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0"
                    style={{ backgroundColor: '#02243b' }}
                >
                    <Star className="h-7 w-7 text-white fill-white" />
                </div>

                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900 text-lg mb-1 truncate">
                        {interview.candidate?.firstName} {interview.candidate?.lastName}
                    </h3>
                    <p className="text-sm font-medium text-slate-600 flex items-center gap-1 mb-3">
                        <Briefcase className="h-3 w-3" />
                        {interview.job?.title}
                    </p>

                    {topSlot && (
                        <div className="space-y-2 mt-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-amber-900">Candidate's Top Choice:</span>
                                <Badge className="bg-amber-600 text-white text-xs hover:bg-amber-700">
                                    Rank #{topVote.rank}
                                </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <Calendar className="h-4 w-4 text-amber-600" />
                                <span className="font-medium text-slate-700">
                                    {formatInterviewDate(topSlot.startTime)}
                                </span>
                            </div>
                            {topVote.notes && (
                                <p className="text-xs text-slate-600 italic mt-1 line-clamp-2">"{topVote.notes}"</p>
                            )}
                        </div>
                    )}

                    <div className="flex items-center gap-2 mt-4">
                        <Button
                            size="sm"
                            className="text-white hover:opacity-90 w-full sm:w-auto"
                            style={{ backgroundColor: '#02243b' }}
                            onClick={onReview}
                            aria-label={`Review application for ${interview.candidate?.firstName} ${interview.candidate?.lastName}`}
                        >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Review & Confirm
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
