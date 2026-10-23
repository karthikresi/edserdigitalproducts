import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Mic, MicOff, Bot, Sparkles, Globe, MapPin, RefreshCw, RotateCcw } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  sources?: { title?: string; uri?: string }[];
  places?: { title?: string; uri?: string }[];
  engine?: string;
}

interface GeminiChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Client-side domain knowledge fallback in case of local network interruptions.
 */
function getClientMindfulFallback(rawPrompt: string): string {
  const p = rawPrompt.toLowerCase();

  if (p.includes('paper') || p.includes('weight') || p.includes('gsm') || p.includes('bleed') || p.includes('print')) {
    return (
      "### ✍️ Printing & Paper Weight Guide\n\n" +
      "For everyday daily planners, we strongly recommend **28 lb to 32 lb (105–120 GSM)** smooth bright white paper (e.g. HP Premium 32lb) for zero pen ghosting or fountain pen bleed-through.\n\n" +
      "- **Printer Settings**: Select **'Actual Size'** or **'Scale: 100%'** (avoid 'Fit to Printable Area').\n" +
      "- **Kids' Coloring Books**: Use **65 lb (176 GSM) light cardstock** for markers or watercolor, or standard 24 lb paper for crayons.\n" +
      "- **Inner Margins**: Built with generous 0.6-inch inner margins for discbound (Happy Planner), coil, or 3-hole binding."
    );
  }

  if (p.includes('goodnotes') || p.includes('notability') || p.includes('ipad') || p.includes('tablet') || p.includes('hyperlink')) {
    return (
      "### 📱 Tablet & GoodNotes Setup Guide\n\n" +
      "All EDSER planners include hyperlinked vector PDFs designed for GoodNotes, Notability, Penly, and Samsung Notes.\n\n" +
      "1. Download your planner PDF to your iPad Files app.\n" +
      "2. Tap the **Share icon** and select **GoodNotes** (Import as New Document).\n" +
      "3. In GoodNotes, tap the **Read-Only / Browse icon** (pencil with a diagonal line) in the top bar to click month tabs and hyperlinks. Tap it again to write with Apple Pencil!"
    );
  }

  if (p.includes('sheet') || p.includes('spreadsheet') || p.includes('excel') || p.includes('grocery') || p.includes('meal')) {
    return (
      "### 🥗 Meal Planner & Grocery Spreadsheet ($9.00)\n\n" +
      "Our 4-week rotating meal planner includes automated formulas (`FILTER` and `SUMIFS`) that aggregate your recipe ingredients by grocery aisle (*Produce, Dairy, Pantry, Protein*).\n\n" +
      "- **Google Sheets Access**: Click the 1-click copy link in your delivery receipt and choose 'Make a copy'.\n" +
      "- **Excel**: Fully compatible with Microsoft Excel 2016, 2019, 2021, and Office 365.\n" +
      "- **Pantry Tracking**: Keeps track of ingredients on hand so you never buy duplicates."
    );
  }

  if (p.includes('kid') || p.includes('park') || p.includes('adventure') || p.includes('activity') || p.includes('color')) {
    return (
      "### 🌲 My First National Parks Adventure ($8.50)\n\n" +
      "Crafted for curious children **ages 4–8** to foster screen-free wonder:\n\n" +
      "- **24 Wildlife Coloring Pages**: Hand-drawn bears, bisons, giant redwoods, and Yellowstone geysers.\n" +
      "- **8 Hands-on Nature Activities**: Footprint identification, campsite scavenger maze, and trail bingo.\n" +
      "- **Junior Explorer Certificate**: Included to celebrate your little one's exploration!"
    );
  }

  if (p.includes('download') || p.includes('order') || p.includes('access') || p.includes('library')) {
    return (
      "### 📥 Accessing Your Orders & Lifetime Files\n\n" +
      "1. Instant downloads are available immediately upon completing checkout.\n" +
      "2. An automated receipt email with your **Download Access Code** is dispatched immediately.\n" +
      "3. You can click the **User Account icon** in the top navigation bar to open your **User Library** with real-time order status tracking and re-download links anytime!"
    );
  }

  return (
    "### 🌿 EDSER Mindful Planning & Activities Guide\n\n" +
    "I am here to assist with every aspect of your mindful routines and creative family activities:\n\n" +
    "- **Paper Recommendations**: 28–32 lb (105–120 GSM) paper for zero ink bleed.\n" +
    "- **Print Settings**: 100% scale Actual Size, landscape for meal sheets, portrait for planners.\n" +
    "- **Digital Apps**: GoodNotes, Notability, and Google Sheets 1-click copy setups.\n" +
    "- **Kids' Screen-Free Play**: Park scavenger hunts and nature observation kits.\n\n" +
    "What specific area can I help you customize today?"
  );
}

export const GeminiChatModal: React.FC<GeminiChatModalProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: 'Hello! I am your EDSER Planning & Creative Activities Assistant. How can I help you select paper stock, configure your GoodNotes tablet links, organize your meal spreadsheet, or plan screen-free nature activities today?',
      engine: 'edser-mindful-engine',
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

  // Support closing with Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleResetChat = () => {
    triggerHaptic('light');
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'model',
        text: 'Hello! I am your EDSER Planning & Creative Activities Assistant. How can I help you select paper stock, configure your GoodNotes tablet links, organize your meal spreadsheet, or plan screen-free nature activities today?',
        engine: 'edser-mindful-engine',
      },
    ]);
  };

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
            text: data.text || getClientMindfulFallback(textToSend),
            sources: data.sources || [],
            engine: 'google-search-grounding',
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
            text: data.text || 'Here are nearby commercial print centers and outdoor activity locations:',
            places: data.places || [],
            engine: 'google-maps-grounding',
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

        let answer = '';
        let engineTag: string = modelChoice;

        if (res.ok) {
          const data = await res.json();
          answer = data.reply || getClientMindfulFallback(textToSend);
          if (data.model) engineTag = data.model;
        } else {
          // Graceful fallback to client knowledge
          answer = getClientMindfulFallback(textToSend);
          engineTag = 'edser-mindful-engine';
        }

        setMessages((prev) => [
          ...prev,
          {
            id: `model-${Date.now()}`,
            role: 'model',
            text: answer,
            engine: engineTag,
          },
        ]);
      }
      triggerHaptic('success');
    } catch (err: any) {
      // Offline fallback guarantee
      const fallback = getClientMindfulFallback(textToSend);
      setMessages((prev) => [
        ...prev,
        {
          id: `model-${Date.now()}`,
          role: 'model',
          text: fallback,
          engine: 'edser-mindful-engine',
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

  /**
   * Formats markdown text with elegant typography, bold highlights, and clean lists.
   */
  const renderFormattedContent = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, idx) => {
      const trimmed = line.trim();

      // Heading 3
      if (trimmed.startsWith('### ')) {
        return (
          <h4 key={idx} className="font-serif font-bold text-base text-[#2D2A26] mt-2 mb-1">
            {trimmed.replace(/^###\s+/, '')}
          </h4>
        );
      }

      // Bullet points
      if (trimmed.startsWith('- ') || trimmed.startsWith('• ') || trimmed.startsWith('* ')) {
        const itemText = trimmed.replace(/^[-•*]\s+/, '');
        return (
          <div key={idx} className="flex items-start gap-2 my-1 text-xs sm:text-sm pl-1">
            <span className="text-[#70826E] font-bold mt-1 text-xs">•</span>
            <span className="flex-1 text-[#3D3A36] leading-relaxed">
              {renderInlineHighlights(itemText)}
            </span>
          </div>
        );
      }

      // Numbered lists (1. , 2. )
      const numberMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
      if (numberMatch) {
        return (
          <div key={idx} className="flex items-start gap-2 my-1.5 text-xs sm:text-sm pl-1">
            <span className="text-[11px] font-semibold text-[#70826E] bg-[#EEF2ED] px-1.5 py-0.5 rounded shrink-0 mt-0.5">
              {numberMatch[1]}
            </span>
            <span className="flex-1 text-[#3D3A36] leading-relaxed">
              {renderInlineHighlights(numberMatch[2])}
            </span>
          </div>
        );
      }

      // Empty line spacer
      if (!trimmed) {
        return <div key={idx} className="h-1.5" />;
      }

      // Standard paragraph
      return (
        <p key={idx} className="text-xs sm:text-sm leading-relaxed my-0.5">
          {renderInlineHighlights(line)}
        </p>
      );
    });
  };

  /**
   * Parses bold (`**text**`) and italic (`*text*`) highlights inline.
   */
  const renderInlineHighlights = (str: string) => {
    const parts = str.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-semibold text-[#2D2A26]">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="gemini-chat-title"
    >
      <div className="relative w-full max-w-2xl bg-[#FAF8F5] border border-[#EFE9E1] rounded-2xl shadow-2xl h-[88vh] max-h-[800px] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-[#EFE9E1] flex items-center justify-between bg-[#FAF8F5]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#EEF2ED] text-[#70826E] flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h2 id="gemini-chat-title" className="font-serif font-bold text-base text-[#2D2A26] flex items-center gap-2">
                <span>EDSER Assistant</span>
                <span className="text-[11px] font-sans font-medium text-[#70826E] bg-[#EEF2ED] px-2 py-0.5 rounded">
                  Mindful AI
                </span>
              </h2>
              <span className="text-[11px] text-stone-500">Planning, Printing & Screen-Free Guide</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Model switcher */}
            <select
              value={modelChoice}
              onChange={(e: any) => setModelChoice(e.target.value)}
              className="text-xs bg-white border border-[#EFE9E1] rounded-lg px-2 py-1 text-stone-700 outline-none"
              aria-label="Select AI Model"
            >
              <option value="gemini-3.8-flash">gemini-3.8-flash (Standard)</option>
              <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Fast)</option>
            </select>

            <button
              onClick={handleResetChat}
              className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-md transition-colors"
              title="Reset conversation"
              aria-label="Reset conversation"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                triggerHaptic('light');
                onClose();
              }}
              className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-md transition-colors"
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
                className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-[#2D2A26] text-white rounded-br-xs'
                    : 'bg-[#FFFDF9] border border-[#EFE9E1] text-[#2D2A26] rounded-bl-xs shadow-2xs space-y-2'
                }`}
              >
                {msg.role === 'user' ? (
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                ) : (
                  <div className="space-y-1">
                    {renderFormattedContent(msg.text)}
                  </div>
                )}

                {/* Google Search Grounding URLs */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="pt-2 border-t border-stone-200 space-y-1 mt-2">
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
                  <div className="pt-2 border-t border-stone-200 space-y-1 mt-2">
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
            <div className="flex items-center gap-2 text-xs text-stone-500 italic py-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#70826E]" />
              <span>EDSER AI is thinking...</span>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Input Bar with Audio Transcription Microphone */}
        <div className="p-3 sm:p-4 bg-[#FAF8F5] border-t border-[#EFE9E1] space-y-2">
          {/* Quick Prompts */}
          <div className="flex gap-2 overflow-x-auto text-[11px] text-stone-600 pb-1 scrollbar-none">
            <button
              onClick={() => handleSendMessage('What is the best paper stock for printing daily planners to prevent pen bleed?')}
              className="bg-white border border-[#EFE9E1] px-2.5 py-1 rounded-md hover:border-[#70826E] whitespace-nowrap transition-colors"
            >
              Paper for zero bleed?
            </button>
            <button
              onClick={() => handleSendMessage('How do I import and use the hyperlinked planner on GoodNotes for iPad?')}
              className="bg-white border border-[#EFE9E1] px-2.5 py-1 rounded-md hover:border-[#70826E] whitespace-nowrap transition-colors"
            >
              GoodNotes iPad setup?
            </button>
            <button
              onClick={() => handleSendMessage('How do automated grocery categories work in the meal spreadsheet?')}
              className="bg-white border border-[#EFE9E1] px-2.5 py-1 rounded-md hover:border-[#70826E] whitespace-nowrap transition-colors"
            >
              Meal spreadsheet formulas?
            </button>
            <button
              onClick={() => handleSendMessage('What activities and coloring pages are in the National Parks book?')}
              className="bg-white border border-[#EFE9E1] px-2.5 py-1 rounded-md hover:border-[#70826E] whitespace-nowrap transition-colors"
            >
              National Parks book activities?
            </button>
            <button
              onClick={() => handleSendMessage('How do I access my files and download code after ordering?')}
              className="bg-white border border-[#EFE9E1] px-2.5 py-1 rounded-md hover:border-[#70826E] whitespace-nowrap transition-colors"
            >
              Access downloads & orders?
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
                    : 'Ask about paper weights, GoodNotes, spreadsheets, or activities...'
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
              className="min-h-[42px] px-4 bg-[#2D2A26] text-white text-xs font-semibold rounded-xl hover:bg-[#403C36] disabled:opacity-50 transition-colors flex items-center justify-center shrink-0"
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
