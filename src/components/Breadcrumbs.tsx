import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  onNavigate: (path: string) => void;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, onNavigate }) => {
  return (
    <nav aria-label="Breadcrumb" className="py-3 border-b border-[#D8DEE5] bg-[#F5F6F7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ol className="flex items-center flex-wrap gap-2 text-xs text-[#505B66]">
          <li className="flex items-center gap-1.5">
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('/');
              }}
              className="hover:text-[#214E78] transition-colors flex items-center gap-1 text-[#505B66]"
            >
              <Home className="w-3.5 h-3.5 text-[#214E78]" />
              <span>Home</span>
            </a>
          </li>

          {items.map((item, idx) => {
            const isLast = idx === items.length - 1;
            return (
              <li key={idx} className="flex items-center gap-2">
                <ChevronRight className="w-3 h-3 text-[#D8DEE5] shrink-0" />
                {item.path && !isLast ? (
                  <a
                    href={item.path}
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate(item.path!);
                    }}
                    className="hover:text-[#214E78] transition-colors text-[#505B66]"
                  >
                    {item.label}
                  </a>
                ) : (
                  <span className="text-[#30363D] font-semibold truncate max-w-xs sm:max-w-md" aria-current="page">
                    {item.label}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
};
