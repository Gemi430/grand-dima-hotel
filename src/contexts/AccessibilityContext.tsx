import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

/**
 * Accessibility preferences
 */
export interface AccessibilityPreferences {
  highContrast: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  reducedMotion: boolean;
  keyboardNavigation: boolean;
  screenReaderOptimized: boolean;
}

/**
 * Accessibility context interface
 */
interface AccessibilityContextType {
  preferences: AccessibilityPreferences;
  updatePreferences: (preferences: Partial<AccessibilityPreferences>) => void;
  resetPreferences: () => void;
}

/**
 * Default preferences
 */
const defaultPreferences: AccessibilityPreferences = {
  highContrast: false,
  fontSize: 'medium',
  reducedMotion: false,
  keyboardNavigation: true,
  screenReaderOptimized: false,
};

/**
 * Accessibility context
 */
const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

/**
 * Accessibility provider props
 */
interface AccessibilityProviderProps {
  children: ReactNode;
}

/**
 * Accessibility provider component
 */
export const AccessibilityProvider: React.FC<AccessibilityProviderProps> = ({ children }) => {
  const [preferences, setPreferences] = useState<AccessibilityPreferences>(() => {
    // Load from localStorage
    const saved = localStorage.getItem('accessibility-preferences');
    if (saved) {
      try {
        return { ...defaultPreferences, ...JSON.parse(saved) };
      } catch {
        return defaultPreferences;
      }
    }

    // Check system preferences
    const systemPreferences: Partial<AccessibilityPreferences> = {};

    // Check for reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      systemPreferences.reducedMotion = true;
    }

    // Check for high contrast preference
    if (window.matchMedia('(prefers-contrast: high)').matches) {
      systemPreferences.highContrast = true;
    }

    return { ...defaultPreferences, ...systemPreferences };
  });

  /**
   * Update preferences
   */
  const updatePreferences = (newPreferences: Partial<AccessibilityPreferences>) => {
    setPreferences((prev) => {
      const updated = { ...prev, ...newPreferences };
      localStorage.setItem('accessibility-preferences', JSON.stringify(updated));
      return updated;
    });
  };

  /**
   * Reset preferences to default
   */
  const resetPreferences = () => {
    setPreferences(defaultPreferences);
    localStorage.removeItem('accessibility-preferences');
  };

  /**
   * Apply preferences to document
   */
  useEffect(() => {
    const root = document.documentElement;

    // High contrast mode
    if (preferences.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Font size
    root.classList.remove('font-small', 'font-medium', 'font-large', 'font-extra-large');
    root.classList.add(`font-${preferences.fontSize}`);

    // Reduced motion
    if (preferences.reducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }

    // Keyboard navigation
    if (preferences.keyboardNavigation) {
      root.classList.add('keyboard-navigation');
    } else {
      root.classList.remove('keyboard-navigation');
    }

    // Screen reader optimized
    if (preferences.screenReaderOptimized) {
      root.classList.add('screen-reader-optimized');
    } else {
      root.classList.remove('screen-reader-optimized');
    }
  }, [preferences]);

  /**
   * Listen for system preference changes
   */
  useEffect(() => {
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const highContrastQuery = window.matchMedia('(prefers-contrast: high)');

    const handleReducedMotionChange = (e: MediaQueryListEvent) => {
      updatePreferences({ reducedMotion: e.matches });
    };

    const handleHighContrastChange = (e: MediaQueryListEvent) => {
      updatePreferences({ highContrast: e.matches });
    };

    reducedMotionQuery.addEventListener('change', handleReducedMotionChange);
    highContrastQuery.addEventListener('change', handleHighContrastChange);

    return () => {
      reducedMotionQuery.removeEventListener('change', handleReducedMotionChange);
      highContrastQuery.removeEventListener('change', handleHighContrastChange);
    };
  }, []);

  return (
    <AccessibilityContext.Provider value={{ preferences, updatePreferences, resetPreferences }}>
      {children}
    </AccessibilityContext.Provider>
  );
};

/**
 * Hook to use accessibility context
 */
export const useAccessibility = (): AccessibilityContextType => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
};

