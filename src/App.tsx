/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ServiceFinderWizard } from './components/ServiceFinderWizard';
import { EngagementModels } from './components/EngagementModels';
import { ControlCenterDashboard } from './components/ControlCenterDashboard';
import { ServicesCatalog } from './components/ServicesCatalog';
import { BusinessProblemsSection } from './components/BusinessProblemsSection';
import { ExampleSolutionsSection } from './components/ExampleSolutionsSection';
import { HowWeWork } from './components/HowWeWork';
import { SelectedResourcesSection } from './components/SelectedResourcesSection';
import { ProjectEnquirySection } from './components/ProjectEnquirySection';
import { GovernmentSchemesSection } from './components/GovernmentSchemesSection';
import { AISystemsWorkflow } from './components/AISystemsWorkflow';
import { ProjectConsultingTimeline } from './components/ProjectConsultingTimeline';
import { WhoWeHelp } from './components/WhoWeHelp';
import { WhyUnikorn360 } from './components/WhyUnikorn360';
import { Footer } from './components/Footer';
import { BusinessReviewModal } from './components/BusinessReviewModal';
import { QuoteModal } from './components/QuoteModal';
import { ServiceDetailModal } from './components/ServiceDetailModal';
import { MobileBottomBar } from './components/MobileBottomBar';
import { ServiceItem } from './types';
import { SERVICES_LIST } from './data/servicesData';
import { SOLUTIONS_DATA } from './data/solutionsData';
import { RESOURCE_GUIDES } from './data/resourcesData';
import { LEGACY_URL_REDIRECTS } from './data/seedData';
import { servicesDb } from './lib/supabase';

// Dynamic Services Architecture Reusable Pages
import { ServicesDirectoryPage } from './pages/ServicesDirectoryPage';
import { DivisionPage } from './pages/DivisionPage';
import { ServiceDetailPage } from './pages/ServiceDetailPage';
import { ProductsPage } from './pages/ProductsPage';
import { CreatorLandingPage } from './pages/creators/CreatorLandingPage';
import { CreatorApplyPage } from './pages/creators/CreatorApplyPage';
import { CreatorSuccessPage } from './pages/creators/CreatorSuccessPage';
import { AdminPage } from './pages/AdminPage';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';

// Other Dedicated SEO Pages
import { SolutionPage } from './components/SolutionPage';
import { GuidePage } from './components/GuidePage';
import { SolutionsHubPage } from './components/SolutionsHubPage';
import { ResourcesHubPage } from './components/ResourcesHubPage';
import { AboutPage } from './components/AboutPage';
import { ContactPage } from './components/ContactPage';

const KNOWN_DIVISIONS = new Set([
  'websites-software',
  'security-maintenance',
  'marketing-creator-campaigns',
  'ai-automation-business-systems',
  'research-business-strategy',
  'business-setup-documentation'
]);

export default function App() {
  // Current route pathname
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname || '/';
    }
    return '/';
  });

  // Modal states
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewModalInitialNeed, setReviewModalInitialNeed] = useState('');
  
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [selectedQuoteService, setSelectedQuoteService] = useState<ServiceItem | null>(null);

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedDetailService, setSelectedDetailService] = useState<ServiceItem | null>(null);

  const [selectedCategoryKey, setSelectedCategoryKey] = useState('bi-dashboards');

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Client-side router navigation
  const navigate = (path: string) => {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    if (normalizedPath !== window.location.pathname) {
      window.history.pushState({}, '', normalizedPath);
      setCurrentPath(normalizedPath);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Smooth scroll helper for homepage sections
  const handleScrollToSection = (sectionId: string) => {
    if (currentPath !== '/') {
      navigate('/');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    } else {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  // Trigger Review Modal with optional prefill context
  const handleOpenReviewModal = (prefill?: string) => {
    setReviewModalInitialNeed(prefill || 'General Systems & Project Enquiry');
    setReviewModalOpen(true);
  };

  // Trigger Quote Modal for a service object or title
  const handleOpenQuoteModal = (serviceOrTitle: ServiceItem | string) => {
    if (typeof serviceOrTitle === 'string') {
      const matched = SERVICES_LIST.find(s => s.title.toLowerCase() === serviceOrTitle.toLowerCase() || s.id === serviceOrTitle);
      if (matched) {
        setSelectedQuoteService(matched);
      } else {
        // Construct fallback service object
        setSelectedQuoteService({
          id: 'custom-scope',
          title: serviceOrTitle,
          subtitle: 'Professional Service Engagement',
          category: 'bi-dashboards',
          typicalTimeline: '3 to 7 working days',
          deliverables: ['Written Scope of Work', 'Itemized Commercial Proposal'],
          targetAudience: ['Business Promoters & Founders'],
          scopeList: ['Requirement Scrutiny', 'Implementation Roadmap'],
          description: `Custom scope discussion for ${serviceOrTitle}.`
        });
      }
    } else {
      setSelectedQuoteService(serviceOrTitle);
    }
    setQuoteModalOpen(true);
  };

  // Trigger Service Detail Quick Modal
  const handleOpenDetailModal = (service: ServiceItem) => {
    setSelectedDetailService(service);
    setDetailModalOpen(true);
  };

  // Resolve solution for /solutions/:slug
  const resolvedSolution = useMemo(() => {
    if (!currentPath.startsWith('/solutions/')) return null;
    const slug = currentPath.replace('/solutions/', '').replace(/\/$/, '');
    return SOLUTIONS_DATA[slug] || null;
  }, [currentPath]);

  // Resolve guide for /resources/:slug
  const resolvedGuide = useMemo(() => {
    if (!currentPath.startsWith('/resources/')) return null;
    const slug = currentPath.replace('/resources/', '').replace(/\/$/, '');
    return RESOURCE_GUIDES[slug] || null;
  }, [currentPath]);

  // Handle routing
  const renderCurrentView = () => {
    // 1. Homepage
    if (currentPath === '/' || currentPath === '') {
      return (
        <main>
          {/* Hero & clear value proposition */}
          <Hero
            onOpenReviewModal={() => handleOpenReviewModal('New Project Enquiry')}
            onScrollToSection={handleScrollToSection}
          />

          {/* Service Finder Wizard */}
          <ServiceFinderWizard
            onOpenReviewModal={handleOpenReviewModal}
            onOpenQuoteModal={handleOpenQuoteModal}
            onSelectService={handleOpenDetailModal}
          />

          {/* Six service categories */}
          <ServicesCatalog
            selectedCategoryKey={selectedCategoryKey}
            onOpenQuoteModal={handleOpenQuoteModal}
            onSelectServiceModal={handleOpenDetailModal}
          />

          {/* Business problems we help solve */}
          <BusinessProblemsSection
            onOpenReviewModal={handleOpenReviewModal}
          />

          {/* Example custom solutions */}
          <ExampleSolutionsSection
            onOpenReviewModal={(title) => handleOpenReviewModal(`Discussion: ${title}`)}
          />

          {/* Illustrative Dashboard Prototype */}
          <ControlCenterDashboard
            onOpenReviewModal={() => handleOpenReviewModal('Business Intelligence Dashboard Implementation')}
          />

          {/* How we work */}
          <HowWeWork
            onOpenReviewModal={() => handleOpenReviewModal('Project Discovery Call')}
          />

          {/* Broadened Engagement Models (VERIFY, PROTECT, GUARDIAN) */}
          <EngagementModels
            onOpenReviewModal={handleOpenReviewModal}
            onScrollToSection={handleScrollToSection}
          />

          {/* Selected resources */}
          <SelectedResourcesSection
            onNavigate={navigate}
          />

          {/* Regional Sectors Served */}
          <WhoWeHelp
            onOpenReviewModal={handleOpenReviewModal}
          />

          {/* Government Schemes & Subsidies */}
          <GovernmentSchemesSection
            onOpenReviewModal={handleOpenReviewModal}
          />

          {/* AI & Systems Workflow */}
          <AISystemsWorkflow
            onOpenReviewModal={handleOpenReviewModal}
          />

          {/* Project Consulting Timeline */}
          <ProjectConsultingTimeline
            onOpenReviewModal={handleOpenReviewModal}
          />

          {/* Why Unikorn360 */}
          <WhyUnikorn360
            onOpenReviewModal={() => handleOpenReviewModal('Strategic Business Systems Consultation')}
          />

          {/* Project enquiry */}
          <ProjectEnquirySection />
        </main>
      );
    }

    // Global Legacy URL Redirect Resolver (e.g. /build, /services/build, legacy service paths)
    const cleanPath = currentPath.toLowerCase().replace(/\/$/, '') || '/';
    const globalLegacyTarget = servicesDb.resolveLegacyUrl(cleanPath);
    if (globalLegacyTarget && globalLegacyTarget !== cleanPath) {
      const destRemainder = globalLegacyTarget.replace(/^\/services\//, '');
      const destParts = destRemainder.split('/');
      if (destParts.length === 2) {
        return (
          <ServiceDetailPage
            divisionSlug={destParts[0]}
            serviceSlug={destParts[1]}
            onNavigate={navigate}
            onOpenReviewModal={handleOpenReviewModal}
            onOpenQuoteModal={handleOpenQuoteModal}
          />
        );
      }
      if (destParts.length === 1) {
        return (
          <DivisionPage
            divisionSlug={destParts[0]}
            onNavigate={navigate}
            onOpenReviewModal={handleOpenReviewModal}
            onOpenQuoteModal={handleOpenQuoteModal}
          />
        );
      }
    }

    // 2. Services Main Directory: /services
    if (currentPath === '/services') {
      return (
        <ServicesDirectoryPage
          onNavigate={navigate}
          onOpenReviewModal={handleOpenReviewModal}
          onOpenQuoteModal={handleOpenQuoteModal}
        />
      );
    }

    // 3. Dynamic Services Architecture Routes: /services/*
    if (currentPath.startsWith('/services/')) {
      const remainder = currentPath.replace(/^\/services\//, '').replace(/\/$/, '');
      const parts = remainder.split('/');

      // Check legacy single-slug redirects or full service path redirects
      const directCheck = servicesDb.resolveLegacyUrl(currentPath) || servicesDb.resolveLegacyUrl(remainder) || (parts.length === 1 ? servicesDb.resolveLegacyUrl(parts[0]) : null);
      if (directCheck) {
        const destRemainder = directCheck.replace(/^\/services\//, '');
        const destParts = destRemainder.split('/');
        if (destParts.length === 2) {
          return (
            <ServiceDetailPage
              divisionSlug={destParts[0]}
              serviceSlug={destParts[1]}
              onNavigate={navigate}
              onOpenReviewModal={handleOpenReviewModal}
              onOpenQuoteModal={handleOpenQuoteModal}
            />
          );
        }
        if (destParts.length === 1) {
          return (
            <DivisionPage
              divisionSlug={destParts[0]}
              onNavigate={navigate}
              onOpenReviewModal={handleOpenReviewModal}
              onOpenQuoteModal={handleOpenQuoteModal}
            />
          );
        }
      }

      // Case A: /services/:division (Division Page)
      if (parts.length === 1) {
        return (
          <DivisionPage
            divisionSlug={parts[0]}
            onNavigate={navigate}
            onOpenReviewModal={handleOpenReviewModal}
            onOpenQuoteModal={handleOpenQuoteModal}
          />
        );
      }

      // Case B: /services/:division/:serviceSlug (Child Service Page)
      if (parts.length === 2) {
        return (
          <ServiceDetailPage
            divisionSlug={parts[0]}
            serviceSlug={parts[1]}
            onNavigate={navigate}
            onOpenReviewModal={handleOpenReviewModal}
            onOpenQuoteModal={handleOpenQuoteModal}
          />
        );
      }
    }

    // 4. Products: /products
    if (currentPath === '/products') {
      return (
        <ProductsPage
          onNavigate={navigate}
          onOpenReviewModal={handleOpenReviewModal}
        />
      );
    }

    // 5. Creator Network Routes
    // 5a. Application Wizard: /creators/apply
    if (currentPath === '/creators/apply') {
      return (
        <CreatorApplyPage
          onNavigate={navigate}
        />
      );
    }

    // 5b. Application Confirmation: /creators/success
    if (currentPath === '/creators/success') {
      return (
        <CreatorSuccessPage
          onNavigate={navigate}
        />
      );
    }

    // 5c. Creator Recruitment Landing Page: /creators & /creator-network
    if (currentPath === '/creators' || currentPath === '/creator-network') {
      return (
        <CreatorLandingPage
          onNavigate={navigate}
          onOpenReviewModal={handleOpenReviewModal}
        />
      );
    }

    // 6. Admin Portal Routes
    // 6a. Admin Login: /admin/login
    if (currentPath === '/admin/login') {
      return (
        <AdminLoginPage
          onNavigate={navigate}
        />
      );
    }

    // 6b. Admin Control Center: /admin
    if (currentPath === '/admin') {
      return (
        <AdminPage
          onNavigate={navigate}
        />
      );
    }

    // 7. Solutions Hub (/solutions)
    if (currentPath === '/solutions') {
      return (
        <SolutionsHubPage
          onNavigate={navigate}
          onOpenReviewModal={handleOpenReviewModal}
        />
      );
    }

    // 8. Individual Solution Page (/solutions/:slug)
    if (currentPath.startsWith('/solutions/') && resolvedSolution) {
      return (
        <SolutionPage
          solution={resolvedSolution}
          onNavigate={navigate}
          onOpenReviewModal={handleOpenReviewModal}
          onOpenQuoteModal={handleOpenQuoteModal}
        />
      );
    }

    // 9. Resources Hub (/resources)
    if (currentPath === '/resources') {
      return (
        <ResourcesHubPage
          onNavigate={navigate}
          onOpenReviewModal={handleOpenReviewModal}
        />
      );
    }

    // 10. Individual Resource Guide (/resources/:slug)
    if (currentPath.startsWith('/resources/') && resolvedGuide) {
      return (
        <GuidePage
          guide={resolvedGuide}
          onNavigate={navigate}
          onOpenReviewModal={handleOpenReviewModal}
          onOpenQuoteModal={handleOpenQuoteModal}
        />
      );
    }

    // 11. About Us (/about)
    if (currentPath === '/about') {
      return (
        <AboutPage
          onNavigate={navigate}
          onOpenReviewModal={() => handleOpenReviewModal('About Unikorn360 Position Review')}
        />
      );
    }

    // 12. Contact Us (/contact)
    if (currentPath === '/contact') {
      return (
        <ContactPage
          onNavigate={navigate}
        />
      );
    }

    // Fallback to Home if unknown route
    return (
      <main>
        <Hero
          onOpenReviewModal={() => handleOpenReviewModal()}
          onScrollToSection={handleScrollToSection}
        />
        <ServicesCatalog
          selectedCategoryKey={selectedCategoryKey}
          onOpenQuoteModal={handleOpenQuoteModal}
          onSelectServiceModal={handleOpenDetailModal}
        />
        <ProjectEnquirySection />
      </main>
    );
  };

  return (
    <div className="min-h-screen bg-[#F5F6F7] text-[#505B66] selection:bg-[#214E78] selection:text-white font-sans antialiased">
      {/* Primary Sticky Navigation */}
      <Navbar
        currentPath={currentPath}
        onNavigate={navigate}
        onOpenReviewModal={handleOpenReviewModal}
        onScrollToSection={handleScrollToSection}
        onSelectCategory={(cat) => setSelectedCategoryKey(cat)}
      />

      {/* Main View Router */}
      {renderCurrentView()}

      {/* Global Footer */}
      <Footer
        onNavigate={navigate}
        onOpenReviewModal={handleOpenReviewModal}
        onScrollToSection={handleScrollToSection}
        onSelectCategory={(cat) => {
          setSelectedCategoryKey(cat);
          handleScrollToSection('services');
        }}
      />

      {/* Persistent Mobile Bottom Action Bar */}
      <MobileBottomBar
        onOpenReviewModal={() => handleOpenReviewModal('Mobile Quick Inquiry')}
        onScrollToFinder={() => handleScrollToSection('service-finder')}
      />

      {/* Modals */}
      <BusinessReviewModal
        isOpen={reviewModalOpen}
        initialNeed={reviewModalInitialNeed}
        onClose={() => setReviewModalOpen(false)}
      />

      <QuoteModal
        isOpen={quoteModalOpen}
        service={selectedQuoteService}
        onClose={() => setQuoteModalOpen(false)}
      />

      <ServiceDetailModal
        isOpen={detailModalOpen}
        service={selectedDetailService}
        onClose={() => setDetailModalOpen(false)}
        onOpenQuoteModal={handleOpenQuoteModal}
      />
    </div>
  );
}
