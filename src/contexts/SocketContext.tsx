import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

interface SocketContextValue {
  socket: Socket | null;
  isConnected: boolean;
  error: string | null;
  reconnect: () => void;
}

const SocketContext = createContext<SocketContextValue>({
  socket: null,
  isConnected: false,
  error: null,
  reconnect: () => {},
});

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  children: React.ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectDelay = useRef(1000); // Start with 1 second

  const connect = useCallback(() => {
    if (!isAuthenticated || !token) {
      return;
    }

    const socketUrl = process.env.REACT_APP_SOCKET_URL || 'http://localhost:3001';

    const newSocket = io(socketUrl, {
      auth: {
        token,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: reconnectDelay.current,
      reconnectionDelayMax: 10000,
      reconnectionAttempts: maxReconnectAttempts,
    });

    // Connection event handlers
    newSocket.on('connect', () => {
      console.log('✅ WebSocket connected');
      setIsConnected(true);
      setError(null);
      reconnectAttempts.current = 0;
      reconnectDelay.current = 1000; // Reset delay on successful connection
      toast.success('Connected to real-time updates');
    });

    newSocket.on('disconnect', (reason) => {
      console.log('❌ WebSocket disconnected:', reason);
      setIsConnected(false);
      
      if (reason === 'io server disconnect') {
        // Server disconnected the socket, need to manually reconnect
        toast.error('Disconnected from server');
      } else {
        toast.error('Connection lost, attempting to reconnect...');
      }
    });

    newSocket.on('connect_error', (err) => {
      console.error('❌ WebSocket connection error:', err.message);
      setError(err.message);
      reconnectAttempts.current += 1;

      if (reconnectAttempts.current >= maxReconnectAttempts) {
        toast.error('Failed to connect to real-time updates. Please refresh the page.');
        setError('Maximum reconnection attempts reached');
      } else {
        // Exponential backoff
        reconnectDelay.current = Math.min(reconnectDelay.current * 2, 10000);
      }
    });

    newSocket.on('error', (err) => {
      console.error('❌ WebSocket error:', err);
      setError(err.message || 'Socket error occurred');
      toast.error('Real-time connection error');
    });

    // Authentication error
    newSocket.on('unauthorized', (err) => {
      console.error('❌ WebSocket authentication failed:', err);
      setError('Authentication failed');
      toast.error('Authentication failed. Please log in again.');
      newSocket.disconnect();
    });

    setSocket(newSocket);

    return newSocket;
  }, [token, isAuthenticated]);

  const reconnect = useCallback(() => {
    if (socket) {
      socket.disconnect();
    }
    reconnectAttempts.current = 0;
    reconnectDelay.current = 1000;
    connect();
  }, [socket, connect]);

  useEffect(() => {
    if (isAuthenticated && token) {
      const newSocket = connect();

      return () => {
        if (newSocket) {
          console.log('🔌 Cleaning up WebSocket connection');
          newSocket.disconnect();
        }
      };
    } else {
      // Disconnect socket if user logs out
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
    }
  }, [isAuthenticated, token, connect]);

  const value: SocketContextValue = {
    socket,
    isConnected,
    error,
    reconnect,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

