import React, { useState } from 'react';
import {
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  ArrowLeft,
  MessageSquare
} from 'lucide-react';
import { BUSINESS_INFO } from '../data/servicesData';

interface WhatsAppMessagePreviewProps {
  message: string;
  serviceLabel?: string;
  packageLabel?: string;
  priceLabel?: string;
  onEdit: () => void;
  editButtonLabel?: string;
  recipientPhone?: string;
}

export const WhatsAppMessagePreview: React.FC<WhatsAppMessagePreviewProps> = ({
  message,
  serviceLabel,
  packageLabel,
  priceLabel,
  onEdit,
  editButtonLabel = 'Edit details',
  recipientPhone = BUSINESS_INFO.phone
}) => {
  const [copied, setCopied] = useState<'idle' | 'copied' | 'selected'>('idle');
  const preRef = React.useRef<HTMLPreElement | null>(null);

  const whatsappUrl = `https://wa.me/${BUSINESS_INFO.whatsappRaw}?text=${encodeURIComponent(message)}`;

  const handleCopy = async () => {
    let didCopy = false;

    // 1. Synchronous copy while transient user activation is guaranteed
    if (typeof document !== 'undefined') {
      try {
        const ta = document.createElement('textarea');
        ta.value = message;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        ta.style.top = '0';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        ta.setSelectionRange(0, message.length);
        didCopy = document.execCommand('copy');
        document.body.removeChild(ta);
      } catch {
        didCopy = false;
      }
    }

    // 2. Async Clipboard API fallback if execCommand failed
    if (!didCopy && typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(message);
        didCopy = true;
      } catch {
        didCopy = false;
      }
    }

    if (didCopy) {
      setCopied('copied');
      return;
    }

    // 3. Last-resort visible selection inside preview box
    if (typeof window !== 'undefined' && typeof document !== 'undefined' && preRef.current) {
      try {
        const range = document.createRange();
        range.selectNodeContents(preRef.current);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
        setCopied('selected');
        return;
      } catch {
        // Ignore selection error
      }
    }

    setCopied('idle');
  };

  return (
    <div
      data-testid="whatsapp-message-preview"
      className="bg-[#F6F5F1] border border-[#0B1426] rounded-xl p-4 sm:p-5 space-y-4 text-left"
      role="region"
      aria-label="Prepared WhatsApp message review"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <CheckCircle2 className="w-5 h-5 text-[#C49A36] shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-[#0B1426]">
              Message prepared.
            </p>
            <p className="text-xs text-[#526176] mt-0.5 leading-relaxed">
              Review your details below, then open WhatsApp to send this inquiry to {BUSINESS_INFO.founder} ({recipientPhone}).
            </p>
          </div>
        </div>
      </div>

      {(serviceLabel || packageLabel || priceLabel) && (
        <div className="bg-white border border-[#E4DFD5] rounded-lg p-3 text-xs space-y-1">
          {serviceLabel && (
            <div className="text-[#263449]">
              <span className="font-semibold text-[#0B1426]">Service:</span> {serviceLabel}
            </div>
          )}
          {packageLabel && (
            <div className="text-[#263449]">
              <span className="font-semibold text-[#0B1426]">Option:</span> {packageLabel}
            </div>
          )}
          {priceLabel && (
            <div className="text-[#263449]">
              <span className="font-semibold text-[#0B1426]">Pricing:</span> {priceLabel}
            </div>
          )}
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#526176] flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-[#C49A36]" />
            <span>Message Preview</span>
          </span>
        </div>
        <pre
          ref={preRef}
          data-testid="prepared-whatsapp-text"
          className="bg-white border border-[#E4DFD5] rounded-lg p-3.5 text-xs text-[#0B1426] whitespace-pre-wrap break-words font-sans leading-relaxed max-h-60 overflow-y-auto"
        >
          {message}
        </pre>
      </div>

      <div className="flex flex-col sm:flex-row gap-2.5">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          data-testid="open-whatsapp-link"
          className="flex-1 py-2.5 px-4 bg-[#0B1426] hover:bg-[#172744] text-white text-xs font-semibold rounded-lg transition-colors inline-flex items-center justify-center gap-2 text-center"
        >
          <span>Open WhatsApp</span>
          <ExternalLink className="w-3.5 h-3.5 shrink-0" />
        </a>

        <button
          type="button"
          onClick={handleCopy}
          data-testid="copy-whatsapp-message-btn"
          className="flex-1 sm:flex-none py-2.5 px-4 bg-white hover:bg-[#EFECE5] text-[#0B1426] border border-[#0B1426] text-xs font-semibold rounded-lg transition-colors inline-flex items-center justify-center gap-2 cursor-pointer"
        >
          {copied === 'copied' ? (
            <>
              <Check className="w-3.5 h-3.5 text-[#C49A36] shrink-0" />
              <span>Message copied</span>
            </>
          ) : copied === 'selected' ? (
            <>
              <Copy className="w-3.5 h-3.5 text-[#C49A36] shrink-0" />
              <span>Text selected — press Ctrl+C</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 shrink-0" />
              <span>Copy message</span>
            </>
          )}
        </button>
      </div>

      <div className="pt-1 flex items-center justify-between gap-2 border-t border-[#E4DFD5]">
        <button
          type="button"
          onClick={onEdit}
          data-testid="edit-enquiry-details-btn"
          className="text-xs font-semibold text-[#526176] hover:text-[#0B1426] inline-flex items-center gap-1.5 py-1 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{editButtonLabel}</span>
        </button>
        <span className="text-[11px] text-[#526176]">
          You send the message in WhatsApp.
        </span>
      </div>
    </div>
  );
};
