/**
 * Accessibility utilities for WCAG 2.1 compliance
 */

/**
 * Announce message to screen readers
 */
export const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite'): void => {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

/**
 * Focus trap for modals and dialogs
 */
export class FocusTrap {
  private element: HTMLElement;
  private focusableElements: HTMLElement[];
  private firstFocusableElement: HTMLElement | null = null;
  private lastFocusableElement: HTMLElement | null = null;
  private previousActiveElement: HTMLElement | null = null;

  constructor(element: HTMLElement) {
    this.element = element;
    this.focusableElements = this.getFocusableElements();
    
    if (this.focusableElements.length > 0) {
      this.firstFocusableElement = this.focusableElements[0];
      this.lastFocusableElement = this.focusableElements[this.focusableElements.length - 1];
    }
  }

  private getFocusableElements(): HTMLElement[] {
    const selector = [
      'a[href]',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(', ');

    return Array.from(this.element.querySelectorAll(selector)) as HTMLElement[];
  }

  activate(): void {
    this.previousActiveElement = document.activeElement as HTMLElement;
    
    // Focus first element
    if (this.firstFocusableElement) {
      this.firstFocusableElement.focus();
    }

    // Add event listener for tab key
    this.element.addEventListener('keydown', this.handleKeyDown);
  }

  deactivate(): void {
    this.element.removeEventListener('keydown', this.handleKeyDown);
    
    // Restore focus
    if (this.previousActiveElement) {
      this.previousActiveElement.focus();
    }
  }

  private handleKeyDown = (event: KeyboardEvent): void => {
    if (event.key !== 'Tab') return;

    if (event.shiftKey) {
      // Shift + Tab
      if (document.activeElement === this.firstFocusableElement) {
        event.preventDefault();
        this.lastFocusableElement?.focus();
      }
    } else {
      // Tab
      if (document.activeElement === this.lastFocusableElement) {
        event.preventDefault();
        this.firstFocusableElement?.focus();
      }
    }
  };
}

/**
 * Skip to main content link
 */
export const createSkipLink = (): HTMLAnchorElement => {
  const skipLink = document.createElement('a');
  skipLink.href = '#main-content';
  skipLink.className = 'skip-link';
  skipLink.textContent = 'Skip to main content';
  skipLink.addEventListener('click', (e) => {
    e.preventDefault();
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.focus();
      mainContent.scrollIntoView();
    }
  });
  return skipLink;
};

/**
 * Check if element is visible to screen readers
 */
export const isVisibleToScreenReader = (element: HTMLElement): boolean => {
  return (
    element.getAttribute('aria-hidden') !== 'true' &&
    !element.hasAttribute('hidden') &&
    element.style.display !== 'none' &&
    element.style.visibility !== 'hidden'
  );
};

/**
 * Generate unique ID for accessibility
 */
let idCounter = 0;
export const generateA11yId = (prefix: string = 'a11y'): string => {
  idCounter++;
  return `${prefix}-${idCounter}-${Date.now()}`;
};

/**
 * Keyboard navigation helpers
 */
export const KeyboardKeys = {
  ENTER: 'Enter',
  SPACE: ' ',
  ESCAPE: 'Escape',
  TAB: 'Tab',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  HOME: 'Home',
  END: 'End',
  PAGE_UP: 'PageUp',
  PAGE_DOWN: 'PageDown',
};

/**
 * Handle keyboard navigation for lists
 */
export const handleListKeyboardNavigation = (
  event: React.KeyboardEvent,
  currentIndex: number,
  itemCount: number,
  onSelect: (index: number) => void
): void => {
  let newIndex = currentIndex;

  switch (event.key) {
    case KeyboardKeys.ARROW_UP:
      event.preventDefault();
      newIndex = currentIndex > 0 ? currentIndex - 1 : itemCount - 1;
      break;
    case KeyboardKeys.ARROW_DOWN:
      event.preventDefault();
      newIndex = currentIndex < itemCount - 1 ? currentIndex + 1 : 0;
      break;
    case KeyboardKeys.HOME:
      event.preventDefault();
      newIndex = 0;
      break;
    case KeyboardKeys.END:
      event.preventDefault();
      newIndex = itemCount - 1;
      break;
    case KeyboardKeys.ENTER:
    case KeyboardKeys.SPACE:
      event.preventDefault();
      onSelect(currentIndex);
      return;
  }

  if (newIndex !== currentIndex) {
    onSelect(newIndex);
  }
};

/**
 * Color contrast checker (WCAG AA compliance)
 */
export const checkColorContrast = (foreground: string, background: string): {
  ratio: number;
  passesAA: boolean;
  passesAAA: boolean;
} => {
  const getLuminance = (color: string): number => {
    // Convert hex to RGB
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;

    // Calculate relative luminance
    const [rs, gs, bs] = [r, g, b].map((c) => {
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  const l1 = getLuminance(foreground);
  const l2 = getLuminance(background);
  const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);

  return {
    ratio: Math.round(ratio * 100) / 100,
    passesAA: ratio >= 4.5, // WCAG AA for normal text
    passesAAA: ratio >= 7, // WCAG AAA for normal text
  };
};

/**
 * Format date for screen readers
 */
export const formatDateForScreenReader = (date: Date | string): string => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Format time for screen readers
 */
export const formatTimeForScreenReader = (date: Date | string): string => {
  const d = new Date(date);
  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

/**
 * Format currency for screen readers
 */
export const formatCurrencyForScreenReader = (amount: number, currency: string = 'USD'): string => {
  return `${amount.toLocaleString('en-US', {
    style: 'currency',
    currency,
  })} ${currency}`;
};

/**
 * Debounce function for search inputs (accessibility consideration)
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

