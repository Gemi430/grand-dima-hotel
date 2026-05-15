import React from 'react';
import { Box, Chip, Tooltip, IconButton } from '@mui/material';
import {
  WifiOff as DisconnectedIcon,
  Wifi as ConnectedIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useSocket } from '../contexts/SocketContext';

export const ConnectionStatus: React.FC = () => {
  const { isConnected, error, reconnect } = useSocket();

  if (isConnected) {
    return (
      <Tooltip title="Real-time updates active">
        <Chip
          icon={<ConnectedIcon />}
          label="Connected"
          color="success"
          size="small"
          variant="outlined"
        />
      </Tooltip>
    );
  }

  return (
    <Box display="flex" alignItems="center" gap={1}>
      <Tooltip title={error || 'Disconnected from real-time updates'}>
        <Chip
          icon={<DisconnectedIcon />}
          label="Disconnected"
          color="error"
          size="small"
          variant="outlined"
        />
      </Tooltip>
      <Tooltip title="Reconnect">
        <IconButton size="small" onClick={reconnect} color="primary">
          <RefreshIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

