"use client";
import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  MessageCircle,
  Search,
  Send,
  Bell,
  Mail,
  Smartphone,
  Loader2,
  CheckCircle,
  AlertCircle,
  Clock,
  User,
} from "lucide-react";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { websocketService } from "@/utils/websocketService";

interface Conversation {
  _id: string;
  user: Array<{
    _id: string;
    firstName: string;
    lastName: string;
    profilePhoto?: string;
  }>;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

interface Message {
  _id: string;
  sender: {
    _id: string;
    firstName: string;
    lastName: string;
    profilePhoto?: string;
  };
  recipient: {
    _id: string;
    firstName: string;
    lastName: string;
    profilePhoto?: string;
  };
  content: string;
  createdAt: string;
  isRead: boolean;
  relatedJob?: {
    _id: string;
    title: string;
  };
}

export function CandidateMessagingPortal() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageContent, setMessageContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    loadConversations();
    
    // Setup WebSocket for real-time updates
    const token = localStorage.getItem('token');
    if (token) {
      websocketService.connect(token);
      
      // Listen for new messages
      const unsubscribeNewMessage = websocketService.on('new_message', (data: any) => {
        if (selectedConversation && data.message?.sender?._id === selectedConversation.user[0]._id) {
          loadMessages(selectedConversation.user[0]._id);
        }
        loadConversations();
      });

      // Listen for message read receipts
      const unsubscribeRead = websocketService.on('message_read', (data: any) => {
        // Update message read status in UI
        setMessages(prev => prev.map(msg => 
          msg._id === data.messageId ? { ...msg, isRead: true } : msg
        ));
      });

      return () => {
        unsubscribeNewMessage();
        unsubscribeRead();
        websocketService.disconnect();
      };
    }
  }, [selectedConversation]);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.user[0]._id);
    }
  }, [selectedConversation]);

  const loadConversations = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${apiUrl}/api/v1/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setConversations(response.data.data || []);
      }
    } catch (error: any) {
      console.error('Failed to load conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (userId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${apiUrl}/api/v1/messages/conversation/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setMessages(response.data.data || []);
        
        // Mark messages as read
        const unreadMessages = response.data.data.filter((msg: Message) => !msg.isRead && msg.recipient._id === localStorage.getItem('userId'));
        for (const msg of unreadMessages) {
          await axios.put(
            `${apiUrl}/api/v1/messages/${msg._id}/read`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
          );
        }
      }
    } catch (error: any) {
      console.error('Failed to load messages:', error);
    }
  };

  const sendMessage = async (recipientId: string, content: string) => {
    if (!content.trim()) return;

    setSending(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${apiUrl}/api/v1/messages`,
        {
          recipient: recipientId,
          content,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setMessageContent("");
        loadMessages(recipientId);
        loadConversations();
        
        // Send via WebSocket for real-time delivery (optional - message already sent via API)
        // The backend will emit the message to the recipient
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const filteredConversations = conversations.filter(conv => {
    const userName = `${conv.user[0]?.firstName || ''} ${conv.user[0]?.lastName || ''}`.toLowerCase();
    return userName.includes(searchTerm.toLowerCase()) ||
           conv.lastMessage.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const unreadCount = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
          <p className="text-gray-600">Communicate with employers</p>
        </div>
        <Badge variant="outline" className="flex items-center gap-2">
          <Bell className="h-4 w-4" />
          {unreadCount} unread
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversation List */}
        <div className="lg:col-span-1">
          <Card className="p-4">
            <div className="mb-4">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                </div>
              ) : filteredConversations.length > 0 ? (
                filteredConversations.map((conv) => (
                  <div
                    key={conv._id}
                    className={`p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                      conv.unreadCount > 0 ? "bg-blue-50 border-blue-200" : "border-gray-200"
                    } ${selectedConversation?._id === conv._id ? "ring-2 ring-offset-2" : ""}`}
                    style={selectedConversation?._id === conv._id ? { ringColor: '#02243b' } : {}}
                    onClick={() => setSelectedConversation(conv)}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={conv.user[0]?.profilePhoto} />
                        <AvatarFallback>
                          {conv.user[0]?.firstName?.[0]}{conv.user[0]?.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className={`font-medium text-sm truncate ${conv.unreadCount > 0 ? "font-semibold" : ""}`}>
                            {conv.user[0]?.firstName} {conv.user[0]?.lastName}
                          </span>
                          {conv.unreadCount > 0 && (
                            <Badge variant="default" className="bg-blue-600 text-xs">
                              {conv.unreadCount}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 truncate">{conv.lastMessage}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(conv.lastMessageTime).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-sm text-gray-600">No conversations yet</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Message View */}
        <div className="lg:col-span-2">
          {selectedConversation ? (
            <Card className="p-6 h-[600px] flex flex-col">
              <div className="flex items-center gap-3 mb-4 pb-4 border-b">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={selectedConversation.user[0]?.profilePhoto} />
                  <AvatarFallback>
                    {selectedConversation.user[0]?.firstName?.[0]}{selectedConversation.user[0]?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">
                    {selectedConversation.user[0]?.firstName} {selectedConversation.user[0]?.lastName}
                  </h3>
                  <p className="text-sm text-gray-500">Employer</p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto space-y-3 mb-4">
                {messages.map((msg) => {
                  const isFromMe = msg.sender._id === localStorage.getItem('userId');
                  return (
                    <div
                      key={msg._id}
                      className={`flex ${isFromMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[75%] p-3 rounded-lg ${
                          isFromMe
                            ? 'text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                        style={isFromMe ? { backgroundColor: '#02243b' } : {}}
                      >
                        {!isFromMe && (
                          <p className="text-xs font-medium mb-1 opacity-70">
                            {msg.sender.firstName} {msg.sender.lastName}
                          </p>
                        )}
                        <p className="text-sm">{msg.content}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs opacity-70">
                            {new Date(msg.createdAt).toLocaleTimeString()}
                          </p>
                          {isFromMe && (
                            <CheckCircle className={`h-3 w-3 ${msg.isRead ? 'text-blue-300' : 'opacity-50'}`} />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Message Input */}
              <div className="border-t pt-4">
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Type your message..."
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        if (messageContent.trim()) {
                          sendMessage(selectedConversation.user[0]._id, messageContent);
                        }
                      }
                    }}
                    rows={3}
                  />
                  <Button
                    onClick={() => {
                      if (messageContent.trim()) {
                        sendMessage(selectedConversation.user[0]._id, messageContent);
                      }
                    }}
                    disabled={!messageContent.trim() || sending}
                    className="text-white"
                    style={{ backgroundColor: '#02243b' }}
                  >
                    {sending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Press Enter to send, Shift+Enter for new line
                </p>
              </div>
            </Card>
          ) : (
            <Card className="p-12 text-center h-[600px] flex items-center justify-center">
              <div>
                <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
                <p className="text-gray-600">Choose a conversation from the list to start messaging</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

