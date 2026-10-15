import React from 'react';
import { Mic, MicOff, Volume2, X, Command } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';

interface VoiceNavOverlayProps {
  isListening: boolean;
  onToggleListening: () => void;
  lastCommand: string;
  lastMessage: string;
}

export const VoiceNavOverlay: React.FC<VoiceNavOverlayProps> = ({
  isListening,
  onToggleListening,
  lastCommand,
  lastMessage
}) => {
  if (!isListening && !lastCommand) return null;

  return (
    <div
      className="fixed bottom-4 left-4 z-40 max-w-sm w-full bg-[#FAF8F5]/98 border border-[#EFE9E1] rounded-2xl shadow-xl p-4 transition-all duration-200 animate-in slide-in-from-bottom-2"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center justify-between pb-2 border-b border-[#EFE9E1]">
        <div className="flex items-center gap-2">
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center ${
              isListening ? 'bg-[#70826E] text-white animate-pulse' : 'bg-stone-200 text-stone-600'
            }`}
          >
            {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
          </div>
          <div>
            <h4 className="text-xs font-semibold text-[#2D2A26]">
              {isListening ? 'Voice Navigation Active' : 'Voice Navigation Paused'}
            </h4>
            <span className="text-[10px] text-stone-500 block">Listening for accessibility commands</span>
          </div>
        </div>

        <button
          onClick={() => {
            triggerHaptic('light');
            onToggleListening();
          }}
          className="p-1.5 text-stone-400 hover:text-[#2D2A26] rounded-md transition-colors"
          aria-label={isListening ? 'Stop listening' : 'Resume voice navigation'}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Spoken Feedback */}
      <div className="py-2.5 space-y-1">
        {lastMessage ? (
          <div className="flex items-start gap-2 text-xs text-[#2D2A26] bg-[#EEF2ED] p-2 rounded-lg">
            <Volume2 className="w-3.5 h-3.5 text-[#70826E] shrink-0 mt-0.5" />
            <span className="font-medium">{lastMessage}</span>
          </div>
        ) : (
          <p className="text-xs text-stone-500 italic">Say a command clearly...</p>
        )}
      </div>

      {/* Suggested Voice Commands */}
      <div className="pt-2 border-t border-[#EFE9E1] text-[11px] text-stone-500 space-y-1">
        <span className="font-semibold text-stone-700 flex items-center gap-1">
          <Command className="w-3 h-3 text-[#70826E]" />
          Available Voice Commands:
        </span>
        <div className="flex flex-wrap gap-1 text-[10px]">
          {['"Home"', '"Shop"', '"Planners"', '"Kids"', '"Open Cart"', '"Search [topic]"', '"High Contrast"', '"Close"'].map((cmd) => (
            <span key={cmd} className="bg-stone-100 px-1.5 py-0.5 rounded text-stone-700">
              {cmd}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
