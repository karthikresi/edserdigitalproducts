import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Mic, MicOff, Bot, Sparkles, Globe, MapPin, RefreshCw, Volume2 } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  sources?: { title?: string; uri?: string }[];
  places?: { title?: string; uri?: string }[];
}

interface GeminiChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GeminiChatModal: React.FC<GeminiChatModalProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: 'Hello! I am your EDSER Planning & Creative Activities Assistant. How can I help you organize your daily routines, customize your meal spreadsheets, or prepare screen-free learning activities today?',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [modelChoice, setModelChoice] = useState<'gemini-3.8-flash' | 'gemini-3.1-flash-lite'>('gemini-3.8-flash');
  const [useSearchGrounding, setUseSearchGrounding] = useState(false);
  const [useMapsGrounding, setUseMapsGrounding] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (!isOpen) return null;

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputText;
    if (!textToSend.trim() || isLoading) return;

    triggerHaptic('medium');
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: textToSend,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      if (useSearchGrounding) {
        // Call search grounding endpoint
        const res = await fetch('/api/search-grounding', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: textToSend }),
        });
        const data = await res.json();
        setMessages((prev) => [
          ...prev,
          {
            id: `model-${Date.now()}`,
            role: 'model',
            text: data.text || 'Here is what I found based on real-time web search:',
            sources: data.sources || [],
          },
        ]);
      } else if (useMapsGrounding) {
        // Call maps grounding endpoint
        let lat: number | undefined;
        let lng: number | undefined;
        if ('geolocation' in navigator) {
          try {
            const pos: any = await new Promise((resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 3000 });
            });
            lat = pos.coords.latitude;
            lng = pos.coords.longitude;
          } catch {
            // Default location
          }
        }

        const res = await fetch('/api/maps-grounding', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: textToSend, latitude: lat, longitude: lng }),
        });
        const data = await res.json();
        setMessages((prev) => [
          ...prev,
          {
            id: `model-${Date.now()}`,
            role: 'model',
            text: data.text || 'Here are nearby locations and map details:',
            places: data.places || [],
          },
        ]);
      } else {
        // Standard multi-turn chat
        const history = messages.map((m) => ({
          role: m.role,
          parts: [{ text: m.text }],
        }));
        history.push({ role: 'user', parts: [{ text: textToSend }] });

        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: history,
            modelChoice,
          }),
        });
        const data = await res.json();
        setMessages((prev) => [
          ...prev,
          {
            id: `model-${Date.now()}`,
            role: 'model',
            text: data.reply || "I'm here to help with your planners and activities.",
          },
        ]);
      }
      triggerHaptic('success');
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `model-err-${Date.now()}`,
          role: 'model',
          text: `Apologies, I encountered an issue: ${err.message || 'Please try again.'}`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Audio Recording with gemini-3.5-transcribe
  const startRecording = async () => {
    try {
      triggerHaptic('medium');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64Audio = (reader.result as string).split(',')[1];
          try {
            setIsLoading(true);
            const res = await fetch('/api/transcribe', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                audioData: base64Audio,
                mimeType: 'audio/webm',
              }),
            });
            const data = await res.json();
            if (data.transcript) {
              setInputText(data.transcript);
              triggerHaptic('success');
            }
          } catch (e) {
            console.error('Transcription failed', e);
          } finally {
            setIsLoading(false);
          }
        };
        reader.readAsDataURL(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Microphone error', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      triggerHaptic('light');
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="gemini-chat-title"
    >
      <div className="relative w-full max-w-2xl bg-[#FAF8F5] border border-[#EFE9E1] rounded-2xl shadow-2xl h-[85vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-[#EFE9E1] flex items-center justify-between bg-[#FAF8F5]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#EEF2ED] text-[#70826E] flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h2 id="gemini-chat-title" className="font-serif font-bold text-base text-[#2D2A26] flex items-center gap-2">
                <span>EDSER Assistant</span>
                <span className="text-[11px] font-sans font-normal text-stone-500 bg-stone-100 px-2 py-0.5 rounded">
                  {modelChoice}
                </span>
              </h2>
              <span className="text-[11px] text-[#70826E]">Mindful Planning & Activities Guide</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Model switcher */}
            <select
              value={modelChoice}
              onChange={(e: any) => setModelChoice(e.target.value)}
              className="text-xs bg-white border border-[#EFE9E1] rounded-lg px-2 py-1 text-stone-700 outline-none"
            >
              <option value="gemini-3.8-flash">gemini-3.8-flash (Standard)</option>
              <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Fast)</option>
            </select>

            <button
              onClick={() => {
                triggerHaptic('light');
                onClose();
              }}
              className="p-1.5 text-stone-400 hover:text-stone-700 rounded-md"
              aria-label="Close chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Feature Grounding Bar */}
        <div className="px-5 py-2 bg-[#F3EFEA]/80 border-b border-[#EFE9E1] flex items-center gap-2 overflow-x-auto text-xs">
          <span className="text-stone-500 text-[11px] whitespace-nowrap">Grounding Tools:</span>
          
          <button
            onClick={() => {
              triggerHaptic('light');
              setUseSearchGrounding(!useSearchGrounding);
              if (!useSearchGrounding) setUseMapsGrounding(false);
            }}
            className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              useSearchGrounding
                ? 'bg-[#70826E] text-white'
                : 'bg-white border border-[#EFE9E1] text-stone-700 hover:border-stone-400'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Search Grounding</span>
          </button>

          <button
            onClick={() => {
              triggerHaptic('light');
              setUseMapsGrounding(!useMapsGrounding);
              if (!useMapsGrounding) setUseSearchGrounding(false);
            }}
            className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              useMapsGrounding
                ? 'bg-[#70826E] text-white'
                : 'bg-white border border-[#EFE9E1] text-stone-700 hover:border-stone-400'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Maps Grounding (Print Shops & Parks)</span>
          </button>
        </div>

        {/* Scrollable Chat Thread */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'model' && (
                <div className="w-7 h-7 rounded-full bg-[#EEF2ED] text-[#70826E] flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
              )}

              <div
                className={`max-w-[82%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-[#2D2A26] text-white rounded-br-xs'
                    : 'bg-[#FFFDF9] border border-[#EFE9E1] text-[#2D2A26] rounded-bl-xs shadow-2xs space-y-2'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.text}</p>

                {/* Google Search Grounding URLs */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="pt-2 border-t border-stone-200 space-y-1">
                    <span className="text-[11px] font-semibold text-stone-500 block">
                      Google Search Web Sources:
                    </span>
                    <div className="flex flex-col gap-1">
                      {msg.sources.map((s, idx) => (
                        <a
                          key={idx}
                          href={s.uri}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-[#70826E] hover:underline flex items-center gap-1 truncate"
                        >
                          <Globe className="w-3 h-3 shrink-0" />
                          <span className="truncate">{s.title || s.uri}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Google Maps Grounding URLs */}
                {msg.places && msg.places.length > 0 && (
                  <div className="pt-2 border-t border-stone-200 space-y-1">
                    <span className="text-[11px] font-semibold text-stone-500 block">
                      Google Maps Places & Locations:
                    </span>
                    <div className="flex flex-col gap-1">
                      {msg.places.map((p, idx) => (
                        <a
                          key={idx}
                          href={p.uri}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-[#D48B80] hover:underline flex items-center gap-1 truncate font-medium"
                        >
                          <MapPin className="w-3 h-3 shrink-0" />
                          <span className="truncate">{p.title || p.uri}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-stone-500 italic">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#70826E]" />
              <span>EDSER AI is thinking...</span>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Input Bar with Audio Transcription Microphone */}
        <div className="p-3 sm:p-4 bg-[#FAF8F5] border-t border-[#EFE9E1] space-y-2">
          {/* Quick Prompts */}
          <div className="flex gap-2 overflow-x-auto text-[11px] text-stone-600 pb-1">
            <button
              onClick={() => handleSendMessage('What is the best paper stock for printing daily planners?')}
              className="bg-white border border-[#EFE9E1] px-2.5 py-1 rounded-md hover:border-[#70826E] whitespace-nowrap"
            >
              Best paper for planners?
            </button>
            <button
              onClick={() => handleSendMessage('How do I set up automated grocery categories in the spreadsheet?')}
              className="bg-white border border-[#EFE9E1] px-2.5 py-1 rounded-md hover:border-[#70826E] whitespace-nowrap"
            >
              Spreadsheet grocery formulas?
            </button>
            <button
              onClick={() => handleSendMessage('Suggest 3 fun screen-free park activities for a 5-year-old.')}
              className="bg-white border border-[#EFE9E1] px-2.5 py-1 rounded-md hover:border-[#70826E] whitespace-nowrap"
            >
              Screen-free activities?
            </button>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={
                  isRecording
                    ? 'Listening... Click mic to transcribe with gemini-3.5-transcribe'
                    : 'Ask about printing, spreadsheets, or activities...'
                }
                className="w-full pl-3.5 pr-10 py-2.5 bg-white border border-[#EFE9E1] rounded-xl text-xs sm:text-sm text-[#2D2A26] placeholder:text-stone-400 focus:border-[#70826E] outline-none"
              />

              {/* Transcribe Audio Mic Button */}
              <button
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
                className={`absolute right-2 top-2 p-1.5 rounded-lg transition-colors ${
                  isRecording
                    ? 'bg-rose-500 text-white animate-pulse'
                    : 'text-stone-400 hover:text-[#70826E] hover:bg-stone-100'
                }`}
                title={isRecording ? 'Stop & Transcribe' : 'Transcribe voice with gemini-3.5-transcribe'}
                aria-label="Microphone for audio transcription"
              >
                {isRecording ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              </button>
            </div>

            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="min-h-[42px] px-4 bg-[#2D2A26] text-white text-xs font-semibold rounded-xl hover:bg-[#403C36] disabled:opacity-50 transition-colors flex items-center justify-center"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
