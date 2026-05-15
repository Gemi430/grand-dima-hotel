import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { io } from 'socket.io-client';
import { SocketProvider, useSocket } from './SocketContext';
import { authSlice } from '../store/slices/authSlice';

// Mock socket.io-client
jest.mock('socket.io-client');

const mockIo = io as jest.MockedFunction<typeof io>;

describe('SocketContext', () => {
  let mockSocket: any;
  let store: any;

  beforeEach(() => {
    // Create mock socket
    mockSocket = {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
      disconnect: jest.fn(),
      connected: false,
    };

    mockIo.mockReturnValue(mockSocket as any);

    // Create mock store with authenticated user
    store = configureStore({
      reducer: {
        auth: authSlice.reducer,
      },
      preloadedState: {
        auth: {
          user: {
            id: '123',
            email: 'test@example.com',
            firstName: 'Test',
            lastName: 'User',
            role: 'admin',
            permissions: ['*'],
          },
          token: 'mock-jwt-token',
          isAuthenticated: true,
          isLoading: false,
        },
      },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>
      <SocketProvider>{children}</SocketProvider>
    </Provider>
  );

  it('should create socket connection when authenticated', () => {
    renderHook(() => useSocket(), { wrapper });

    expect(mockIo).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        auth: {
          token: 'mock-jwt-token',
        },
        transports: ['websocket', 'polling'],
      })
    );
  });

  it('should set isConnected to true on connect event', async () => {
    const { result } = renderHook(() => useSocket(), { wrapper });

    // Simulate connect event
    const connectHandler = mockSocket.on.mock.calls.find(
      (call: any) => call[0] === 'connect'
    )?.[1];

    expect(connectHandler).toBeDefined();
    connectHandler();

    await waitFor(() => {
      expect(result.current.isConnected).toBe(true);
    });
  });

  it('should set isConnected to false on disconnect event', async () => {
    const { result } = renderHook(() => useSocket(), { wrapper });

    // Simulate connect then disconnect
    const connectHandler = mockSocket.on.mock.calls.find(
      (call: any) => call[0] === 'connect'
    )?.[1];
    connectHandler();

    await waitFor(() => {
      expect(result.current.isConnected).toBe(true);
    });

    const disconnectHandler = mockSocket.on.mock.calls.find(
      (call: any) => call[0] === 'disconnect'
    )?.[1];
    disconnectHandler('transport close');

    await waitFor(() => {
      expect(result.current.isConnected).toBe(false);
    });
  });

  it('should set error on connect_error event', async () => {
    const { result } = renderHook(() => useSocket(), { wrapper });

    const errorHandler = mockSocket.on.mock.calls.find(
      (call: any) => call[0] === 'connect_error'
    )?.[1];

    const mockError = new Error('Connection failed');
    errorHandler(mockError);

    await waitFor(() => {
      expect(result.current.error).toBe('Connection failed');
    });
  });

  it('should disconnect socket when user logs out', async () => {
    const { rerender } = renderHook(() => useSocket(), { wrapper });

    // Update store to logged out state
    store.dispatch(authSlice.actions.logout());

    rerender();

    await waitFor(() => {
      expect(mockSocket.disconnect).toHaveBeenCalled();
    });
  });

  it('should provide reconnect function', async () => {
    const { result } = renderHook(() => useSocket(), { wrapper });

    expect(result.current.reconnect).toBeDefined();
    expect(typeof result.current.reconnect).toBe('function');
  });

  it('should not create socket when not authenticated', () => {
    // Create store with unauthenticated user
    const unauthStore = configureStore({
      reducer: {
        auth: authSlice.reducer,
      },
      preloadedState: {
        auth: {
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        },
      },
    });

    const unauthWrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={unauthStore}>
        <SocketProvider>{children}</SocketProvider>
      </Provider>
    );

    renderHook(() => useSocket(), { wrapper: unauthWrapper });

    expect(mockIo).not.toHaveBeenCalled();
  });

  it('should clean up socket on unmount', () => {
    const { unmount } = renderHook(() => useSocket(), { wrapper });

    unmount();

    expect(mockSocket.disconnect).toHaveBeenCalled();
  });
});

