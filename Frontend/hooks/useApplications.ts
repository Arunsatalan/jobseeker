import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useToast } from "@/components/ui/use-toast";

interface Filters {
    jobId?: string;
    status?: string;
    page?: number;
    limit?: number;
}

export function useApplications(initialFilters: Filters = {}) {
    const [applications, setApplications] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState<Filters>(initialFilters);
    const [pagination, setPagination] = useState({
        page: 1,
        totalPages: 1,
        total: 0
    });

    const { toast } = useToast();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    const fetchApplications = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error("Authentication required");

            const params: any = {
                page: filters.page || 1,
                limit: filters.limit || 10
            };

            if (filters.status && filters.status !== 'all') {
                params.status = filters.status;
            }

            if (filters.jobId && filters.jobId !== 'all') {
                params.jobId = filters.jobId;
            }

            const response = await axios.get(`${apiUrl}/api/v1/applications/employer/applications`, {
                headers: { Authorization: `Bearer ${token}` },
                params
            });

            if (response.data.success) {
                setApplications(response.data.data);
                if (response.data.pagination) {
                    setPagination({
                        page: response.data.pagination.page,
                        totalPages: response.data.pagination.totalPages || 1,
                        total: response.data.pagination.total || response.data.count || 0
                    });
                }
            }
        } catch (err: any) {
            console.error("Fetch applications error:", err);
            setError(err.message || "Failed to fetch applications");
            // toast({
            //   title: "Error",
            //   description: "Failed to load applications.",
            //   variant: "destructive",
            // });
        } finally {
            setIsLoading(false);
        }
    }, [filters, apiUrl]); // Removed filters from dep array if we want manual trigger, but keep for reactivity

    useEffect(() => {
        fetchApplications();
    }, [fetchApplications]);

    const updateStatus = useCallback(async (applicationId: string, newStatus: string) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${apiUrl}/api/v1/applications/${applicationId}/status`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Optimistic update
            setApplications(prev => prev.map(app =>
                app._id === applicationId ? { ...app, status: newStatus } : app
            ));

            toast({
                title: "Status Updated",
                description: `Application status changed to ${newStatus}`,
            });

            return true;
        } catch (err: any) {
            toast({
                title: "Update Failed",
                description: err.response?.data?.message || "Failed to update status",
                variant: "destructive",
            });
            return false;
        }
    }, [apiUrl, toast]);

    const setFiltersCallback = useCallback((newFilters: Partial<Filters>) => {
        setFilters(prev => {
            const updated = { ...prev, ...newFilters };
            // Simple shallow check to avoid update if identical
            if (JSON.stringify(prev) === JSON.stringify(updated)) return prev;
            return updated;
        });
    }, []);

    return {
        applications,
        isLoading,
        error,
        pagination,
        setFilters: setFiltersCallback,
        refresh: fetchApplications,
        updateStatus
    };
}
