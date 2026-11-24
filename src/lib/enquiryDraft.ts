const ENQUIRY_DRAFT_STORAGE_KEY = 'unikorn360_buyer_enquiry_draft_v1';

export interface BuyerEnquiryDraft {
  name?: string;
  phone?: string;
  email?: string;
  businessName?: string;
  notes?: string;
  selectedPackagesByService?: Record<string, string>;
}

export function loadBuyerEnquiryDraft(): BuyerEnquiryDraft {
  if (typeof window === 'undefined' || !window.sessionStorage) {
    return {};
  }
  try {
    const raw = window.sessionStorage.getItem(ENQUIRY_DRAFT_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return {};
    return parsed as BuyerEnquiryDraft;
  } catch {
    return {};
  }
}

export function saveBuyerEnquiryDraft(patch: BuyerEnquiryDraft): void {
  if (typeof window === 'undefined' || !window.sessionStorage) {
    return;
  }
  try {
    const current = loadBuyerEnquiryDraft();
    const merged: BuyerEnquiryDraft = {
      ...current,
      ...patch,
      selectedPackagesByService: {
        ...(current.selectedPackagesByService || {}),
        ...(patch.selectedPackagesByService || {})
      }
    };
    window.sessionStorage.setItem(ENQUIRY_DRAFT_STORAGE_KEY, JSON.stringify(merged));
  } catch {
    // Ignore storage quota or restricted context errors
  }
}
