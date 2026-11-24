import React from 'react';
import { MessageSquare, CheckCircle2 } from 'lucide-react';

interface WhatsAppSubmitButtonProps {
  isPreparing?: boolean;
  disabled?: boolean;
  label?: string;
  preparedLabel?: string;
  subtext?: string;
  className?: string;
  type?: 'submit' | 'button';
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export const WhatsAppSubmitButton: React.FC<WhatsAppSubmitButtonProps> = ({
  isPreparing = false,
  disabled = false,
  label = 'Continue to WhatsApp',
  preparedLabel = 'Message prepared.',
  subtext = 'Direct handoff to Unikorn360 executive with pre-filled details',
  className = '',
  type = 'submit',
  onClick,
}) => {
  return (
    <div className="w-full">
      <button
        type={type}
        onClick={onClick}
        disabled={disabled || isPreparing}
        aria-live="polite"
        className={`group relative w-full flex items-center justify-center gap-3 px-6 py-3.5 
          bg-[#0B1426] hover:bg-[#172744] text-white text-xs uppercase tracking-[0.12em] font-semibold rounded-lg 
          border border-[#0B1426] hover:border-[#C49A36] 
          shadow-sm hover:shadow-md 
          transition-all duration-200 ease-out cursor-pointer
          hover:-translate-y-0.5 active:translate-y-0 
          disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none
          motion-reduce:transform-none motion-reduce:transition-none
          ${isPreparing ? 'bg-[#172744] border-[#C49A36] ring-2 ring-[#C49A36]/40 animate-pulse' : ''}
          ${className}`}
      >
        {isPreparing ? (
          <>
            <CheckCircle2 className="w-4 h-4 text-[#C49A36] shrink-0 animate-checkmark" />
            <span className="text-[#F6F5F1]">{preparedLabel}</span>
          </>
        ) : (
          <>
            <MessageSquare className="w-4 h-4 text-white/90 shrink-0 transition-transform duration-200 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            <span>{label}</span>
          </>
        )}
      </button>

      {subtext && (
        <p className="text-xs text-center text-[#526176] mt-2">
          {subtext}
        </p>
      )}
    </div>
  );
};
