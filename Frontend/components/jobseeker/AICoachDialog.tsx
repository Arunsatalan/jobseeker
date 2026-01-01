import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Send, Bot, User, Sparkles, BrainCircuit } from "lucide-react";
import axios from "axios";
import { useToast } from "@/components/ui/use-toast";

interface AICoachDialogProps {
    interviewId: string;
    jobId: string;
    jobTitle: string;
    companyName: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

interface Message {
    role: 'system' | 'assistant' | 'user';
    content: string;
    feedback?: {
        rating: number;
        feedback: string;
        improvement_suggestion: string;
    };
}

export function AICoachDialog({
    interviewId,
    jobId,
    jobTitle,
    companyName,
    open,
    onOpenChange
}: AICoachDialogProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [currentAnswer, setCurrentAnswer] = useState("");
    const [loading, setLoading] = useState(false);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    useEffect(() => {
        if (open && !sessionId && messages.length === 0) {
            startSession();
        }
    }, [open]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const startSession = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `${apiUrl}/api/v1/ai/start-interview`,
                { jobId },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                setSessionId(response.data.data.sessionId);
                setMessages([response.data.data.message]);
            }
        } catch (error: any) {
            console.error('Failed to start session', error);
            toast({
                title: "Error",
                description: "Failed to connect to AI Coach",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const submitAnswer = async () => {
        if (!currentAnswer.trim() || !sessionId) return;

        const answer = currentAnswer;
        setCurrentAnswer("");
        setMessages(prev => [...prev, { role: 'user', content: answer }]);
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `${apiUrl}/api/v1/ai/submit-answer`,
                { sessionId, answer },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                const { feedback, message } = response.data.data;
                // The backend returns a structured message in 'message'
                setMessages(prev => [...prev, message]);
            }
        } catch (error) {
            console.error('Failed to submit answer', error);
            toast({
                title: "Error",
                description: "Failed to analyze answer",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const getNextQuestion = async () => {
        if (!sessionId) return;
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `${apiUrl}/api/v1/ai/ask-question`,
                { sessionId },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                setMessages(prev => [...prev, response.data.data.message]);
            }
        } catch (error) {
            console.error('Failed to get question', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl h-[80vh] flex flex-col p-0">
                <DialogHeader className="px-6 py-4 border-b">
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <BrainCircuit className="h-6 w-6 text-purple-600" />
                        AI Interview Coach
                        <Badge variant="outline" className="ml-2 bg-purple-50 text-purple-700 border-purple-200">
                            GPT-4 Logic
                        </Badge>
                    </DialogTitle>
                    <p className="text-sm text-gray-500">
                        Mock interview for <span className="font-medium text-gray-900">{jobTitle}</span> at {companyName}
                    </p>
                </DialogHeader>

                <div className="flex-1 overflow-hidden bg-gray-50/50 p-4 relative">
                    <div ref={scrollRef} className="h-full overflow-y-auto space-y-4 pr-2">
                        {messages.map((msg, i) => {
                            const isUser = msg.role === 'user';
                            return (
                                <div key={i} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`flex gap-3 max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                                        <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${isUser ? 'bg-blue-600 text-white' : 'bg-purple-600 text-white'}`}>
                                            {isUser ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
                                        </div>
                                        <div className={`p-4 rounded-2xl text-sm ${isUser
                                                ? 'bg-blue-600 text-white rounded-tr-none shadow-sm'
                                                : 'bg-white text-gray-800 rounded-tl-none border shadow-sm'
                                            }`}>
                                            <div className="whitespace-pre-wrap">{msg.content}</div>

                                            {msg.role === 'assistant' && msg.content.includes("Feedback:") && (
                                                <div className="mt-3 pt-3 border-t border-gray-100">
                                                    <Button
                                                        variant="secondary"
                                                        size="sm"
                                                        className="w-full bg-purple-50 hover:bg-purple-100 text-purple-700"
                                                        onClick={getNextQuestion}
                                                        disabled={loading || i !== messages.length - 1}
                                                    >
                                                        Next Question
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="flex gap-3 max-w-[85%]">
                                    <div className="h-8 w-8 rounded-full bg-purple-600 text-white flex items-center justify-center shrink-0">
                                        <Bot className="h-5 w-5" />
                                    </div>
                                    <div className="p-4 rounded-2xl bg-white text-gray-800 rounded-tl-none border shadow-sm flex items-center">
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                        Thinking...
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter className="p-4 bg-white border-t">
                    <div className="flex w-full gap-2 items-end">
                        <Textarea
                            placeholder="Type your answer here..."
                            value={currentAnswer}
                            onChange={(e) => setCurrentAnswer(e.target.value)}
                            className="min-h-[60px] resize-none focus-visible:ring-purple-500"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    submitAnswer();
                                }
                            }}
                        />
                        <Button
                            onClick={submitAnswer}
                            disabled={!currentAnswer.trim() || loading}
                            className="h-[60px] w-[60px] bg-purple-600 hover:bg-purple-700"
                        >
                            <Send className="h-5 w-5" />
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
