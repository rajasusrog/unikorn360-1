import React from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Home,
  Layers,
  Package,
  Compass,
  BookOpen,
  Phone,
  MessageSquare
} from 'lucide-react';
import { SEOHead } from '../components/SEOHead';

interface NotFoundPageProps {
  requestedPath?: string;
  onNavigate: (path: string) => void;
  onOpenReviewModal?: (prefill?: string) => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({
  requestedPath = '/',
  onNavigate,
  onOpenReviewModal
}) => {
  return (
    <main className="min-h-[70vh] bg-[#F5F6F7] text-[#505B66] py-16 px-4 sm:px-6 lg:px-8 flex items-center">
      <SEOHead
        title="Page Not Found | UNIKORN360 Business Intelligence"
        description="The requested page could not be found on UNIKORN360 Business Intelligence. Explore our services, software products, solutions, and resources."
        canonicalPath={requestedPath || '/'}
        robots="noindex, nofollow"
      />

      <div className="max-w-3xl mx-auto w-full bg-white border border-[#D8DEE5] rounded-2xl p-8 sm:p-12 shadow-sm text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#F5F6F7] border border-[#D8DEE5] rounded-full text-[11px] font-mono font-bold uppercase tracking-widest text-[#A57C35] mb-5">
          <AlertTriangle className="w-3.5 h-3.5 text-[#214E78]" />
          <span>HTTP 404 • Route Not Found</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#30363D] tracking-tight">
          Page Not Found
        </h1>

        <p className="mt-4 text-sm sm:text-base text-[#505B66] leading-relaxed max-w-xl mx-auto">
          The URL{' '}
          <code className="px-2 py-0.5 bg-[#F5F6F7] border border-[#D8DEE5] rounded text-xs font-mono text-[#214E78] break-all">
            {requestedPath}
          </code>{' '}
          does not match any active page on UNIKORN360 Business Intelligence.
        </p>

        {/* Primary Action */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('/');
            }}
            className="px-6 py-3 bg-[#214E78] hover:bg-[#173858] text-white text-xs font-bold uppercase tracking-wider rounded transition-colors inline-flex items-center gap-2 shadow-xs"
          >
            <Home className="w-4 h-4" />
            <span>Return to Homepage</span>
          </a>

          {onOpenReviewModal && (
            <button
              type="button"
              onClick={() => onOpenReviewModal(`Assistance finding page: ${requestedPath}`)}
              className="px-6 py-3 bg-[#F5F6F7] hover:bg-[#E9EDF0] text-[#30363D] border border-[#D8DEE5] text-xs font-bold uppercase tracking-wider rounded transition-colors inline-flex items-center gap-2 cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 text-[#214E78]" />
              <span>Contact Advisory Desk</span>
            </button>
          )}
        </div>

        {/* Helpful Internal Links */}
        <div className="mt-10 pt-8 border-t border-[#D8DEE5] text-left">
          <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#A57C35] mb-4 text-center">
            Explore UNIKORN360 Sections
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            <a
              href="/services"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('/services');
              }}
              className="p-3.5 bg-[#F5F6F7] hover:bg-white border border-[#D8DEE5] hover:border-[#214E78] rounded-lg transition-all flex items-center justify-between text-[#30363D] font-semibold"
            >
              <span className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#214E78]" />
                Services Directory
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-[#505B66]" />
            </a>

            <a
              href="/products"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('/products');
              }}
              className="p-3.5 bg-[#F5F6F7] hover:bg-white border border-[#D8DEE5] hover:border-[#214E78] rounded-lg transition-all flex items-center justify-between text-[#30363D] font-semibold"
            >
              <span className="flex items-center gap-2">
                <Package className="w-4 h-4 text-[#214E78]" />
                Software Products
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-[#505B66]" />
            </a>

            <a
              href="/solutions"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('/solutions');
              }}
              className="p-3.5 bg-[#F5F6F7] hover:bg-white border border-[#D8DEE5] hover:border-[#214E78] rounded-lg transition-all flex items-center justify-between text-[#30363D] font-semibold"
            >
              <span className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-[#214E78]" />
                Business Solutions
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-[#505B66]" />
            </a>

            <a
              href="/resources"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('/resources');
              }}
              className="p-3.5 bg-[#F5F6F7] hover:bg-white border border-[#D8DEE5] hover:border-[#214E78] rounded-lg transition-all flex items-center justify-between text-[#30363D] font-semibold"
            >
              <span className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#214E78]" />
                MSME Guides
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-[#505B66]" />
            </a>

            <a
              href="/creators"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('/creators');
              }}
              className="p-3.5 bg-[#F5F6F7] hover:bg-white border border-[#D8DEE5] hover:border-[#214E78] rounded-lg transition-all flex items-center justify-between text-[#30363D] font-semibold"
            >
              <span className="flex items-center gap-2">
                <ArrowRight className="w-4 h-4 text-[#A57C35]" />
                Creator Network
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-[#505B66]" />
            </a>

            <a
              href="/contact"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('/contact');
              }}
              className="p-3.5 bg-[#F5F6F7] hover:bg-white border border-[#D8DEE5] hover:border-[#214E78] rounded-lg transition-all flex items-center justify-between text-[#30363D] font-semibold"
            >
              <span className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#214E78]" />
                Contact Us
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-[#505B66]" />
            </a>
          </div>
        </div>
      </div>
    </main>
  );
};
