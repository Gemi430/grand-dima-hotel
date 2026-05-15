import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Switch,
  RadioGroup,
  Radio,
  Typography,
  Box,
  Divider,
  IconButton,
} from '@mui/material';
import {
  Close as CloseIcon,
  Accessibility as AccessibilityIcon,
} from '@mui/icons-material';
import { useAccessibility } from '../contexts/AccessibilityContext';

interface AccessibilitySettingsProps {
  open: boolean;
  onClose: () => void;
}

export const AccessibilitySettings: React.FC<AccessibilitySettingsProps> = ({ open, onClose }) => {
  const { preferences, updatePreferences, resetPreferences } = useAccessibility();

  const handleToggle = (key: keyof typeof preferences) => {
    updatePreferences({ [key]: !preferences[key] });
  };

  const handleFontSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    updatePreferences({ fontSize: event.target.value as any });
  };

  const handleReset = () => {
    resetPreferences();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby="accessibility-settings-title"
      aria-describedby="accessibility-settings-description"
    >
      <DialogTitle id="accessibility-settings-title">
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            <AccessibilityIcon />
            <Typography variant="h6">Accessibility Settings</Typography>
          </Box>
          <IconButton
            aria-label="Close accessibility settings"
            onClick={onClose}
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Typography
          id="accessibility-settings-description"
          variant="body2"
          color="text.secondary"
          gutterBottom
        >
          Customize your experience to meet your accessibility needs. These settings are saved
          automatically.
        </Typography>

        <Box mt={3}>
          {/* Visual Settings */}
          <Typography variant="subtitle1" gutterBottom fontWeight="bold">
            Visual Settings
          </Typography>

          <FormControl component="fieldset" fullWidth margin="normal">
            <FormLabel component="legend">Font Size</FormLabel>
            <RadioGroup
              aria-label="Font size"
              value={preferences.fontSize}
              onChange={handleFontSizeChange}
            >
              <FormControlLabel value="small" control={<Radio />} label="Small (14px)" />
              <FormControlLabel value="medium" control={<Radio />} label="Medium (16px)" />
              <FormControlLabel value="large" control={<Radio />} label="Large (18px)" />
              <FormControlLabel
                value="extra-large"
                control={<Radio />}
                label="Extra Large (20px)"
              />
            </RadioGroup>
          </FormControl>

          <FormGroup>
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.highContrast}
                  onChange={() => handleToggle('highContrast')}
                  inputProps={{
                    'aria-label': 'Toggle high contrast mode',
                  }}
                />
              }
              label={
                <Box>
                  <Typography variant="body1">High Contrast Mode</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Increases contrast for better visibility
                  </Typography>
                </Box>
              }
            />
          </FormGroup>

          <Divider sx={{ my: 3 }} />

          {/* Motion Settings */}
          <Typography variant="subtitle1" gutterBottom fontWeight="bold">
            Motion Settings
          </Typography>

          <FormGroup>
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.reducedMotion}
                  onChange={() => handleToggle('reducedMotion')}
                  inputProps={{
                    'aria-label': 'Toggle reduced motion',
                  }}
                />
              }
              label={
                <Box>
                  <Typography variant="body1">Reduced Motion</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Minimizes animations and transitions
                  </Typography>
                </Box>
              }
            />
          </FormGroup>

          <Divider sx={{ my: 3 }} />

          {/* Navigation Settings */}
          <Typography variant="subtitle1" gutterBottom fontWeight="bold">
            Navigation Settings
          </Typography>

          <FormGroup>
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.keyboardNavigation}
                  onChange={() => handleToggle('keyboardNavigation')}
                  inputProps={{
                    'aria-label': 'Toggle keyboard navigation',
                  }}
                />
              }
              label={
                <Box>
                  <Typography variant="body1">Enhanced Keyboard Navigation</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Shows focus indicators for keyboard users
                  </Typography>
                </Box>
              }
            />

            <FormControlLabel
              control={
                <Switch
                  checked={preferences.screenReaderOptimized}
                  onChange={() => handleToggle('screenReaderOptimized')}
                  inputProps={{
                    'aria-label': 'Toggle screen reader optimization',
                  }}
                />
              }
              label={
                <Box>
                  <Typography variant="body1">Screen Reader Optimized</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Optimizes layout and spacing for screen readers
                  </Typography>
                </Box>
              }
            />
          </FormGroup>

          <Box mt={3} p={2} bgcolor="info.light" borderRadius={1}>
            <Typography variant="body2" color="info.dark">
              <strong>Tip:</strong> These settings work best with screen readers like NVDA, JAWS,
              or VoiceOver. Press Tab to navigate between elements and Enter/Space to activate
              buttons.
            </Typography>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleReset} color="secondary">
          Reset to Default
        </Button>
        <Button onClick={onClose} variant="contained" color="primary">
          Done
        </Button>
      </DialogActions>
    </Dialog>
  );
};

