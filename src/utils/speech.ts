import { triggerHaptic } from './haptics';

export interface VoiceCommandResult {
  transcript: string;
  commandType?: 'navigate' | 'cart' | 'contrast' | 'close' | 'search' | 'notification' | 'unknown';
  target?: string;
  message: string;
}

export type VoiceNavigationHandler = (result: VoiceCommandResult) => void;

// Safe interface for speech recognition
interface IWindow extends Window {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
}

export class VoiceNavService {
  private recognition: any = null;
  private isListening: boolean = false;
  private onResultCallback: VoiceNavigationHandler | null = null;
  private onStateChangeCallback: ((listening: boolean) => void) | null = null;
  private isSupported: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const win = window as IWindow;
      const SpeechRecognitionClass = win.SpeechRecognition || win.webkitSpeechRecognition;
      if (SpeechRecognitionClass) {
        this.isSupported = true;
        try {
          this.recognition = new SpeechRecognitionClass();
          this.recognition.continuous = true;
          this.recognition.interimResults = false;
          this.recognition.lang = 'en-US';

          this.recognition.onstart = () => {
            this.isListening = true;
            this.onStateChangeCallback?.(true);
            triggerHaptic('light');
          };

          this.recognition.onend = () => {
            this.isListening = false;
            this.onStateChangeCallback?.(false);
          };

          this.recognition.onerror = (_e: any) => {
            this.isListening = false;
            this.onStateChangeCallback?.(false);
          };

          this.recognition.onresult = (event: any) => {
            const current = event.resultIndex;
            const transcript = event.results[current][0].transcript.trim().toLowerCase();
            this.parseCommand(transcript);
          };
        } catch {
          this.isSupported = false;
        }
      }
    }
  }

  public checkSupport(): boolean {
    return this.isSupported;
  }

  public getIsListening(): boolean {
    return this.isListening;
  }

  public setCallbacks(
    onResult: VoiceNavigationHandler,
    onStateChange: (listening: boolean) => void
  ) {
    this.onResultCallback = onResult;
    this.onStateChangeCallback = onStateChange;
  }

  public startListening() {
    if (!this.recognition) return;
    try {
      this.recognition.start();
      triggerHaptic('medium');
    } catch {
      // If already started or blocked
    }
  }

  public stopListening() {
    if (!this.recognition) return;
    try {
      this.recognition.stop();
      triggerHaptic('light');
    } catch {
      // Ignore
    }
  }

  public toggleListening() {
    if (this.isListening) {
      this.stopListening();
    } else {
      this.startListening();
    }
  }

  public parseCommand(rawTranscript: string) {
    const text = rawTranscript.toLowerCase();
    triggerHaptic('medium');

    let result: VoiceCommandResult = {
      transcript: text,
      commandType: 'unknown',
      message: `Heard: "${text}"`
    };

    if (text.includes('home') || text.includes('go home') || text.includes('main')) {
      result = {
        transcript: text,
        commandType: 'navigate',
        target: 'home',
        message: 'Navigating to Home'
      };
    } else if (text.includes('planner') || text.includes('organization') || text.includes('meal')) {
      result = {
        transcript: text,
        commandType: 'navigate',
        target: 'planners',
        message: 'Opening Planners & Organization'
      };
    } else if (text.includes('kid') || text.includes('children') || text.includes('activity') || text.includes('coloring')) {
      result = {
        transcript: text,
        commandType: 'navigate',
        target: 'kids',
        message: "Opening Kids’ Activities"
      };
    } else if (text.includes('shop') || text.includes('catalog') || text.includes('store') || text.includes('browse')) {
      result = {
        transcript: text,
        commandType: 'navigate',
        target: 'shop',
        message: 'Opening Shop Catalog'
      };
    } else if (text.includes('cart') || text.includes('bag') || text.includes('basket')) {
      result = {
        transcript: text,
        commandType: 'cart',
        message: 'Opening Shopping Cart'
      };
    } else if (text.includes('wishlist') || text.includes('saved') || text.includes('favorite')) {
      result = {
        transcript: text,
        commandType: 'unknown', // Handled via transcript check in App.tsx
        message: 'Opening Wishlist'
      };
    } else if (text.includes('about') || text.includes('story')) {
      result = {
        transcript: text,
        commandType: 'navigate',
        target: 'about',
        message: 'Opening About EDSER'
      };
    } else if (text.includes('contact') || text.includes('support')) {
      result = {
        transcript: text,
        commandType: 'navigate',
        target: 'contact',
        message: 'Opening Contact'
      };
    } else if (text.includes('faq') || text.includes('help') || text.includes('question')) {
      result = {
        transcript: text,
        commandType: 'navigate',
        target: 'faq',
        message: 'Opening Questions & Answers'
      };
    } else if (text.includes('contrast') || text.includes('high contrast') || text.includes('dark mode')) {
      result = {
        transcript: text,
        commandType: 'contrast',
        message: 'Toggling High Contrast Mode'
      };
    } else if (text.includes('notify') || text.includes('notification') || text.includes('alert') || text.includes('drop')) {
      result = {
        transcript: text,
        commandType: 'notification',
        message: 'Opening Launch Notifications'
      };
    } else if (text.includes('close') || text.includes('cancel') || text.includes('dismiss') || text.includes('back')) {
      result = {
        transcript: text,
        commandType: 'close',
        message: 'Closing active modal'
      };
    } else if (text.startsWith('search') || text.startsWith('find')) {
      const query = text.replace(/^(search|find|search for)\s+/, '');
      result = {
        transcript: text,
        commandType: 'search',
        target: query,
        message: `Searching for: "${query}"`
      };
    }

    if (this.onResultCallback) {
      this.onResultCallback(result);
    }
  }
}

export const voiceService = new VoiceNavService();
