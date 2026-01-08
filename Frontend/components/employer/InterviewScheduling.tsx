"use client";
import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, Calendar, Plus, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import { useInterviewScheduling } from "@/hooks/useInterviewScheduling";
import { InterviewCard } from "./interview/InterviewCard";
import { PendingVoteCard } from "./interview/PendingVoteCard";
import { InterviewListSkeleton } from "./interview/InterviewSkeleton";
import { CancelInterviewModal } from "./interview/CancelInterviewModal";

const ITEMS_PER_PAGE = 6;

export function InterviewScheduling() {
  const { state, loadInterviews, cancelInterview } = useInterviewScheduling();
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedInterviewId, setSelectedInterviewId] = useState<string | null>(null);

  // Pagination State
  const [confirmedPage, setConfirmedPage] = useState(1);
  const [pendingPage, setPendingPage] = useState(1);

  useEffect(() => {
    loadInterviews();
  }, [loadInterviews]);

  const handleRefresh = () => {
    loadInterviews(true);
  };

  const openCancelModal = (id: string) => {
    setSelectedInterviewId(id);
    setCancelModalOpen(true);
  };

  const handleConfirmCancel = async (reason: string) => {
    if (selectedInterviewId) {
      const success = await cancelInterview(selectedInterviewId, reason);
      // Wait for success before closing/refreshing if needed, but hook updates state optimistically or after success
    }
  };

  // Pagination Logic
  const paginate = (items: any[], page: number) => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return items.slice(start, start + ITEMS_PER_PAGE);
  };

  const renderPagination = (totalItems: number, currentPage: number, setPage: (p: number) => void) => {
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    if (totalPages <= 1) return null;

    return (
      <div className="flex justify-center items-center gap-2 mt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          aria-label="Previous Page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm text-slate-600">
          Page {currentPage} of {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          aria-label="Next Page"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <CancelInterviewModal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        onConfirm={handleConfirmCancel}
        interviewId={selectedInterviewId}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Interview Scheduling</h1>
          <p className="text-gray-600">Manage candidate-selected interview times</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={state.loading}
            aria-label="Refresh Interviews"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${state.loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            className="text-white hover:opacity-90"
            style={{ backgroundColor: '#02243b' }}
            onClick={() => {
              window.location.href = '/employer-dashboard?tab=applicants';
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Schedule Interview
          </Button>
        </div>
      </div>

      {/* Pending Votes Section */}
      <section aria-label="Pending Confirmations">
        {(state.pendingVotes.length > 0) && (
          <Card className="p-6 shadow-lg border-0 bg-gradient-to-br from-amber-50 to-amber-100 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-1">Pending Confirmations</h2>
                <p className="text-sm text-slate-600">Candidates have voted - review and confirm</p>
              </div>
              <Badge className="text-white px-4 py-1.5 text-sm font-semibold" style={{ backgroundColor: '#02243b' }}>
                {state.pendingVotes.length} pending
              </Badge>
            </div>

            {state.loadingPending ? (
              <InterviewListSkeleton count={2} />
            ) : (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {paginate(state.pendingVotes, pendingPage).map((interview: any) => (
                    <PendingVoteCard
                      key={interview._id}
                      interview={interview}
                      onReview={() => window.location.href = '/employer-dashboard?tab=applicants'}
                    />
                  ))}
                </div>
                {renderPagination(state.pendingVotes.length, pendingPage, setPendingPage)}
              </>
            )}
          </Card>
        )}
      </section>

      {/* Confirmed Interviews Section */}
      <section aria-label="Confirmed Interviews">
        {state.loadingConfirmed ? (
          <Card className="p-6 shadow-lg border-0 bg-gradient-to-br from-white to-slate-50">
            <div className="mb-6"><h2 className="text-2xl font-bold text-slate-900 mb-1">Confirmed Interviews</h2></div>
            <InterviewListSkeleton count={4} />
          </Card>
        ) : state.confirmedInterviews.length > 0 ? (
          <Card className="p-6 shadow-lg border-0 bg-gradient-to-br from-white to-slate-50">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-1">Confirmed Interviews</h2>
                <p className="text-sm text-slate-600">Candidate-selected interview times</p>
              </div>
              <Badge className="text-white px-4 py-1.5 text-sm font-semibold" style={{ backgroundColor: '#02243b' }}>
                <Sparkles className="h-3 w-3 mr-1" />
                {state.confirmedInterviews.length} scheduled
              </Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {paginate(state.confirmedInterviews, confirmedPage).map((interview: any) => (
                <InterviewCard
                  key={interview._id}
                  interview={interview}
                  onCancel={openCancelModal}
                />
              ))}
            </div>
            {renderPagination(state.confirmedInterviews.length, confirmedPage, setConfirmedPage)}
          </Card>
        ) : (
          <Card className="p-12 text-center shadow-lg border-0">
            <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No confirmed interviews</h3>
            <p className="text-gray-600 mb-4">Schedule interviews with candidates to see them here.</p>
            <Button
              className="text-white hover:opacity-90"
              style={{ backgroundColor: '#02243b' }}
              onClick={() => {
                window.location.href = '/employer-dashboard?tab=applicants';
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Schedule Interview
            </Button>
          </Card>
        )}
      </section>
    </div>
  );
}