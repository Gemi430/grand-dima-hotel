# WebSocket Client - Quick Start Guide

## 5-Minute Integration Guide

### 1. Basic Setup (Already Done ✅)

The WebSocket client is already configured in the app. Just use the hooks!

### 2. Subscribe to Real-time Updates

```tsx
import { useDashboardMetrics } from '@/hooks/useRealtimeUpdates';

function MyComponent() {
  const [metrics, setMetrics] = useState(null);
  
  // Subscribe to dashboard metrics
  useDashboardMetrics(setMetrics);
  
  return <div>Occupancy: {metrics?.occupancy.occupancyRate}%</div>;
}
```

### 3. Available Hooks

```tsx
import {
  useDashboardMetrics,      // Live dashboard data
  useReservationUpdates,    // Reservation events
  useRoomStatusUpdates,     // Room status changes
  useHousekeepingUpdates,   // Housekeeping tasks
  useDashboardAlerts,       // Critical alerts
  useNotifications,         // General notifications
  useSocketEmit,            // Send events to server
} from '@/hooks/useRealtimeUpdates';
```

### 4. Common Patterns

#### Pattern 1: Update State on Event

```tsx
function RoomList() {
  const [rooms, setRooms] = useState([]);
  
  const handleRoomUpdate = useCallback((update) => {
    setRooms(prev => 
      prev.map(room => 
        room.id === update.roomId 
          ? { ...room, status: update.status }
          : room
      )
    );
  }, []);
  
  useRoomStatusUpdates(handleRoomUpdate);
  
  return <div>{/* Render rooms */}</div>;
}
```

#### Pattern 2: Show Toast Notifications

```tsx
function Reservations() {
  const handleUpdate = useCallback((update) => {
    // Update your state
    setReservations(prev => [...prev, update]);
  }, []);
  
  // Enable toast notifications
  useReservationUpdates(handleUpdate, { showToast: true });
  
  return <div>{/* Render reservations */}</div>;
}
```

#### Pattern 3: Emit Events to Server

```tsx
function RoomControl() {
  const { emit, isConnected } = useSocketEmit();
  
  const updateStatus = (roomId, status) => {
    if (isConnected) {
      emit('room:update', { roomId, status }, (response) => {
        console.log('Updated:', response);
      });
    }
  };
  
  return <button onClick={() => updateStatus('123', 'available')}>
    Update
  </button>;
}
```

#### Pattern 4: Check Connection Status

```tsx
import { useSocket } from '@/contexts/SocketContext';

function MyComponent() {
  const { isConnected, error } = useSocket();
  
  if (!isConnected) {
    return <Alert severity="warning">Offline mode</Alert>;
  }
  
  return <div>{/* Your content */}</div>;
}
```

### 5. Event Data Types

```tsx
// Room status update
interface RoomStatusUpdate {
  roomId: string;
  roomNumber: string;
  status: string;
  timestamp: Date;
}

// Reservation update
interface ReservationUpdate {
  reservationId: string;
  reservationNumber: string;
  status: string;
  guestName: string;
  roomNumber: string;
  timestamp: Date;
}

// Dashboard metrics
interface DashboardMetrics {
  occupancy: {
    total: number;
    occupied: number;
    available: number;
    maintenance: number;
    occupancyRate: string;
  };
  reservations: {
    arrivals: number;
    departures: number;
  };
  revenue: {
    today: number;
  };
  housekeeping: {
    pendingTasks: number;
  };
  timestamp: Date;
}
```

### 6. Best Practices

✅ **DO:**
- Use `useCallback` for event handlers
- Check `isConnected` before emitting
- Handle disconnection gracefully
- Show loading states during connection

❌ **DON'T:**
- Create event handlers inside render
- Emit events when disconnected
- Forget to handle errors
- Subscribe to too many events in one component

### 7. Troubleshooting

**Problem**: Events not received
```tsx
// Solution: Check connection status
const { isConnected } = useSocket();
console.log('Connected:', isConnected);
```

**Problem**: Too many re-renders
```tsx
// Solution: Use useCallback
const handleUpdate = useCallback((data) => {
  // Your logic
}, []); // Add dependencies if needed
```

**Problem**: Connection fails
```tsx
// Solution: Check environment variable
console.log('Socket URL:', process.env.REACT_APP_SOCKET_URL);
```

### 8. Complete Example

```tsx
import React, { useState, useCallback } from 'react';
import { useSocket } from '@/contexts/SocketContext';
import { 
  useDashboardMetrics, 
  useReservationUpdates,
  DashboardMetrics,
  ReservationUpdate 
} from '@/hooks/useRealtimeUpdates';

export const Dashboard: React.FC = () => {
  const { isConnected } = useSocket();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [recentReservations, setRecentReservations] = useState<ReservationUpdate[]>([]);

  // Subscribe to metrics
  const handleMetrics = useCallback((data: DashboardMetrics) => {
    setMetrics(data);
  }, []);
  
  useDashboardMetrics(handleMetrics);

  // Subscribe to reservations
  const handleReservation = useCallback((data: ReservationUpdate) => {
    setRecentReservations(prev => [data, ...prev].slice(0, 10));
  }, []);
  
  useReservationUpdates(handleReservation, { showToast: true });

  if (!isConnected) {
    return <Alert severity="warning">Connecting...</Alert>;
  }

  return (
    <div>
      <h1>Dashboard</h1>
      
      {metrics && (
        <div>
          <h2>Occupancy: {metrics.occupancy.occupancyRate}%</h2>
          <p>Available Rooms: {metrics.occupancy.available}</p>
          <p>Today's Revenue: ${metrics.revenue.today}</p>
        </div>
      )}
      
      <h2>Recent Reservations</h2>
      {recentReservations.map(res => (
        <div key={res.reservationId}>
          {res.guestName} - Room {res.roomNumber}
        </div>
      ))}
    </div>
  );
};
```

### 9. Environment Setup

Create `.env` file:
```env
REACT_APP_SOCKET_URL=http://localhost:3001
```

For production:
```env
REACT_APP_SOCKET_URL=https://api.yourdomain.com
```

### 10. Testing

```tsx
// Mock the socket in tests
jest.mock('@/contexts/SocketContext', () => ({
  useSocket: () => ({
    socket: mockSocket,
    isConnected: true,
    error: null,
    reconnect: jest.fn(),
  }),
}));
```

## Need More Help?

- 📖 Full documentation: `frontend/src/contexts/README.md`
- 📋 Implementation details: `frontend/WEBSOCKET-CLIENT-IMPLEMENTATION.md`
- ✅ Verification checklist: `frontend/TASK-10.1-VERIFICATION.md`

## Quick Reference

| Hook | Event | Purpose |
|------|-------|---------|
| `useDashboardMetrics` | `dashboard:metrics:updated` | Live dashboard data |
| `useReservationUpdates` | `reservation:*` | Reservation events |
| `useRoomStatusUpdates` | `room:status:updated` | Room status changes |
| `useHousekeepingUpdates` | `housekeeping:*` | Housekeeping tasks |
| `useDashboardAlerts` | `dashboard:alert:created` | Critical alerts |
| `useNotifications` | `notification:new` | General notifications |
| `useSocketEmit` | - | Send events to server |

## Connection Status

```tsx
import { ConnectionStatus } from '@/components/ConnectionStatus';

// Already in Layout.tsx header
<ConnectionStatus />
```

Shows:
- 🟢 Connected - Real-time updates active
- 🔴 Disconnected - With reconnect button

That's it! You're ready to use real-time updates in your components. 🚀
