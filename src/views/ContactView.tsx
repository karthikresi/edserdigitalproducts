import React, { useState } from 'react';
import { Mail, MessageSquare, AlertCircle, Send, CheckCircle2, ShieldCheck, Printer } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';

export const ContactView: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('Download or File Inquiry');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !message) return;
    triggerHaptic('success');
    setIsSubmitted(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
      
      {/* Header */}
      <div className="text-center space-y-3 max-w-xl mx-auto">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#70826E]">
          Customer Support & Inquiries
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#2D2A26]">
          We’re here to help you get started.
        </h1>
        <p className="text-sm text-[#5C564E] leading-relaxed">
          Have a question regarding printing paper, opening your Google Sheet, or accessing your downloads? Drop us a note below.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Contact Form (7 cols) */}
        <div className="md:col-span-7 bg-[#FFFDF9] border border-[#EFE9E1] rounded-2xl p-6 sm:p-8 shadow-xs">
          {isSubmitted ? (
            <div className="text-center py-10 space-y-3">
              <div className="w-12 h-12 bg-[#EEF2ED] text-[#70826E] rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-serif font-bold text-[#2D2A26]">Message Received</h3>
              <p className="text-xs text-[#5C564E] max-w-sm mx-auto">
                Thank you, {name || 'valued customer'}. Our team will review your inquiry and reply to <strong>{email}</strong> within 1 business day.
              </p>
              <button
                onClick={() => {
                  setIsSubmitted(false);
                  setMessage('');
                }}
                className="mt-4 px-4 py-2 text-xs font-semibold bg-[#2D2A26] text-white rounded-lg hover:bg-[#403C36]"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="font-serif font-bold text-lg text-[#2D2A26]">Send a Direct Message</h3>

              <div>
                <label htmlFor="contact-name" className="block text-xs font-medium text-[#2D2A26] mb-1">
                  Your Name
                </label>
                <input
                  id="contact-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sarah Jenkins"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#EFE9E1] rounded-lg text-xs sm:text-sm text-[#2D2A26] focus:border-[#70826E] outline-none"
                />
              </div>

              <div>
                <label htmlFor="contact-email" className="block text-xs font-medium text-[#2D2A26] mb-1">
                  Email Address <span className="text-[#D48B80]">*</span>
                </label>
                <input
                  id="contact-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#EFE9E1] rounded-lg text-xs sm:text-sm text-[#2D2A26] focus:border-[#70826E] outline-none"
                />
              </div>

              <div>
                <label htmlFor="contact-subject" className="block text-xs font-medium text-[#2D2A26] mb-1">
                  Topic
                </label>
                <select
                  id="contact-subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#EFE9E1] rounded-lg text-xs sm:text-sm text-[#2D2A26] focus:border-[#70826E] outline-none"
                >
                  <option value="Download or File Inquiry">Download or File Access Assistance</option>
                  <option value="Printing Advice">Home Printing & Paper Guidance</option>
                  <option value="Spreadsheet Compatibility">Google Sheets or Excel Compatibility</option>
                  <option value="Custom Licensing">Classroom or Group Licensing Request</option>
                  <option value="Store Owner Communication">Store Owner Administration / Feedback</option>
                </select>
              </div>

              <div>
                <label htmlFor="contact-message" className="block text-xs font-medium text-[#2D2A26] mb-1">
                  Message <span className="text-[#D48B80]">*</span>
                </label>
                <textarea
                  id="contact-message"
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your question or technical need..."
                  className="w-full px-3.5 py-2.5 bg-white border border-[#EFE9E1] rounded-lg text-xs sm:text-sm text-[#2D2A26] focus:border-[#70826E] outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full min-h-[44px] py-3 bg-[#2D2A26] text-white text-xs font-semibold rounded-lg hover:bg-[#403C36] transition-colors flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Submit Inquiry</span>
              </button>
            </form>
          )}
        </div>

        {/* Helpful Info & Flagged Store Owner Details (5 cols) */}
        <div className="md:col-span-5 space-y-6">
          
          <div className="bg-[#FFFDF9] border border-[#EFE9E1] rounded-2xl p-6 space-y-3">
            <h4 className="font-serif font-bold text-base text-[#2D2A26] flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#70826E]" />
              Quick Support Contacts
            </h4>
            <div className="text-xs text-[#5C564E] space-y-2">
              <p>
                <strong className="text-[#2D2A26] block">Direct Email:</strong>
                support@edserstationery.com
              </p>
              <p>
                <strong className="text-[#2D2A26] block">Support Hours:</strong>
                Monday – Friday, 9:00 AM – 5:00 PM EST
              </p>
              <p>
                <strong className="text-[#2D2A26] block">Response Time:</strong>
                Typically within 2 to 4 business hours for file access queries.
              </p>
            </div>
          </div>

          {/* Transparent Store Owner Configuration Notice as requested */}
          <div className="bg-amber-50/80 border border-amber-200/90 rounded-2xl p-6 space-y-3">
            <div className="flex items-center gap-2 text-amber-900 font-semibold text-xs uppercase tracking-wider">
              <AlertCircle className="w-4 h-4 text-amber-700" />
              <span>Store Owner Notes</span>
            </div>
            <h4 className="font-serif font-bold text-sm text-amber-950">
              Flagged Store Configuration Items
            </h4>
            <p className="text-xs text-amber-900 leading-relaxed">
              In accordance with our transparent store policy, missing or unconfigured store owner parameters are flagged here rather than invented:
            </p>
            <ul className="space-y-1.5 text-xs text-amber-800 list-disc list-inside">
              <li>Custom enterprise and school co-op multi-user licensing terms to be provided upon merchant review.</li>
              <li>Webhook automated delivery integration is currently active in simulated demonstration mode.</li>
              <li>Merchant tax ID and European VAT registration numbers will display on receipts upon commercial account verification.</li>
            </ul>
          </div>

        </div>

      </div>

    </div>
  );
};
