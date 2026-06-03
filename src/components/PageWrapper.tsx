import React from 'react';
import { Box, Typography } from '@mui/material';

interface PageWrapperProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}

const gold = '#c9a96e';

/**
 * Consistent page wrapper for all admin pages.
 * Provides the same dark background, gold label, serif heading,
 * and spacing as the Dashboard page.
 */
export const PageWrapper: React.FC<PageWrapperProps> = ({ title, subtitle, action, children }) => {
  return (
    <Box sx={{ bgcolor: '#0a0a0a', minHeight: '100%' }}>
      {/* Page header */}
      <Box
        display="flex"
        alignItems="flex-start"
        justifyContent="space-between"
        flexWrap="wrap"
        gap={2}
        mb={3}
      >
        <Box>
          <Typography
            sx={{
              color: gold,
              fontSize: '0.6rem',
              letterSpacing: 4,
              fontFamily: 'sans-serif',
              mb: 0.75,
              textTransform: 'uppercase',
            }}
          >
            GRAND DIMA HOTEL
          </Typography>
          <Typography
            sx={{
              color: 'white',
              fontFamily: '"Playfair Display", Georgia, serif',
              fontWeight: 700,
              fontSize: { xs: '1.5rem', md: '1.9rem' },
              lineHeight: 1.2,
            }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography
              sx={{
                color: 'rgba(255,255,255,0.35)',
                fontFamily: 'sans-serif',
                fontSize: '0.82rem',
                mt: 0.5,
              }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>
        {action && <Box>{action}</Box>}
      </Box>

      {/* Page content */}
      {children}
    </Box>
  );
};
