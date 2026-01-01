import { useState, useRef, useEffect, useCallback } from "react";
import 'regenerator-runtime/runtime';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { useVoiceGuidance } from "@/hooks/useVoiceGuidance";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Send, Bot, User, Sparkles, BrainCircuit, Mic, MicOff, Volume2, VolumeX, AlertTriangle, RefreshCw, StopCircle } from "lucide-react";
import axios from "axios";
import { useToast } from "@/components/ui/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface AICoachDialogProps {
    interviewId: string;
    jobId: string;
    jobTitle: string;
    companyName: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialMode?: 'voice' | 'chat';
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
    onOpenChange,
    initialMode = 'chat'
}: AICoachDialogProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [currentAnswer, setCurrentAnswer] = useState("");
    const [loading, setLoading] = useState(false);
    const [sessionId, setSessionId] = useState<string | null>(null);

    // UX Settings
    const [isAutoSendEnabled, setIsAutoSendEnabled] = useState(initialMode === 'voice');
    const [isContinuousMode, setIsContinuousMode] = useState(initialMode === 'voice');

    const scrollRef = useRef<HTMLDivElement>(null);
    const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
    const { toast } = useToast();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    // Voice State
    const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();
    const { speak, stop: stopSpeaking, isSpeaking, isEnabled: isVoiceOutputEnabled, toggleVoice: toggleVoiceOutput } = useVoiceGuidance(initialMode === 'voice');
    const [isVoiceInputEnabled, setIsVoiceInputEnabled] = useState(initialMode === 'voice');

    // Initialization
    useEffect(() => {
        if (open && !sessionId && messages.length === 0) {
            startSession();
        }
    }, [open]);

    // Handle Mic permissions/browser support
    useEffect(() => {
        if (!browserSupportsSpeechRecognition && open) {
            console.warn("Browser does not support speech recognition.");
        }
    }, [browserSupportsSpeechRecognition, open]);

    // Auto-scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, currentAnswer]);

    // Update Input with Voice Transcript & Auto-Send Logic
    useEffect(() => {
        if (listening) {
            setCurrentAnswer(transcript);

            // Auto-Send Logic
            if (isAutoSendEnabled && transcript.trim().length > 0) {
                // Clear existing timer
                if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

                // Set new timer: if no changes (silence) for 4 seconds, submit
                silenceTimerRef.current = setTimeout(() => {
                    if (listening && transcript.trim().length > 5) { // Minimum length check
                        console.log("Auto-sending answer due to silence...");
                        submitAnswer();
                    }
                }, 4000);
            }
        }
        return () => {
            if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        };
    }, [transcript, listening, isAutoSendEnabled]);

    // Sync Voice Mode Props
    useEffect(() => {
        if (open) {
            // If opening in voice mode, ensure output is enabled
            if (initialMode === 'voice' && !isVoiceOutputEnabled) {
                toggleVoiceOutput();
            }
            // Cannot auto-start listening reliably due to browser policies, must wait for user interaction or first speak end
        } else {
            stopSpeaking();
            SpeechRecognition.stopListening();
            if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        }
    }, [open, initialMode]);

    // Speak AI Response & Continuous Flow
    useEffect(() => {
        if (!loading && messages.length > 0) {
            const lastMsg = messages[messages.length - 1];

            // Only speak if it's an assistant message we haven't processed for speaking yet?
            // Simple check: if it's assistant and voice output enabled
            if (lastMsg.role === 'assistant' && isVoiceOutputEnabled) {

                // Determine callback action based on message content
                const onSpeakEnd = () => {
                    if (!isContinuousMode) return;

                    if (lastMsg.content.includes("Feedback:")) {
                        // If feedback, wait a bit then get next question
                        setTimeout(() => {
                            getNextQuestion();
                        }, 1500);
                    } else {
                        // If regular question/greeting, start listening
                        resetTranscript();
                        SpeechRecognition.startListening({ continuous: true });
                        setIsVoiceInputEnabled(true);
                    }
                };

                speak(lastMsg.content, onSpeakEnd);
            }
        }
    }, [messages, loading, isVoiceOutputEnabled, isContinuousMode]); // speak is stable


    const toggleListening = () => {
        if (listening) {
            SpeechRecognition.stopListening();
            setIsVoiceInputEnabled(false);
            if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        } else {
            // Stop speaking if AI is talking
            stopSpeaking();
            resetTranscript();
            SpeechRecognition.startListening({ continuous: true });
            setIsVoiceInputEnabled(true);
        }
    };

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
        // Use currentAnswer or transcript if listening (transcript might be more up to date in closure)
        // Actually currentAnswer is state, so it's fine.
        // But if auto-triggered, we want to make sure we have the latest.
        // 'transcript' from useSpeechRecognition is not available inside this async function closure if it's stale?
        // Relying on currentAnswer state.

        if (!currentAnswer && !transcript) return;
        const answerToSubmit = currentAnswer || transcript;

        if (!answerToSubmit.trim() || !sessionId) return;

        // Stop listening on submit
        if (listening) {
            SpeechRecognition.stopListening();
            setIsVoiceInputEnabled(false);
        }
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        stopSpeaking();

        setMessages(prev => [...prev, { role: 'user', content: answerToSubmit }]);
        setCurrentAnswer("");
        resetTranscript();
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `${apiUrl}/api/v1/ai/submit-answer`,
                { sessionId, answer: answerToSubmit },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                const { feedback, message } = response.data.data;
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
        stopSpeaking();

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
        <Dialog open={open} onOpenChange={(val) => {
            if (!val) {
                stopSpeaking();
                SpeechRecognition.stopListening();
                if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
            }
            onOpenChange(val);
        }}>
            <DialogContent className="max-w-2xl h-[85vh] flex flex-col p-0 gap-0">
                <DialogHeader className="px-6 py-4 border-b bg-white z-10">
                    <DialogTitle className="flex items-center justify-between text-xl">
                        <div className="flex items-center gap-2">
                            <BrainCircuit className="h-6 w-6 text-purple-600" />
                            AI Interview Coach
                        </div>
                        <div className="flex items-center gap-2">
                            {/* Voice Controls */}
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className={`rounded-full h-8 w-8 p-0 ${isVoiceOutputEnabled ? 'text-purple-600 bg-purple-50' : 'text-gray-400'}`}
                                            onClick={toggleVoiceOutput}
                                        >
                                            {isVoiceOutputEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{isVoiceOutputEnabled ? 'Mute AI Voice' : 'Enable AI Voice'}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    </DialogTitle>
                    <p className="text-sm text-gray-500 mt-1">
                        Mock interview for <span className="font-medium text-gray-900">{jobTitle}</span>
                    </p>

                    {/* Voice Settings Bar */}
                    {browserSupportsSpeechRecognition && (
                        <div className="flex items-center gap-4 mt-3 pt-2 border-t border-gray-100">
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="continuous-mode"
                                    checked={isContinuousMode}
                                    onCheckedChange={setIsContinuousMode}
                                />
                                <Label htmlFor="continuous-mode" className="text-xs font-medium text-gray-700 cursor-pointer">
                                    Continuous Conversation
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="auto-send"
                                    checked={isAutoSendEnabled}
                                    onCheckedChange={setIsAutoSendEnabled}
                                />
                                <Label htmlFor="auto-send" className="text-xs font-medium text-gray-700 cursor-pointer">
                                    Auto-Send (Silence)
                                </Label>
                            </div>
                        </div>
                    )}

                    {!browserSupportsSpeechRecognition && (
                        <div className="flex items-center gap-2 mt-2 text-xs text-amber-600 bg-amber-50 p-2 rounded">
                            <AlertTriangle className="h-3 w-3" />
                            <span>Your browser does not support Voice input. Text chat is still available.</span>
                        </div>
                    )}
                </DialogHeader>

                <div className="flex-1 overflow-hidden bg-gray-50/50 p-4 relative">
                    <div ref={scrollRef} className="h-full overflow-y-auto space-y-4 pr-2 pb-10">
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
                                                    {!isContinuousMode && (
                                                        <Button
                                                            variant="secondary"
                                                            size="sm"
                                                            className="w-full bg-purple-50 hover:bg-purple-100 text-purple-700"
                                                            onClick={getNextQuestion}
                                                            disabled={loading || i !== messages.length - 1}
                                                        >
                                                            Next Question
                                                        </Button>
                                                    )}
                                                    {isContinuousMode && i === messages.length - 1 && (
                                                        <p className="text-xs text-purple-600 italic text-center animate-pulse">
                                                            Preparing next question...
                                                        </p>
                                                    )}
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
                        {listening && (
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-purple-600/90 text-white px-6 py-2 rounded-full text-sm animate-pulse flex items-center gap-3 shadow-lg z-20 backdrop-blur-sm">
                                <Mic className="h-4 w-4" />
                                <span className="font-medium">Listening... {isAutoSendEnabled && "(Auto-send on)"}</span>
                                <div className="flex gap-1 h-3 items-end">
                                    <div className="w-1 h-full bg-white/50 animate-bounce delay-75 rounded-full"></div>
                                    <div className="w-1 h-2/3 bg-white/50 animate-bounce delay-150 rounded-full"></div>
                                    <div className="w-1 h-full bg-white/50 animate-bounce delay-300 rounded-full"></div>
                                </div>
                            </div>
                        )}
                        {/* Interrupt Button when Speaking */}
                        {isSpeaking && (
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    className="rounded-full shadow-lg"
                                    onClick={() => stopSpeaking()}
                                >
                                    <StopCircle className="h-4 w-4 mr-2" />
                                    Stop Speaking
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter className="p-4 bg-white border-t">
                    <div className="flex w-full gap-2 items-end">
                        {/* Voice Input Toggle */}
                        {browserSupportsSpeechRecognition && (
                            <Button
                                variant={listening ? "default" : "outline"}
                                size="icon"
                                className={`h-[60px] w-[60px] shrink-0 ${listening ? 'bg-red-500 hover:bg-red-600 border-red-500 shadow-md' : 'border-gray-200'}`}
                                onClick={toggleListening}
                            >
                                {listening ? <MicOff className="h-5 w-5 text-white" /> : <Mic className="h-5 w-5 text-gray-500" />}
                            </Button>
                        )}
                        <div className="flex-1 relative">
                            <Textarea
                                placeholder={listening ? "Listening to your answer..." : "Type your answer here..."}
                                value={currentAnswer}
                                onChange={(e) => setCurrentAnswer(e.target.value)}
                                className="min-h-[60px] resize-none focus-visible:ring-purple-500 pr-12"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        submitAnswer();
                                    }
                                }}
                            />
                            <Button
                                onClick={() => submitAnswer()}
                                disabled={!currentAnswer.trim() || loading}
                                className="absolute bottom-2 right-2 h-10 w-10 p-0 rounded-full bg-purple-600 hover:bg-purple-700"
                            >
                                <Send className="h-4 w-4 text-white" />
                            </Button>
                        </div>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
