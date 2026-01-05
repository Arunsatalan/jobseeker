
import { useReducer, useCallback, useRef } from 'react';
import axios from 'axios';
import { toast } from 'sonner';

// Define State and Action Types
interface InterviewState {
    confirmedInterviews: any[];
    pendingVotes: any[];
    loading: boolean;
    loadingConfirmed: boolean;
    loadingPending: boolean;
    error: string | null;
    lastFetched: number | null;
}

type Action =
    | { type: 'FETCH_START'; payload: { section: 'confirmed' | 'pending' | 'all' } }
    | { type: 'FETCH_SUCCESS_CONFIRMED'; payload: any[] }
    | { type: 'FETCH_SUCCESS_PENDING'; payload: any[] }
    | { type: 'FETCH_ERROR'; payload: string }
    | { type: 'CANCEL_START' }
    | { type: 'CANCEL_SUCCESS'; payload: string } // payload is interviewId
    | { type: 'CANCEL_ERROR'; payload: string };

const initialState: InterviewState = {
    confirmedInterviews: [],
    pendingVotes: [],
    loading: false,
    loadingConfirmed: false,
    loadingPending: false,
    error: null,
    lastFetched: null,
};

function interviewReducer(state: InterviewState, action: Action): InterviewState {
    switch (action.type) {
        case 'FETCH_START':
            return {
                ...state,
                loading: action.payload === 'all',
                loadingConfirmed: action.payload === 'confirmed' || action.payload === 'all',
                loadingPending: action.payload === 'pending' || action.payload === 'all',
                error: null,
            };
        case 'FETCH_SUCCESS_CONFIRMED':
            return {
                ...state,
                confirmedInterviews: action.payload,
                loadingConfirmed: false,
                loading: state.loadingPending ? true : false,
                lastFetched: Date.now(),
            };
        case 'FETCH_SUCCESS_PENDING':
            return {
                ...state,
                pendingVotes: action.payload,
                loadingPending: false,
                loading: state.loadingConfirmed ? true : false,
                lastFetched: Date.now(),
            };
        case 'FETCH_ERROR':
            return {
                ...state,
                loading: false,
                loadingConfirmed: false,
                loadingPending: false,
                error: action.payload,
            };
        case 'CANCEL_START':
            // We might want to track which interview is cancelling in a separate state or here
            // For now, global loading or just optimistic update logic could be applied
            return state;
        case 'CANCEL_SUCCESS':
            return {
                ...state,
                confirmedInterviews: state.confirmedInterviews.filter(i => i._id !== action.payload),
            };
        case 'CANCEL_ERROR':
            // Error handled in UI or via toast, state remains same or error set
            return { ...state, _error: action.payload }; // Optional: set error state
        default:
            return state;
    }
}

export function useInterviewScheduling() {
    const [state, dispatch] = useReducer(interviewReducer, initialState);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const abortControllerRef = useRef<AbortController | null>(null);

    const loadInterviews = useCallback(async (force = false) => {
        // Basic cache check: if fetched < 1 minute ago and not forced, don't refetch
        if (!force && state.lastFetched && Date.now() - state.lastFetched < 60000) {
            return;
        }

        // Cancel previous request if any
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();

        dispatch({ type: 'FETCH_START', payload: 'all' });

        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error("No authentication token found");

            // Parallel fetching
            const [confirmedRes, pendingRes] = await Promise.allSettled([
                axios.get(`${apiUrl}/api/v1/interviews/employer/slots`, {
                    headers: { Authorization: `Bearer ${token}` },
                    params: { status: 'confirmed' },
                    signal: abortControllerRef.current.signal
                }),
                axios.get(`${apiUrl}/api/v1/interviews/employer/slots`, {
                    headers: { Authorization: `Bearer ${token}` },
                    params: { status: 'voting' },
                    signal: abortControllerRef.current.signal
                })
            ]);

            // Handle Confirmed
            if (confirmedRes.status === 'fulfilled' && confirmedRes.value.data.success) {
                const interviews = confirmedRes.value.data.data || [];
                const sorted = interviews
                    .filter((interview: any) => interview.confirmedSlot && interview.confirmedSlot.startTime)
                    .sort((a: any, b: any) => {
                        const dateA = new Date(a.confirmedSlot?.startTime || 0);
                        const dateB = new Date(b.confirmedSlot?.startTime || 0);
                        return dateA.getTime() - dateB.getTime();
                    });
                dispatch({ type: 'FETCH_SUCCESS_CONFIRMED', payload: sorted });
            } else if (confirmedRes.status === 'rejected') {
                if (axios.isCancel(confirmedRes.reason)) return;
                console.error("Failed to fetch confirmed interviews", confirmedRes.reason);
                // Don't fail everything if one section fails, but maybe notify?
            }

            // Handle Pending
            if (pendingRes.status === 'fulfilled' && pendingRes.value.data.success) {
                const interviews = pendingRes.value.data.data || [];
                const pending = interviews
                    .filter((interview: any) => interview.candidateVotes && interview.candidateVotes.length > 0)
                    .sort((a: any, b: any) => {
                        const dateA = new Date(a.votingDeadline || 0);
                        const dateB = new Date(b.votingDeadline || 0);
                        return dateA.getTime() - dateB.getTime();
                    });
                dispatch({ type: 'FETCH_SUCCESS_PENDING', payload: pending });
            } else if (pendingRes.status === 'rejected') {
                if (axios.isCancel(pendingRes.reason)) return;
                console.error("Failed to fetch pending votes", pendingRes.reason);
            }

        } catch (error: any) {
            if (axios.isCancel(error)) return;
            dispatch({ type: 'FETCH_ERROR', payload: error.message || 'Failed to fetch interviews' });
            toast.error("Failed to load interviews. Please try again.");
        }
    }, [apiUrl, state.lastFetched]);

    const cancelInterview = useCallback(async (interviewId: string, reason: string) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `${apiUrl}/api/v1/interviews/cancel`,
                { interviewSlotId: interviewId, reason: reason || 'No reason provided' },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                dispatch({ type: 'CANCEL_SUCCESS', payload: interviewId });
                toast.success('Interview cancelled successfully. Candidate notified.');
                return true;
            }
        } catch (error: any) {
            const msg = error.response?.data?.message || 'Failed to cancel interview';
            toast.error(msg);
            dispatch({ type: 'CANCEL_ERROR', payload: msg });
            return false;
        }
        return false;
    }, [apiUrl]);

    return {
        state,
        loadInterviews,
        cancelInterview
    };
}
