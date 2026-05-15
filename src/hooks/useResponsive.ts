import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

/**
 * Custom hook for responsive design utilities
 */
export function useResponsive() {
  const theme = useTheme();

  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const isLargeDesktop = useMediaQuery(theme.breakpoints.up('lg'));
  const isExtraLarge = useMediaQuery(theme.breakpoints.up('xl'));

  // Touch device detection
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  // Orientation detection
  const isPortrait = useMediaQuery('(orientation: portrait)');
  const isLandscape = useMediaQuery('(orientation: landscape)');

  // Specific breakpoint checks
  const isXs = useMediaQuery(theme.breakpoints.only('xs'));
  const isSm = useMediaQuery(theme.breakpoints.only('sm'));
  const isMd = useMediaQuery(theme.breakpoints.only('md'));
  const isLg = useMediaQuery(theme.breakpoints.only('lg'));
  const isXl = useMediaQuery(theme.breakpoints.only('xl'));

  return {
    // Device types
    isMobile,
    isTablet,
    isDesktop,
    isLargeDesktop,
    isExtraLarge,
    isTouchDevice,

    // Orientation
    isPortrait,
    isLandscape,

    // Specific breakpoints
    isXs,
    isSm,
    isMd,
    isLg,
    isXl,

    // Utility functions
    getColumns: (mobile: number, tablet: number, desktop: number) => {
      if (isMobile) return mobile;
      if (isTablet) return tablet;
      return desktop;
    },

    getSpacing: (mobile: number, tablet: number, desktop: number) => {
      if (isMobile) return mobile;
      if (isTablet) return tablet;
      return desktop;
    },

    // Responsive values helper
    getValue: <T,>(values: {
      xs?: T;
      sm?: T;
      md?: T;
      lg?: T;
      xl?: T;
      default: T;
    }): T => {
      if (isXs && values.xs !== undefined) return values.xs;
      if (isSm && values.sm !== undefined) return values.sm;
      if (isMd && values.md !== undefined) return values.md;
      if (isLg && values.lg !== undefined) return values.lg;
      if (isXl && values.xl !== undefined) return values.xl;
      return values.default;
    },
  };
}

/**
 * Hook to get responsive grid columns
 */
export function useResponsiveColumns(
  mobile: number = 1,
  tablet: number = 2,
  desktop: number = 3
) {
  const { getColumns } = useResponsive();
  return getColumns(mobile, tablet, desktop);
}

/**
 * Hook to get responsive spacing
 */
export function useResponsiveSpacing(
  mobile: number = 2,
  tablet: number = 3,
  desktop: number = 4
) {
  const { getSpacing } = useResponsive();
  return getSpacing(mobile, tablet, desktop);
}

