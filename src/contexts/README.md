# WebSocket Client Integration

This directory contains the WebSocket client integration for real-time updates in the Hotel Management System.

## Overview

The WebSocket integration uses Socket.io-client to establish real-time bidirectional communication between the React frontend and the Node.js backend. This enables live updates for:

- Room status changes
- Reservation updates (create, update, check-in, check-out)
- Housekeeping task updates
- Dashboard metrics
- System alerts and notifications

## Architecture

### SocketContext

The `SocketContext.tsx` provides a React context that manages the Socket.io client connection:

- **Authentication**: Automatically authenticates using JWT token from Redux store
- **Connection Management**: Handles connection, disconnection, and reconnection with exponential backoff
- **Error Handling**: Provides error states and reconnection capabilities
- **Lifecycle Management**: Automatically connects when user logs in and disconnects on logout

### Usage

#### 1. Wrap your app with SocketProvider

The SocketProvider is already configured in `index.tsx`:

```tsx
<SocketProvider>
  <App />
</SocketProvider>
```

#### 2. Use the useSocket hook

Access the socket instance and connection state:

```tsx
import { useSocket } from '@/contexts/SocketContext';

function MyComponent() {
  const { socket, isConnected, error, reconnect } = useSocket();

  // Use socket to emit events or check connection status
}
```

#### 3. Use specialized real-time hooks

Import hooks from `@/hooks/useRealtimeUpdates`:

```tsx
import {
  useDashboardMetrics,
  useReservationUpdates,
  useRoomStatusUpdates,
  useHousekeepingUpdates,
  useDashboardAlerts,
  useNotifications,
} from '@/hooks/useRealtimeUpdates';
```

## Available Hooks

### useDashboardMetrics

Subscribe to real-time dashboard metrics updates:

```tsx
const handleMetricsUpdate = useCallback((metrics: DashboardMetrics) => {
  console.log('New metrics:', metrics);
  // Update your state
}, []);

useDashboardMetrics(handleMetricsUpdate);
```

### useReservationUpdates

Subscribe to reservation events (created, updated, check-in, check-out):

```tsx
const handleReservationUpdate = useCallback((update: ReservationUpdate) => {
  console.log('Reservation update:', update);
  // Update your state
}, []);

useReservationUpdates(handleReservationUpdate, { showToast: true });
```

### useRoomStatusUpdates

Subscribe to room status changes:

```tsx
const handleRoomUpdate = useCallback((update: RoomStatusUpdate) => {
  console.log('Room status changed:', update);
  // Update your state
}, []);

useRoomStatusUpdates(handleRoomUpdate, { showToast: true });
```

### useHousekeepingUpdates

Subscribe to housekeeping task updates:

```tsx
const handleHousekeepingUpdate = useCallback((update: HousekeepingUpdate) => {
  console.log('Housekeeping update:', update);
  // Update your state
}, []);

useHousekeepingUpdates(handleHousekeepingUpdate, { showToast: true });
```

### useDashboardAlerts

Subscribe to critical system alerts:

```tsx
const handleAlert = useCallback((alert: Notification) => {
  console.log('Alert:', alert);
  // Handle alert
}, []);

useDashboardAlerts(handleAlert, { showToast: true });
```

### useNotifications

Subscribe to general notifications:

```tsx
const handleNotification = useCallback((notification: Notification) => {
  console.log('Notification:', notification);
  // Handle notification
}, []);

useNotifications(handleNotification, { showToast: true });
```

### useSocketEmit

Emit events to the server:

```tsx
const { emit, isConnected } = useSocketEmit();

const sendMessage = () => {
  if (isConnected) {
    emit('custom:event', { data: 'value' }, (response) => {
      console.log('Server response:', response);
    });
  }
};
```

## Event Types

### Server → Client Events

- `room:status:updated` - Room status changed
- `room:availability:changed` - Room availability changed
- `reservation:created` - New reservation created
- `reservation:updated` - Reservation updated
- `reservation:checkin` - Guest checked in
- `reservation:checkout` - Guest checked out
- `housekeeping:task:assigned` - Task assigned to staff
- `housekeeping:task:completed` - Task completed
- `housekeeping:room:ready` - Room ready for guests
- `dashboard:metrics:updated` - Dashboard metrics updated
- `dashboard:alert:created` - New alert created
- `notification:new` - New notification

### Client → Server Events

Use the `useSocketEmit` hook to send custom events to the server.

## Connection Management

### Automatic Reconnection

The SocketContext automatically handles reconnection with exponential backoff:

- Initial delay: 1 second
- Maximum delay: 10 seconds
- Maximum attempts: 5

### Manual Reconnection

Use the `reconnect` function from `useSocket`:

```tsx
const { reconnect } = useSocket();

<button onClick={reconnect}>Reconnect</button>
```

### Connection Status Indicator

The `ConnectionStatus` component displays the current connection state:

```tsx
import { ConnectionStatus } from '@/components/ConnectionStatus';

<ConnectionStatus />
```

## Error Handling

The SocketContext provides error states:

```tsx
const { error } = useSocket();

{error && <Alert severity="error">{error}</Alert>}
```

## Best Practices

1. **Use useCallback for event handlers**: Prevent unnecessary re-subscriptions
2. **Clean up subscriptions**: Hooks automatically clean up on unmount
3. **Check connection status**: Use `isConnected` before emitting events
4. **Handle errors gracefully**: Display user-friendly error messages
5. **Limit toast notifications**: Use `showToast: false` for high-frequency events
6. **Keep state updates efficient**: Use functional updates for state

## Example: Complete Integration

```tsx
import React, { useState, useCallback } from 'react';
import { useSocket } from '@/contexts/SocketContext';
import { useDashboardMetrics, DashboardMetrics } from '@/hooks/useRealtimeUpdates';

export const DashboardPage: React.FC = () => {
  const { isConnected } = useSocket();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);

  const handleMetricsUpdate = useCallback((newMetrics: DashboardMetrics) => {
    setMetrics(newMetrics);
  }, []);

  useDashboardMetrics(handleMetricsUpdate);

  if (!isConnected) {
    return <div>Connecting to real-time updates...</div>;
  }

  return (
    <div>
      <h1>Dashboard</h1>
      {metrics && (
        <div>
          <p>Occupancy Rate: {metrics.occupancy.occupancyRate}%</p>
          <p>Today's Revenue: ${metrics.revenue.today}</p>
        </div>
      )}
    </div>
  );
};
```

## Environment Variables

Configure the WebSocket URL in `.env`:

```env
REACT_APP_SOCKET_URL=http://localhost:3001
```

For production:

```env
REACT_APP_SOCKET_URL=https://api.yourdomain.com
```

## Troubleshooting

### Connection fails immediately

- Check that the backend server is running
- Verify `REACT_APP_SOCKET_URL` is correct
- Ensure JWT token is valid

### Frequent disconnections

- Check network stability
- Verify backend Socket.io configuration
- Check for CORS issues

### Events not received

- Verify you're subscribed to the correct event name
- Check that the backend is emitting events
- Ensure you're in the correct Socket.io room (if using rooms)

### Authentication errors

- Verify JWT token is valid and not expired
- Check that token is being sent in socket auth
- Verify backend authentication middleware

## Testing

To test WebSocket functionality:

1. Start the backend server
2. Start the frontend development server
3. Log in to the application
4. Check browser console for connection logs
5. Trigger events from the backend or other clients
6. Verify events are received and handled correctly

## Performance Considerations

- Events are automatically cleaned up on component unmount
- Use `useCallback` to prevent unnecessary re-subscriptions
- Limit the number of simultaneous subscriptions
- Consider debouncing high-frequency updates
- Use React.memo for components that receive frequent updates
