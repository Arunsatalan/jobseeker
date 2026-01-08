
import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, AlertTriangle } from "lucide-react";

interface CancelInterviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (reason: string) => Promise<void>;
    interviewId: string | null;
}

export function CancelInterviewModal({
    isOpen,
    onClose,
    onConfirm,
    interviewId
}: CancelInterviewModalProps) {
    const [reason, setReason] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleConfirm = async () => {
        if (!reason.trim()) return;
        setIsSubmitting(true);
        await onConfirm(reason);
        setIsSubmitting(false);
        setReason("");
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-red-600">
                        <AlertTriangle className="h-5 w-5" />
                        Cancel Interview
                    </DialogTitle>
                    <DialogDescription>
                        Are you sure you want to cancel this interview? This action cannot be undone.
                        The candidate will be notified via email.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                        Reason for cancellation <span className="text-red-500">*</span>
                    </label>
                    <Textarea
                        id="reason"
                        placeholder="Please explain why the interview is being cancelled..."
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="w-full min-h-[100px]"
                    />
                </div>

                <DialogFooter className="flex gap-2 sm:justify-end">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={isSubmitting}
                    >
                        Keep Interview
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={handleConfirm}
                        disabled={!reason.trim() || isSubmitting}
                        className="bg-red-600 hover:bg-red-700"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Cancelling...
                            </>
                        ) : (
                            'Confirm Cancellation'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
