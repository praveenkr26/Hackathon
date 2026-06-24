import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';

/**
 * Hook for Web Speech API Text-to-Speech (TTS)
 */
export const useSpeech = () => {
  const { language } = useLanguage();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState([]);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    const synth = window.speechSynthesis;
    
    const loadVoices = () => {
      setVoices(synth.getVoices());
    };

    loadVoices();
    if (synth.onvoiceschanged !== undefined) {
      synth.onvoiceschanged = loadVoices;
    }

    // Set speaking state based on browser state
    const checkState = setInterval(() => {
      setIsSpeaking(synth.speaking);
    }, 200);

    return () => {
      clearInterval(checkState);
      synth.cancel();
    };
  }, []);

  const speak = useCallback((text) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      console.warn('Speech synthesis not supported in this browser.');
      return;
    }

    const synth = window.speechSynthesis;
    
    // Stop any active speech
    synth.cancel();

    if (!text) return;

    // Split text into sentences using English (. ? !) and Hindi (। ? !) full stop characters
    const sentences = text.match(/[^.।!?]+[.।!?]*/g) || [text];
    const isHi = language === 'hi';
    const allVoices = synth.getVoices().length > 0 ? synth.getVoices() : voices;

    // Find matching voice
    const matchVoices = allVoices.filter(v => {
      const vLang = v.lang.toLowerCase();
      const vName = v.name.toLowerCase();
      if (isHi) {
        return vLang.startsWith('hi') || vName.includes('hindi') || vLang === 'hi-in';
      } else {
        return vLang.startsWith('en') || vName.includes('english') || vLang.startsWith('en-');
      }
    });

    let selectedVoice = null;
    if (matchVoices.length > 0) {
      const preferred = matchVoices.find(v => 
        v.name.toLowerCase().includes('google') || 
        v.name.toLowerCase().includes('natural') || 
        v.name.toLowerCase().includes('swara') ||
        v.name.toLowerCase().includes('online')
      );
      selectedVoice = preferred || matchVoices[0];
    }

    let activeUtterances = 0;

    sentences.forEach((sentence, idx) => {
      const cleanSentence = sentence.trim();
      if (!cleanSentence) return;

      const utterance = new SpeechSynthesisUtterance(cleanSentence);
      utterance.lang = isHi ? 'hi-IN' : 'en-IN';
      
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      // Configure properties
      utterance.rate = isHi ? 0.88 : 1.0; // slightly slower for Hindi clarity
      utterance.pitch = 1.0;

      activeUtterances++;

      utterance.onstart = () => {
        setIsSpeaking(true);
      };

      utterance.onend = () => {
        activeUtterances--;
        if (activeUtterances <= 0) {
          setIsSpeaking(false);
        }
      };

      utterance.onerror = (e) => {
        console.error('Speech synthesis error:', e);
        activeUtterances--;
        if (activeUtterances <= 0) {
          setIsSpeaking(false);
        }
      };

      synth.speak(utterance);
    });
  }, [language, voices]);

  const stop = useCallback(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  return {
    speak,
    stop,
    isSpeaking,
    supported: typeof window !== 'undefined' && !!window.speechSynthesis
  };
};

export default useSpeech;
