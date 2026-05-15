import { useEffect, useCallback } from 'react';
import { useSocket } from '../contexts/SocketContext';
import toast from 'react-hot-toast';

// Room status update event
export interface RoomStatusUpdate {
  roomId: string;
  roomNumber: string;
  status: string;
  timestamp: Date;
}

// Reservation update event
export interface ReservationUpdate {
  reservationId: string;
  reservationNumber: string;
  status: string;
  guestName: string;
  roomNumber: string;
  timestamp: Date;
}

// Housekeeping task update event
export interface HousekeepingUpdate {
  taskId: string;
  roomId: string;
  roomNumber: string;
  status: string;
  assignedTo?: string;
  timestamp: Date;
}

// Dashboard metrics update event
export interface DashboardMetrics {
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

// Notification event
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
}

/**
 * Hook for subscribing to room status updates
 */
export const useRoomStatusUpdates = (
  onUpdate: (update: RoomStatusUpdate) => void,
  options?: { showToast?: boolean }
) => {
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleRoomStatusUpdate = (data: RoomStatusUpdate) => {
      console.log('📦 Room status update:', data);
      onUpdate(data);

      if (options?.showToast) {
        toast.success(`Room ${data.roomNumber} status updated to ${data.status}`);
      }
    };

    socket.on('room:status:updated', handleRoomStatusUpdate);

    return () => {
      socket.off('room:status:updated', handleRoomStatusUpdate);
    };
  }, [socket, isConnected, onUpdate, options?.showToast]);
};

/**
 * Hook for subscribing to room availability changes
 */
export const useRoomAvailabilityUpdates = (
  onUpdate: (update: { roomId: string; available: boolean; timestamp: Date }) => void
) => {
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleAvailabilityChange = (data: { roomId: string; available: boolean; timestamp: Date }) => {
      console.log('📦 Room availability changed:', data);
      onUpdate(data);
    };

    socket.on('room:availability:changed', handleAvailabilityChange);

    return () => {
      socket.off('room:availability:changed', handleAvailabilityChange);
    };
  }, [socket, isConnected, onUpdate]);
};

/**
 * Hook for subscribing to reservation updates
 */
export const useReservationUpdates = (
  onUpdate: (update: ReservationUpdate) => void,
  options?: { showToast?: boolean }
) => {
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleReservationCreated = (data: ReservationUpdate) => {
      console.log('📦 Reservation created:', data);
      onUpdate(data);

      if (options?.showToast) {
        toast.success(`New reservation created: ${data.reservationNumber}`);
      }
    };

    const handleReservationUpdated = (data: ReservationUpdate) => {
      console.log('📦 Reservation updated:', data);
      onUpdate(data);

      if (options?.showToast) {
        toast(`Reservation ${data.reservationNumber} updated`, { icon: 'ℹ️' });
      }
    };

    const handleReservationCheckin = (data: ReservationUpdate) => {
      console.log('📦 Guest checked in:', data);
      onUpdate(data);

      if (options?.showToast) {
        toast.success(`${data.guestName} checked in to room ${data.roomNumber}`);
      }
    };

    const handleReservationCheckout = (data: ReservationUpdate) => {
      console.log('📦 Guest checked out:', data);
      onUpdate(data);

      if (options?.showToast) {
        toast.success(`${data.guestName} checked out from room ${data.roomNumber}`);
      }
    };

    socket.on('reservation:created', handleReservationCreated);
    socket.on('reservation:updated', handleReservationUpdated);
    socket.on('reservation:checkin', handleReservationCheckin);
    socket.on('reservation:checkout', handleReservationCheckout);

    return () => {
      socket.off('reservation:created', handleReservationCreated);
      socket.off('reservation:updated', handleReservationUpdated);
      socket.off('reservation:checkin', handleReservationCheckin);
      socket.off('reservation:checkout', handleReservationCheckout);
    };
  }, [socket, isConnected, onUpdate, options?.showToast]);
};

/**
 * Hook for subscribing to housekeeping task updates
 */
export const useHousekeepingUpdates = (
  onUpdate: (update: HousekeepingUpdate) => void,
  options?: { showToast?: boolean }
) => {
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleTaskAssigned = (data: HousekeepingUpdate) => {
      console.log('📦 Housekeeping task assigned:', data);
      onUpdate(data);

      if (options?.showToast) {
        toast(`Task assigned for room ${data.roomNumber}`, { icon: 'ℹ️' });
      }
    };

    const handleTaskCompleted = (data: HousekeepingUpdate) => {
      console.log('📦 Housekeeping task completed:', data);
      onUpdate(data);

      if (options?.showToast) {
        toast.success(`Room ${data.roomNumber} cleaning completed`);
      }
    };

    const handleRoomReady = (data: HousekeepingUpdate) => {
      console.log('📦 Room ready:', data);
      onUpdate(data);

      if (options?.showToast) {
        toast.success(`Room ${data.roomNumber} is ready for guests`);
      }
    };

    socket.on('housekeeping:task:assigned', handleTaskAssigned);
    socket.on('housekeeping:task:completed', handleTaskCompleted);
    socket.on('housekeeping:room:ready', handleRoomReady);

    return () => {
      socket.off('housekeeping:task:assigned', handleTaskAssigned);
      socket.off('housekeeping:task:completed', handleTaskCompleted);
      socket.off('housekeeping:room:ready', handleRoomReady);
    };
  }, [socket, isConnected, onUpdate, options?.showToast]);
};

/**
 * Hook for subscribing to dashboard metrics updates
 */
export const useDashboardMetrics = (onUpdate: (metrics: DashboardMetrics) => void) => {
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleMetricsUpdate = (data: DashboardMetrics) => {
      console.log('📊 Dashboard metrics updated:', data);
      onUpdate(data);
    };

    socket.on('dashboard:metrics:updated', handleMetricsUpdate);

    return () => {
      socket.off('dashboard:metrics:updated', handleMetricsUpdate);
    };
  }, [socket, isConnected, onUpdate]);
};

/**
 * Hook for subscribing to dashboard alerts
 */
export const useDashboardAlerts = (
  onAlert: (alert: Notification) => void,
  options?: { showToast?: boolean }
) => {
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleAlert = (data: Notification) => {
      console.log('🚨 Dashboard alert:', data);
      onAlert(data);

      if (options?.showToast) {
        switch (data.type) {
          case 'error':
            toast.error(data.message);
            break;
          case 'warning':
            toast.error(data.message, { icon: '⚠️' });
            break;
          case 'success':
            toast.success(data.message);
            break;
          default:
            toast(data.message);
        }
      }
    };

    socket.on('dashboard:alert:created', handleAlert);

    return () => {
      socket.off('dashboard:alert:created', handleAlert);
    };
  }, [socket, isConnected, onAlert, options?.showToast]);
};

/**
 * Hook for subscribing to general notifications
 */
export const useNotifications = (
  onNotification: (notification: Notification) => void,
  options?: { showToast?: boolean }
) => {
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleNotification = (data: Notification) => {
      console.log('🔔 Notification:', data);
      onNotification(data);

      if (options?.showToast) {
        switch (data.type) {
          case 'error':
            toast.error(data.message);
            break;
          case 'warning':
            toast.error(data.message, { icon: '⚠️' });
            break;
          case 'success':
            toast.success(data.message);
            break;
          default:
            toast(data.message);
        }
      }
    };

    socket.on('notification:new', handleNotification);

    return () => {
      socket.off('notification:new', handleNotification);
    };
  }, [socket, isConnected, onNotification, options?.showToast]);
};

/**
 * Hook for emitting events to the server
 */
export const useSocketEmit = () => {
  const { socket, isConnected } = useSocket();

  const emit = useCallback(
    (event: string, data: any, callback?: (response: any) => void) => {
      if (!socket || !isConnected) {
        console.warn('Cannot emit event: socket not connected');
        return false;
      }

      if (callback) {
        socket.emit(event, data, callback);
      } else {
        socket.emit(event, data);
      }

      return true;
    },
    [socket, isConnected]
  );

  return { emit, isConnected };
};

