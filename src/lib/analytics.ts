// Google Analytics 4 event tracking utility

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

type GAEventParams = {
  [key: string]: string | number | boolean | undefined;
};

export const trackEvent = (eventName: string, params?: GAEventParams) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, params);
    console.log('[GA4] Event tracked:', eventName, params);
  }
};

// Auth events
export const trackSignUp = (method: 'email' | 'google') => {
  trackEvent('sign_up', { method });
};

export const trackLogin = (method: 'email' | 'google') => {
  trackEvent('login', { method });
};

// Prayer events
export const trackPrayerCreated = (themeId: string, themeName: string, isAnonymous: boolean) => {
  trackEvent('prayer_created', {
    theme_id: themeId,
    theme_name: themeName,
    is_anonymous: isAnonymous,
  });
};

export const trackPrayerInteraction = (prayerId: string, action: 'pray' | 'share') => {
  trackEvent('prayer_interaction', {
    prayer_id: prayerId,
    action,
  });
};

// Donation events
export const trackDonationStart = (amount: number, type: 'one-time' | 'monthly') => {
  trackEvent('begin_checkout', {
    currency: 'BRL',
    value: amount,
    donation_type: type,
  });
};

export const trackDonationComplete = (amount: number, type: 'one-time' | 'monthly') => {
  trackEvent('purchase', {
    currency: 'BRL',
    value: amount,
    donation_type: type,
    transaction_id: `donation_${Date.now()}`,
  });
};

export const trackPixCopy = () => {
  trackEvent('pix_copy', {
    method: 'pix',
  });
};

// Navigation events
export const trackPageView = (pagePath: string, pageTitle: string) => {
  trackEvent('page_view', {
    page_path: pagePath,
    page_title: pageTitle,
  });
};

// Button click events
export const trackButtonClick = (buttonName: string, location?: string) => {
  trackEvent('button_click', {
    button_name: buttonName,
    location,
  });
};
