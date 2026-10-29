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
  preparedLabel = 'Inquiry Prepared · Opening WhatsApp...',
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
          bg-[#214E78] hover:bg-[#173858] text-white text-xs uppercase tracking-[0.15em] font-bold rounded 
          border border-[#214E78] hover:border-[#A57C35] 
          shadow-md hover:shadow-lg hover:shadow-[#A57C35]/15 
          transition-all duration-200 ease-out cursor-pointer
          hover:-translate-y-0.5 active:translate-y-0 
          focus:outline-none focus:ring-2 focus:ring-[#214E78] focus:ring-offset-2
          disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none
          motion-reduce:transform-none motion-reduce:transition-none
          ${isPreparing ? 'bg-[#173858] border-[#A57C35] ring-2 ring-[#A57C35]/40 animate-pulse' : ''}
          ${className}`}
      >
        {isPreparing ? (
          <>
            <CheckCircle2 className="w-4 h-4 text-[#A57C35] shrink-0 animate-checkmark" />
            <span className="text-[#F5F6F7]">{preparedLabel}</span>
          </>
        ) : (
          <>
            <MessageSquare className="w-4 h-4 text-white/90 shrink-0 transition-transform duration-200 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            <span>{label}</span>
          </>
        )}
      </button>

      {subtext && (
        <p className="text-[11px] text-center text-[#505B66] mt-2 tracking-wide">
          {subtext}
        </p>
      )}
    </div>
  );
};
