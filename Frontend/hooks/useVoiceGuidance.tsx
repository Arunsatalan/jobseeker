import { useState, useEffect, useCallback } from 'react';

interface UseVoiceGuidanceReturn {
    speak: (text: string) => void;
    stop: () => void;
    isSpeaking: boolean;
    isEnabled: boolean;
    toggleVoice: () => void;
}

export function useVoiceGuidance(initialEnabled = false): UseVoiceGuidanceReturn {
    const [isEnabled, setIsEnabled] = useState(initialEnabled);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [synthesis, setSynthesis] = useState<SpeechSynthesis | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            setSynthesis(window.speechSynthesis);
        }
    }, []);

    const stop = useCallback(() => {
        if (synthesis) {
            synthesis.cancel();
            setIsSpeaking(false);
        }
    }, [synthesis]);

    const speak = useCallback((text: string, onEnd?: () => void) => {
        if (!isEnabled || !synthesis) {
            // If voice is disabled but we requested to speak, maybe we should just call onEnd 
            // immediately to prevent blocking any dependent logic (like auto-advance)
            if (onEnd) setTimeout(onEnd, 0);
            return;
        }

        // Clean text of markdown/artifacts if needed, though simple regex might suffice
        const cleanText = text.replace(/[*#`]/g, '');

        stop();

        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => {
            setIsSpeaking(false);
            if (onEnd) onEnd();
        };
        utterance.onerror = () => {
            setIsSpeaking(false);
            if (onEnd) onEnd();
        };

        // Optional: Select a specific voice if desired (e.g., 'Google US English')
        // const voices = synthesis.getVoices();
        // utterance.voice = voices.find(v => v.name.includes('Google US English')) || null;

        synthesis.speak(utterance);
    }, [isEnabled, synthesis, stop]);

    const toggleVoice = useCallback(() => {
        setIsEnabled(prev => {
            if (prev) stop(); // Stop speaking when disabling
            return !prev;
        });
    }, [stop]);

    return { speak, stop, isSpeaking, isEnabled, toggleVoice };
}
