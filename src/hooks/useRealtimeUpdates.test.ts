import { renderHook } from '@testing-library/react';
import {
  useRoomStatusUpdates,
  useReservationUpdates,
  useHousekeepingUpdates,
  useDashboardMetrics,
  useSocketEmit,
} from './useRealtimeUpdates';
import { useSocket } from '../contexts/SocketContext';

// Mock the useSocket hook
jest.mock('@/contexts/SocketContext');

const mockUseSocket = useSocket as jest.MockedFunction<typeof useSocket>;

describe('useRealtimeUpdates hooks', () => {
  let mockSocket: any;

  beforeEach(() => {
    mockSocket = {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
    };

    mockUseSocket.mockReturnValue({
      socket: mockSocket,
      isConnected: true,
      error: null,
      reconnect: jest.fn(),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('useRoomStatusUpdates', () => {
    it('should subscribe to room:status:updated event', () => {
      const onUpdate = jest.fn();
      renderHook(() => useRoomStatusUpdates(onUpdate));

      expect(mockSocket.on).toHaveBeenCalledWith(
        'room:status:updated',
        expect.any(Function)
      );
    });

    it('should call onUpdate when event is received', () => {
      const onUpdate = jest.fn();
      renderHook(() => useRoomStatusUpdates(onUpdate));

      const handler = mockSocket.on.mock.calls.find(
        (call: any) => call[0] === 'room:status:updated'
      )?.[1];

      const mockData = {
        roomId: '123',
        roomNumber: '101',
        status: 'available',
        timestamp: new Date(),
      };

      handler(mockData);

      expect(onUpdate).toHaveBeenCalledWith(mockData);
    });

    it('should unsubscribe on unmount', () => {
      const onUpdate = jest.fn();
      const { unmount } = renderHook(() => useRoomStatusUpdates(onUpdate));

      unmount();

      expect(mockSocket.off).toHaveBeenCalledWith(
        'room:status:updated',
        expect.any(Function)
      );
    });

    it('should not subscribe when socket is not connected', () => {
      mockUseSocket.mockReturnValue({
        socket: mockSocket,
        isConnected: false,
        error: null,
        reconnect: jest.fn(),
      });

      const onUpdate = jest.fn();
      renderHook(() => useRoomStatusUpdates(onUpdate));

      expect(mockSocket.on).not.toHaveBeenCalled();
    });
  });

  describe('useReservationUpdates', () => {
    it('should subscribe to all reservation events', () => {
      const onUpdate = jest.fn();
      renderHook(() => useReservationUpdates(onUpdate));

      expect(mockSocket.on).toHaveBeenCalledWith(
        'reservation:created',
        expect.any(Function)
      );
      expect(mockSocket.on).toHaveBeenCalledWith(
        'reservation:updated',
        expect.any(Function)
      );
      expect(mockSocket.on).toHaveBeenCalledWith(
        'reservation:checkin',
        expect.any(Function)
      );
      expect(mockSocket.on).toHaveBeenCalledWith(
        'reservation:checkout',
        expect.any(Function)
      );
    });

    it('should call onUpdate for reservation:created event', () => {
      const onUpdate = jest.fn();
      renderHook(() => useReservationUpdates(onUpdate));

      const handler = mockSocket.on.mock.calls.find(
        (call: any) => call[0] === 'reservation:created'
      )?.[1];

      const mockData = {
        reservationId: '123',
        reservationNumber: 'RES-001',
        status: 'confirmed',
        guestName: 'John Doe',
        roomNumber: '101',
        timestamp: new Date(),
      };

      handler(mockData);

      expect(onUpdate).toHaveBeenCalledWith(mockData);
    });
  });

  describe('useHousekeepingUpdates', () => {
    it('should subscribe to housekeeping events', () => {
      const onUpdate = jest.fn();
      renderHook(() => useHousekeepingUpdates(onUpdate));

      expect(mockSocket.on).toHaveBeenCalledWith(
        'housekeeping:task:assigned',
        expect.any(Function)
      );
      expect(mockSocket.on).toHaveBeenCalledWith(
        'housekeeping:task:completed',
        expect.any(Function)
      );
      expect(mockSocket.on).toHaveBeenCalledWith(
        'housekeeping:room:ready',
        expect.any(Function)
      );
    });
  });

  describe('useDashboardMetrics', () => {
    it('should subscribe to dashboard:metrics:updated event', () => {
      const onUpdate = jest.fn();
      renderHook(() => useDashboardMetrics(onUpdate));

      expect(mockSocket.on).toHaveBeenCalledWith(
        'dashboard:metrics:updated',
        expect.any(Function)
      );
    });

    it('should call onUpdate with metrics data', () => {
      const onUpdate = jest.fn();
      renderHook(() => useDashboardMetrics(onUpdate));

      const handler = mockSocket.on.mock.calls.find(
        (call: any) => call[0] === 'dashboard:metrics:updated'
      )?.[1];

      const mockMetrics = {
        occupancy: {
          total: 100,
          occupied: 75,
          available: 20,
          maintenance: 5,
          occupancyRate: '75.0',
        },
        reservations: {
          arrivals: 10,
          departures: 8,
        },
        revenue: {
          today: 5000,
        },
        housekeeping: {
          pendingTasks: 15,
        },
        timestamp: new Date(),
      };

      handler(mockMetrics);

      expect(onUpdate).toHaveBeenCalledWith(mockMetrics);
    });
  });

  describe('useSocketEmit', () => {
    it('should return emit function and connection status', () => {
      const { result } = renderHook(() => useSocketEmit());

      expect(result.current.emit).toBeDefined();
      expect(typeof result.current.emit).toBe('function');
      expect(result.current.isConnected).toBe(true);
    });

    it('should emit event when connected', () => {
      const { result } = renderHook(() => useSocketEmit());

      const success = result.current.emit('test:event', { data: 'value' });

      expect(success).toBe(true);
      expect(mockSocket.emit).toHaveBeenCalledWith('test:event', { data: 'value' });
    });

    it('should not emit when disconnected', () => {
      mockUseSocket.mockReturnValue({
        socket: mockSocket,
        isConnected: false,
        error: null,
        reconnect: jest.fn(),
      });

      const { result } = renderHook(() => useSocketEmit());

      const success = result.current.emit('test:event', { data: 'value' });

      expect(success).toBe(false);
      expect(mockSocket.emit).not.toHaveBeenCalled();
    });

    it('should support callback parameter', () => {
      const { result } = renderHook(() => useSocketEmit());
      const callback = jest.fn();

      result.current.emit('test:event', { data: 'value' }, callback);

      expect(mockSocket.emit).toHaveBeenCalledWith(
        'test:event',
        { data: 'value' },
        callback
      );
    });
  });
});

