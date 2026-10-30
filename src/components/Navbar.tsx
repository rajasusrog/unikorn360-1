import React, { useState, useRef, useEffect } from 'react';
import { 
  Shield, 
  ChevronDown, 
  Phone, 
  MessageSquare, 
  Menu, 
  X, 
  ArrowRight, 
  CheckCircle2,
  BookOpen,
  Layers,
  Sparkles,
  Briefcase,
  Code2,
  ShieldCheck,
  TrendingUp,
  Workflow,
  BarChart3,
  LifeBuoy,
  GraduationCap
} from 'lucide-react';
import { BUSINESS_INFO } from '../data/servicesData';
import { SOLUTIONS_DATA } from '../data/solutionsData';
import { UNIKORN_FOUR_PRODUCTS } from '../data/productsData';
import { ServiceDivision } from '../types/database';
import { servicesDb } from '../lib/supabase';

interface NavbarProps {
  currentPath?: string;
  onNavigate: (path: string) => void;
  onOpenReviewModal: (prefill?: string) => void;
  onScrollToSection: (sectionId: string) => void;
  onSelectCategory?: (category: string) => void;
}

type ActiveDropdown = 'services' | 'products' | 'solutions' | null;

const DIVISION_ICONS: Record<string, React.ElementType> = {
  'websites-software': Code2,
  'security-maintenance': ShieldCheck,
  'marketing-creator-campaigns': Sparkles,
  'ai-automation-business-systems': Workflow,
  'research-business-strategy': BarChart3,
  'business-setup-documentation': LifeBuoy
};

export const Navbar: React.FC<NavbarProps> = ({ 
  currentPath = '/',
  onNavigate,
  onOpenReviewModal, 
  onScrollToSection,
  onSelectCategory 
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<ActiveDropdown>(null);
  const [divisions, setDivisions] = useState<ServiceDivision[]>([]);
  const navRef = useRef<HTMLElement>(null);

  // Fetch published divisions and counts from Supabase
  useEffect(() => {
    async function loadDivCounts() {
      try {
        const liveDivs = await servicesDb.getDivisions();
        setDivisions(liveDivs);
      } catch (e) {
        console.error('Failed to load published divisions in Navbar:', e);
      }
    }
    loadDivCounts();
  }, []);

  // Close dropdowns on outside click or Escape key
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveDropdown(null);
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleNav = (path: string, sectionId?: string) => {
    setMobileMenuOpen(false);
    setActiveDropdown(null);

    if (sectionId) {
      if (currentPath === '/') {
        onScrollToSection(sectionId);
      } else {
        onNavigate('/');
        setTimeout(() => {
          onScrollToSection(sectionId);
        }, 150);
      }
    } else {
      onNavigate(path);
    }
  };

  const toggleDropdown = (menu: 'services' | 'products' | 'solutions') => {
    setActiveDropdown((prev) => (prev === menu ? null : menu));
  };

  const closeDropdowns = () => {
    setActiveDropdown(null);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#D8DEE5] bg-white/95 backdrop-blur-md">
      {/* Top micro-bar */}
      <div className="hidden lg:flex items-center justify-between px-6 py-2 border-b border-[#D8DEE5] text-[11px] text-[#505B66] bg-[#F5F6F7]">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-2 text-[#A57C35] uppercase tracking-[0.15em] font-semibold text-[10px]">
            <span className="h-[2px] w-3 bg-[#A57C35]"></span>
            Business &amp; Technology Partner
          </span>
          <span className="text-[#D8DEE5]">|</span>
          <span className="tracking-wide">Remote Consultations Available</span>
          <span className="text-[#D8DEE5]">|</span>
          <span className="font-mono text-[10px] text-[#505B66]">GSTIN: {BUSINESS_INFO.gstin}</span>
        </div>
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-1.5 text-[#505B66] tracking-wide">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#214E78]" />
            First Assessment Meeting at No Cost
          </span>
          <span className="text-[#D8DEE5]">|</span>
          <a 
            href={`tel:${BUSINESS_INFO.phoneRaw}`} 
            className="flex items-center gap-1.5 text-[#214E78] hover:text-[#173858] transition-colors uppercase tracking-[0.1em] text-[10px] font-bold"
          >
            <Phone className="w-3 h-3 text-[#214E78]" />
            Advisory Desk: {BUSINESS_INFO.phone}
          </a>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <button 
          onClick={() => handleNav('/')}
          className="flex items-center gap-3 group text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#214E78] rounded p-1"
          id="nav-brand-logo"
          aria-label="Unikorn360 Home"
        >
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white border border-[#D8DEE5] rounded-xl flex items-center justify-center p-0.5 group-hover:border-[#A57C35] transition-all relative overflow-hidden shadow-sm shrink-0">
            <img 
              src="/assets/aistudio/ChatGPT_Image_Oct_30__2026__06_57_30_AM_a8896c5c.png" 
              alt="UNIKORN360 Logo" 
              className="w-full h-full object-contain group-hover:scale-105 transition-transform"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl font-bold tracking-[0.15em] text-[#30363D] uppercase font-serif">
                UNIKORN<span className="text-[#A57C35] font-semibold">360</span>
              </span>
              <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 bg-[#E9EDF0] text-[#214E78] border border-[#D8DEE5] tracking-[0.2em] rounded">
                BI
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-[#505B66] uppercase tracking-[0.15em] font-medium mt-0.5">
              Business Intelligence &amp; Systems
            </p>
          </div>
        </button>

        {/* Desktop Navigation: Home | Services | Products | Solutions | How We Work | Creator Network | Resources | About | Contact */}
        <nav ref={navRef} className="hidden lg:flex items-center gap-1" aria-label="Main Navigation">
          <button
            onClick={() => handleNav('/')}
            onMouseEnter={closeDropdowns}
            className={`px-2.5 py-2 text-xs uppercase tracking-[0.15em] transition-colors font-semibold cursor-pointer rounded focus:outline-none focus:ring-2 focus:ring-[#214E78] ${
              currentPath === '/' ? 'text-[#214E78]' : 'text-[#505B66] hover:text-[#214E78]'
            }`}
          >
            Home
          </button>

          {/* Services: Real Link to /services + Accessible Dropdown Toggle */}
          <div 
            className="relative flex items-center"
            onMouseEnter={() => setActiveDropdown('services')}
            onMouseLeave={() => {
              if (activeDropdown === 'services') setActiveDropdown(null);
            }}
          >
            {/* Real Link to /services */}
            <a
              href="/services"
              onClick={(e) => {
                e.preventDefault();
                handleNav('/services');
              }}
              className={`pl-2.5 pr-1 py-2 text-xs uppercase tracking-[0.15em] transition-colors font-semibold cursor-pointer rounded-l focus:outline-none focus:ring-2 focus:ring-[#214E78] ${
                currentPath.startsWith('/services') ? 'text-[#214E78]' : 'text-[#505B66] hover:text-[#214E78]'
              }`}
            >
              Services
            </a>

            {/* Separate accessible toggle button for division menu */}
            <button
              type="button"
              onClick={() => toggleDropdown('services')}
              aria-expanded={activeDropdown === 'services'}
              aria-haspopup="true"
              aria-label="Toggle Services Division Menu"
              className={`p-1.5 mr-1 text-xs transition-colors rounded-r cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#214E78] ${
                activeDropdown === 'services' ? 'text-[#214E78]' : 'text-[#505B66] hover:text-[#214E78]'
              }`}
            >
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeDropdown === 'services' ? 'rotate-180 text-[#214E78]' : 'text-[#505B66]'}`} />
            </button>

            {/* 6 Divisions Dropdown Menu */}
            {activeDropdown === 'services' && (
              <div 
                className="absolute top-full left-0 mt-1 w-96 bg-white border border-[#D8DEE5] rounded-xl shadow-xl p-2.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
              >
                <div className="px-3 py-2 border-b border-[#D8DEE5] mb-2 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-[#A57C35] uppercase tracking-[0.2em] block">
                      Service Architecture
                    </span>
                    <span className="text-xs font-bold text-[#30363D]">
                      6 Specialized Divisions
                    </span>
                  </div>
                  <a
                    href="/services"
                    onClick={(e) => {
                      e.preventDefault();
                      handleNav('/services');
                    }}
                    className="text-[10px] text-[#214E78] hover:underline uppercase tracking-wider font-bold"
                  >
                    Directory →
                  </a>
                </div>

                <div className="grid grid-cols-1 gap-1">
                  {divisions.map((div) => {
                    const IconComp = DIVISION_ICONS[div.slug] || Briefcase;
                    const count = div.published_service_count || 0;

                    return (
                      <button
                        key={div.id}
                        onClick={() => handleNav(`/services/${div.slug}`)}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#F5F6F7] transition-colors flex items-center justify-between group cursor-pointer border border-transparent hover:border-[#D8DEE5]"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded bg-[#F5F6F7] group-hover:bg-[#214E78] text-[#214E78] group-hover:text-white flex items-center justify-center transition-colors">
                            <IconComp className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-[#30363D] group-hover:text-[#214E78] transition-colors">
                              {div.name}
                            </p>
                            <p className="text-[10px] text-[#505B66] line-clamp-1">
                              {div.short_description}
                            </p>
                          </div>
                        </div>
                        <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-[#F5F6F7] text-[#505B66] border border-[#D8DEE5]">
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Products: Real Link to /products + Accessible Dropdown Toggle */}
          <div
            className="relative flex items-center"
            onMouseEnter={() => setActiveDropdown('products')}
            onMouseLeave={() => {
              if (activeDropdown === 'products') setActiveDropdown(null);
            }}
          >
            <a
              href="/products"
              onClick={(e) => {
                e.preventDefault();
                handleNav('/products');
              }}
              className={`pl-2.5 pr-1 py-2 text-xs uppercase tracking-[0.15em] transition-colors font-semibold cursor-pointer rounded-l focus:outline-none focus:ring-2 focus:ring-[#214E78] ${
                currentPath.startsWith('/products') ? 'text-[#214E78]' : 'text-[#505B66] hover:text-[#214E78]'
              }`}
            >
              Products
            </a>

            <button
              type="button"
              onClick={() => toggleDropdown('products')}
              aria-expanded={activeDropdown === 'products'}
              aria-haspopup="true"
              aria-label="Toggle Products Menu"
              className={`p-1.5 mr-1 text-xs transition-colors rounded-r cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#214E78] ${
                activeDropdown === 'products' ? 'text-[#214E78]' : 'text-[#505B66] hover:text-[#214E78]'
              }`}
            >
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform ${
                  activeDropdown === 'products' ? 'rotate-180 text-[#214E78]' : 'text-[#505B66]'
                }`}
              />
            </button>

            {activeDropdown === 'products' && (
              <div
                className="absolute top-full left-0 mt-1 w-80 bg-white border border-[#D8DEE5] rounded-xl shadow-xl p-2.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
              >
                <div className="px-3 py-2 border-b border-[#D8DEE5] mb-1.5 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-[#A57C35] uppercase tracking-[0.2em] block">
                      UNIKORN360 Suite
                    </span>
                    <span className="text-xs font-bold text-[#30363D]">
                      Software Products
                    </span>
                  </div>
                  <a
                    href="/products"
                    onClick={(e) => {
                      e.preventDefault();
                      handleNav('/products');
                    }}
                    className="text-[10px] text-[#214E78] hover:underline uppercase tracking-wider font-bold"
                  >
                    All Products →
                  </a>
                </div>

                <div className="grid grid-cols-1 gap-1">
                  <a
                    href="/products"
                    onClick={(e) => {
                      e.preventDefault();
                      handleNav('/products');
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#F5F6F7] transition-colors flex items-center justify-between group cursor-pointer border border-transparent hover:border-[#D8DEE5]"
                  >
                    <span className="text-xs font-bold text-[#214E78]">
                      All Products
                    </span>
                    <span className="text-[10px] text-[#505B66]">
                      /products
                    </span>
                  </a>

                  {UNIKORN_FOUR_PRODUCTS.map((prod) => (
                    <a
                      key={prod.slug}
                      href={prod.path}
                      onClick={(e) => {
                        e.preventDefault();
                        handleNav(prod.path);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#F5F6F7] transition-colors flex items-center justify-between group cursor-pointer border border-transparent hover:border-[#D8DEE5]"
                    >
                      <div>
                        <p className="text-xs font-semibold text-[#30363D] group-hover:text-[#214E78] transition-colors">
                          {prod.name}
                        </p>
                        <p className="text-[10px] text-[#505B66] line-clamp-1">
                          {prod.categoryLabel}
                        </p>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-[#505B66] group-hover:text-[#214E78] shrink-0" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Solutions Dropdown */}
          <div 
            className="relative"
            onMouseEnter={() => setActiveDropdown('solutions')}
            onMouseLeave={() => {
              if (activeDropdown === 'solutions') setActiveDropdown(null);
            }}
          >
            <button
              onClick={() => toggleDropdown('solutions')}
              aria-expanded={activeDropdown === 'solutions'}
              aria-haspopup="true"
              className={`flex items-center gap-1 px-2.5 py-2 text-xs uppercase tracking-[0.15em] transition-colors font-semibold cursor-pointer rounded focus:outline-none focus:ring-2 focus:ring-[#214E78] ${
                currentPath.startsWith('/solutions') || activeDropdown === 'solutions' ? 'text-[#214E78]' : 'text-[#505B66] hover:text-[#214E78]'
              }`}
            >
              Solutions
              <ChevronDown className={`w-3 h-3 transition-transform ${activeDropdown === 'solutions' ? 'rotate-180 text-[#214E78]' : 'text-[#505B66]'}`} />
            </button>

            {activeDropdown === 'solutions' && (
              <div 
                className="absolute top-full left-0 mt-1 w-84 bg-white border border-[#D8DEE5] rounded-xl shadow-xl p-2.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
              >
                <div className="px-2.5 py-1.5 border-b border-[#D8DEE5] mb-1 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#A57C35] uppercase tracking-[0.2em]">
                    Integrated Pathways
                  </span>
                  <a
                    href="/solutions"
                    onClick={(e) => {
                      e.preventDefault();
                      handleNav('/solutions');
                    }}
                    className="text-[10px] text-[#214E78] hover:underline uppercase tracking-wider font-semibold"
                  >
                    Overview →
                  </a>
                </div>

                {Object.values(SOLUTIONS_DATA).map((sol) => (
                  <button
                    key={sol.slug}
                    onClick={() => handleNav(`/solutions/${sol.slug}`)}
                    className="w-full text-left p-2 rounded-lg hover:bg-[#F5F6F7] transition-colors group border border-transparent hover:border-[#D8DEE5] cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <span className="text-xs font-semibold text-[#30363D] group-hover:text-[#214E78] transition-colors block">
                        {sol.shortTitle}
                      </span>
                      <span className="text-[10px] text-[#505B66] line-clamp-1">
                        {sol.subtitle}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* How We Work */}
          <button
            onClick={() => handleNav('/', 'how-we-work')}
            onMouseEnter={closeDropdowns}
            className="px-2.5 py-2 text-xs uppercase tracking-[0.15em] transition-colors font-semibold text-[#505B66] hover:text-[#214E78] cursor-pointer rounded focus:outline-none focus:ring-2 focus:ring-[#214E78]"
          >
            How We Work
          </button>

          {/* Creator Network Link */}
          <button
            onClick={() => handleNav('/creators')}
            onMouseEnter={closeDropdowns}
            className={`px-2.5 py-2 text-xs uppercase tracking-[0.15em] transition-colors font-semibold cursor-pointer rounded focus:outline-none focus:ring-2 focus:ring-[#214E78] flex items-center gap-1 ${
              currentPath.startsWith('/creators') || currentPath === '/creator-network' ? 'text-[#214E78]' : 'text-[#505B66] hover:text-[#214E78]'
            }`}
          >
            <Sparkles className="w-3 h-3 text-[#A57C35]" />
            <span>Creators</span>
          </button>

          {/* Resources */}
          <button
            onClick={() => handleNav('/resources')}
            onMouseEnter={closeDropdowns}
            className={`flex items-center gap-1 px-2.5 py-2 text-xs uppercase tracking-[0.15em] transition-colors font-semibold cursor-pointer rounded focus:outline-none focus:ring-2 focus:ring-[#214E78] ${
              currentPath.startsWith('/resources') ? 'text-[#214E78]' : 'text-[#505B66] hover:text-[#214E78]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-[#214E78]" />
            <span>Resources</span>
          </button>

          {/* About */}
          <button
            onClick={() => handleNav('/about')}
            onMouseEnter={closeDropdowns}
            className={`px-2.5 py-2 text-xs uppercase tracking-[0.15em] transition-colors font-semibold cursor-pointer rounded focus:outline-none focus:ring-2 focus:ring-[#214E78] ${
              currentPath === '/about' ? 'text-[#214E78]' : 'text-[#505B66] hover:text-[#214E78]'
            }`}
          >
            About
          </button>

          {/* Contact */}
          <button
            onClick={() => handleNav('/contact')}
            onMouseEnter={closeDropdowns}
            className={`px-2.5 py-2 text-xs uppercase tracking-[0.15em] transition-colors font-semibold cursor-pointer rounded focus:outline-none focus:ring-2 focus:ring-[#214E78] ${
              currentPath === '/contact' ? 'text-[#214E78]' : 'text-[#505B66] hover:text-[#214E78]'
            }`}
          >
            Contact
          </button>
        </nav>

        {/* Primary Action Button: "Discuss Your Project" */}
        <div className="hidden lg:flex items-center gap-3">
          <button
            onClick={() => onOpenReviewModal('General Project Discussion')}
            id="nav-cta-project"
            className="px-5 py-2.5 bg-[#214E78] hover:bg-[#173858] text-white text-[11px] uppercase tracking-[0.15em] font-bold rounded shadow transition-all flex items-center gap-2 cursor-pointer active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#214E78] focus:ring-offset-2"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Discuss Your Project</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Mobile menu trigger */}
        <div className="flex lg:hidden items-center gap-2">
          <button
            onClick={() => onOpenReviewModal('Mobile Quick Inquiry')}
            className="px-3 py-2 text-[10px] uppercase tracking-[0.1em] font-bold bg-[#214E78] text-white rounded shadow"
          >
            Discuss Project
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[#505B66] hover:text-[#30363D] border border-[#D8DEE5] rounded bg-[#F5F6F7]"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-[#D8DEE5] bg-white px-4 py-6 space-y-4 max-h-[85vh] overflow-y-auto shadow-lg">
          <div className="grid gap-1.5 text-xs font-medium">
            <button
              onClick={() => handleNav('/')}
              className="text-left py-2 px-3 rounded hover:bg-[#F5F6F7] text-[#30363D]"
            >
              Home
            </button>
            <button
              onClick={() => handleNav('/services')}
              className="text-left py-2 px-3 rounded hover:bg-[#F5F6F7] text-[#214E78] font-bold flex items-center justify-between"
            >
              <span>Services (6 Divisions)</span>
              <span className="text-[10px] bg-[#E9EDF0] px-1.5 py-0.5 rounded">All Directory</span>
            </button>
            
            {/* Division Sublinks in Mobile */}
            <div className="pl-4 pr-2 py-1 grid grid-cols-2 gap-1 border-l-2 border-[#214E78]/20 my-1">
              {divisions.map((d) => (
                <button
                  key={d.id}
                  onClick={() => handleNav(`/services/${d.slug}`)}
                  className="text-left py-1 text-[11px] text-[#505B66] hover:text-[#214E78]"
                >
                  • {d.name}
                </button>
              ))}
            </div>

            <a
              href="/products"
              onClick={(e) => {
                e.preventDefault();
                handleNav('/products');
              }}
              className="text-left py-2 px-3 rounded hover:bg-[#F5F6F7] text-[#214E78] font-bold flex items-center justify-between"
            >
              <span>Products</span>
              <span className="text-[10px] text-[#505B66]">All Products</span>
            </a>

            {/* Product Sublinks in Mobile */}
            <div className="pl-4 pr-2 py-1 grid grid-cols-2 gap-1 my-1">
              <a
                href="/products"
                onClick={(e) => {
                  e.preventDefault();
                  handleNav('/products');
                }}
                className="text-left py-1 text-[11px] font-semibold text-[#214E78] hover:underline"
              >
                • All Products
              </a>
              {UNIKORN_FOUR_PRODUCTS.map((prod) => (
                <a
                  key={prod.slug}
                  href={prod.path}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNav(prod.path);
                  }}
                  className="text-left py-1 text-[11px] text-[#505B66] hover:text-[#214E78]"
                >
                  • {prod.name}
                </a>
              ))}
            </div>
            <button
              onClick={() => handleNav('/solutions')}
              className="text-left py-2 px-3 rounded hover:bg-[#F5F6F7] text-[#30363D]"
            >
              Business Solutions
            </button>
            <button
              onClick={() => handleNav('/', 'how-we-work')}
              className="text-left py-2 px-3 rounded hover:bg-[#F5F6F7] text-[#30363D]"
            >
              How We Work
            </button>
            <button
              onClick={() => handleNav('/creators')}
              className="text-left py-2 px-3 rounded hover:bg-[#F5F6F7] text-[#A57C35] font-semibold"
            >
              Creator Network (Join as Creator)
            </button>
            <button
              onClick={() => handleNav('/resources')}
              className="text-left py-2 px-3 rounded hover:bg-[#F5F6F7] text-[#505B66]"
            >
              Resources &amp; Practical Guides
            </button>
            <button
              onClick={() => handleNav('/about')}
              className="text-left py-2 px-3 rounded hover:bg-[#F5F6F7] text-[#30363D]"
            >
              About Unikorn360
            </button>
            <button
              onClick={() => handleNav('/contact')}
              className="text-left py-2 px-3 rounded hover:bg-[#F5F6F7] text-[#30363D]"
            >
              Contact Advisory Desk
            </button>
            <button
              onClick={() => handleNav('/admin')}
              className="text-left py-2 px-3 rounded hover:bg-[#F5F6F7] text-[#505B66] text-[11px]"
            >
              Admin Desk (Restricted)
            </button>
          </div>

          <div className="pt-4 border-t border-[#D8DEE5] space-y-2 text-xs">
            <a
              href={`tel:${BUSINESS_INFO.phoneRaw}`}
              className="flex items-center gap-2 text-[#214E78] font-bold py-1"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call: {BUSINESS_INFO.phone}</span>
            </a>
            <p className="text-[11px] text-[#505B66]">
              Registered Office: VK Complex, Vaniyambadi, Tamil Nadu
            </p>
          </div>
        </div>
      )}
    </header>
  );
};
