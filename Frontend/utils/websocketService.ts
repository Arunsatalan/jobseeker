/**
 * WebSocket Service for Real-Time Messaging using Socket.IO
 * Provides real-time communication between users
 */

import { io, Socket } from 'socket.io-client';

export class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();
  private apiUrl: string;
  private token: string | null = null;

  constructor() {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    this.apiUrl = wsUrl;
  }

  connect(token: string) {
    if (this.socket && this.socket.connected) {
      return; // Already connected
    }

    this.token = token;

    try {
      this.socket = io(this.apiUrl, {
        auth: { token },
        query: { token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectDelay,
      });

      this.socket.on('connect', () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        this.emit('connected', {});
      });

      this.socket.on('disconnect', () => {
        console.log('WebSocket disconnected');
        this.emit('disconnected', {});
      });

      this.socket.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error);
        this.emit('error', { error: error.message });
      });

      // Listen for new messages
      this.socket.on('new_message', (data: any) => {
        this.emit('new_message', data);
      });

      // Listen for message read receipts
      this.socket.on('message_read', (data: any) => {
        this.emit('message_read', data);
      });

      // Listen for typing indicators
      this.socket.on('user_typing', (data: any) => {
        this.emit('user_typing', data);
      });

      // Listen for message sent confirmation
      this.socket.on('message_sent', (data: any) => {
        this.emit('message_sent', data);
      });

      // Listen for message errors
      this.socket.on('message_error', (data: any) => {
        this.emit('message_error', data);
      });
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.listeners.clear();
    this.token = null;
  }

  send(type: string, payload: any) {
    if (this.socket && this.socket.connected) {
      this.socket.emit(type, payload);
    } else {
      console.warn('WebSocket is not connected');
    }
  }

  on(event: string, callback: (data: any) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(event);
      if (callbacks) {
        callbacks.delete(callback);
      }
    };
  }

  private emit(event: string, data: any) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in WebSocket listener for ${event}:`, error);
        }
      });
    }
  }

  isConnected(): boolean {
    return this.socket !== null && this.socket.connected;
  }

  // Typing indicator
  sendTyping(recipient: string, isTyping: boolean) {
    this.send('typing', { recipient, isTyping });
  }

  // Mark message as read
  markAsRead(messageId: string) {
    this.send('mark_read', { messageId });
  }
}

// Singleton instance
export const websocketService = new WebSocketService();

