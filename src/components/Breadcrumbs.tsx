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
    <nav aria-label="Breadcrumb" className="py-3 border-b border-[#E4DFD5] bg-[#F6F5F1]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ol className="flex items-center flex-wrap gap-2 text-xs text-[#526176]">
          <li className="flex items-center gap-1.5">
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('/');
              }}
              className="hover:text-[#0B1426] transition-colors flex items-center gap-1 text-[#526176]"
            >
              <Home className="w-3.5 h-3.5 text-[#C49A36]" />
              <span>Home</span>
            </a>
          </li>

          {items.map((item, idx) => {
            const isLast = idx === items.length - 1;
            return (
              <li key={idx} className="flex items-center gap-2">
                <ChevronRight className="w-3 h-3 text-[#E4DFD5] shrink-0" />
                {item.path && !isLast ? (
                  <a
                    href={item.path}
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate(item.path!);
                    }}
                    className="hover:text-[#0B1426] transition-colors text-[#526176]"
                  >
                    {item.label}
                  </a>
                ) : (
                  <span className="text-[#0B1426] font-semibold truncate max-w-xs sm:max-w-md" aria-current="page">
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
