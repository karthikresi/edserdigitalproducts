import React, { Component, ErrorInfo, ReactNode } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import {
  AlertTriangle,
  RefreshCw,
  Home,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  CloudCheck,
  ShieldAlert,
  Sparkles
} from 'lucide-react';

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error, resetError: () => void) => ReactNode);
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  logId: string | null;
  isLoggedToFirestore: boolean;
  isLogging: boolean;
  showDetails: boolean;
  copiedId: boolean;
}

/**
 * Sanitizes messages to prevent sensitive tokens, keys, or query params from leaking to logs
 */
function sanitizeMessage(str: string): string {
  if (!str) return 'Unknown error occurred';
  return str
    .replace(/AIza[0-9A-Za-z-_]{35}/g, '[REDACTED_API_KEY]')
    .replace(/bearer\s+[a-zA-Z0-9_\-\.]+/gi, 'Bearer [REDACTED_TOKEN]')
    .replace(/[?&](key|token|auth)=[^&\s]+/gi, '$1=[REDACTED]');
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      logId: null,
      isLoggedToFirestore: false,
      isLogging: false,
      showDetails: false,
      copiedId: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const rawId = `err_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const sanitizedId = rawId.replace(/[^a-zA-Z0-9_-]/g, '_');

    this.setState({
      error,
      errorInfo,
      logId: sanitizedId,
      isLogging: true,
    });

    // Notify custom listener if provided
    try {
      this.props.onError?.(error, errorInfo);
    } catch {
      // ignore custom handler errors
    }

    // Persist error diagnostics directly to Cloud Firestore
    this.logErrorToFirestore(sanitizedId, error, errorInfo);
  }

  private async logErrorToFirestore(logId: string, error: Error, errorInfo: ErrorInfo) {
    try {
      const sanitizedMsg = sanitizeMessage(error.message || 'React rendering exception').slice(0, 1000);
      const sanitizedStack = sanitizeMessage(error.stack || '').slice(0, 4000);
      const sanitizedCompStack = sanitizeMessage(errorInfo.componentStack || '').slice(0, 4000);
      const currentUrl = sanitizeMessage(window.location.href).slice(0, 512);
      const userAgent = (navigator.userAgent || '').slice(0, 512);

      const logPayload = {
        id: logId,
        message: sanitizedMsg,
        stack: sanitizedStack,
        componentStack: sanitizedCompStack,
        url: currentUrl,
        userAgent,
        userId: auth?.currentUser?.uid ? auth.currentUser.uid.slice(0, 128) : 'guest-user',
        userEmail: auth?.currentUser?.email ? auth.currentUser.email.slice(0, 256) : 'unauthenticated',
        timestamp: new Date().toISOString(),
      };

      await setDoc(doc(db, 'error_logs', logId), logPayload);

      this.setState({
        isLoggedToFirestore: true,
        isLogging: false,
      });
    } catch (firestoreErr) {
      console.warn('ErrorBoundary: Unable to persist log to Firestore:', firestoreErr);
      this.setState({
        isLoggedToFirestore: false,
        isLogging: false,
      });
    }
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      logId: null,
      isLoggedToFirestore: false,
      isLogging: false,
      showDetails: false,
      copiedId: false,
    });
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleReturnHome = () => {
    try {
      window.location.hash = '';
      window.history.pushState({}, '', '/');
    } catch {
      // ignore
    }
    this.handleReset();
  };

  private handleCopyLogId = () => {
    if (!this.state.logId) return;
    navigator.clipboard.writeText(this.state.logId).catch(() => {});
    this.setState({ copiedId: true });
    setTimeout(() => this.setState({ copiedId: false }), 2000);
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const { error, errorInfo, logId, isLoggedToFirestore, isLogging, showDetails, copiedId } = this.state;
    const { fallback } = this.props;

    // Custom fallback support
    if (typeof fallback === 'function') {
      return fallback(error || new Error('Unknown error'), this.handleReset);
    }
    if (fallback) {
      return fallback;
    }

    return (
      <div className="min-h-screen bg-[#FAF8F5] text-[#2D2A26] flex items-center justify-center p-4 sm:p-6 font-sans">
        <div className="w-full max-w-xl bg-white border border-[#EFE9E1] rounded-2xl shadow-xl overflow-hidden">
          
          {/* Header decoration */}
          <div className="h-2 bg-gradient-to-r from-amber-500 via-[#70826E] to-emerald-600" />

          <div className="p-6 sm:p-8 space-y-6">
            
            {/* Icon & Title */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h1 className="font-serif font-bold text-2xl text-[#2D2A26]">
                  Something interrupted your view
                </h1>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  An unexpected rendering error was safely intercepted to prevent a blank screen. Your saved items, cart, and account data remain completely safe.
                </p>
              </div>
            </div>

            {/* Cloud Diagnostics Status Banner */}
            <div className="bg-[#FAF8F5] border border-[#EFE9E1] rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                {isLogging ? (
                  <>
                    <RefreshCw className="w-4 h-4 text-amber-600 animate-spin" />
                    <span className="text-stone-600">Logging diagnostics to Firestore...</span>
                  </>
                ) : isLoggedToFirestore ? (
                  <>
                    <CloudCheck className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-800 font-medium">
                      Incident logged to Cloud Firestore
                    </span>
                  </>
                ) : (
                  <>
                    <ShieldAlert className="w-4 h-4 text-stone-500" />
                    <span className="text-stone-600">Diagnostics captured locally</span>
                  </>
                )}
              </div>

              {logId && (
                <div className="flex items-center gap-1.5 font-mono text-[11px] text-stone-500">
                  <span className="text-stone-400">ID:</span>
                  <code className="bg-white px-2 py-0.5 rounded border border-stone-200 text-stone-700 font-semibold">
                    {logId}
                  </code>
                  <button
                    onClick={this.handleCopyLogId}
                    className="p-1 text-stone-400 hover:text-stone-700 rounded transition-colors"
                    title="Copy incident reference ID"
                    aria-label="Copy incident reference ID"
                  >
                    {copiedId ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Error Message Summary */}
            <div className="p-3.5 rounded-lg bg-red-50/60 border border-red-200 text-xs text-red-900 space-y-1">
              <div className="font-semibold flex items-center gap-1.5">
                <span>Error Summary:</span>
              </div>
              <p className="font-mono text-[11px] break-words text-red-800">
                {error?.message ? sanitizeMessage(error.message) : 'An unknown component render failure occurred.'}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={this.handleReset}
                className="flex-1 min-w-[130px] px-4 py-2.5 bg-[#70826E] hover:bg-[#5E6E5D] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-transform active:scale-95 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Try Again</span>
              </button>

              <button
                onClick={this.handleReload}
                className="px-4 py-2.5 bg-white hover:bg-stone-50 border border-[#EFE9E1] text-[#2D2A26] text-xs sm:text-sm font-semibold rounded-xl shadow-2xs transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4 text-stone-500" />
                <span>Reload Page</span>
              </button>

              <button
                onClick={this.handleReturnHome}
                className="px-4 py-2.5 bg-white hover:bg-stone-50 border border-[#EFE9E1] text-stone-600 text-xs sm:text-sm font-medium rounded-xl shadow-2xs transition-colors flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4 text-stone-400" />
                <span>Home</span>
              </button>
            </div>

            {/* Collapsible Technical Stack Trace Details */}
            <div className="pt-2 border-t border-[#EFE9E1]">
              <button
                onClick={() => this.setState({ showDetails: !showDetails })}
                className="text-xs text-stone-500 hover:text-stone-800 flex items-center gap-1.5 font-medium transition-colors"
              >
                {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                <span>{showDetails ? 'Hide Technical Details' : 'Show Technical Details'}</span>
              </button>

              {showDetails && (
                <div className="mt-3 p-3 bg-stone-900 text-stone-200 rounded-xl text-[10px] font-mono overflow-x-auto max-h-56 space-y-2 select-text">
                  {error?.stack && (
                    <div>
                      <div className="text-amber-400 font-bold mb-1">Stack Trace:</div>
                      <pre className="whitespace-pre-wrap">{sanitizeMessage(error.stack)}</pre>
                    </div>
                  )}
                  {errorInfo?.componentStack && (
                    <div className="pt-2 border-t border-stone-800">
                      <div className="text-emerald-400 font-bold mb-1">Component Hierarchy:</div>
                      <pre className="whitespace-pre-wrap">{sanitizeMessage(errorInfo.componentStack)}</pre>
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>

          {/* Footer Branding */}
          <div className="px-6 py-3 bg-[#FAF8F5] border-t border-[#EFE9E1] flex items-center justify-between text-[11px] text-stone-500">
            <span>EDSER Resilient Application Layer</span>
            <span>Zero Data Loss Protection</span>
          </div>

        </div>
      </div>
    );
  }
}
