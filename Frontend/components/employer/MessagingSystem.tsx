"use client";
import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MessageCircle,
  Search,
  Star,
  Reply,
  Trash2,
  MoreVertical,
  Send,
  Users,
  FileText,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
  Plus,
  Edit,
  Sparkles,
  BarChart3,
  Mail,
  Smartphone,
  Bell,
  CheckCheck,
  Filter,
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
    preferences?: {
      jobTitle: string;
    };
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
  flagged?: boolean;
  moderationScore?: number;
}

interface Template {
  _id: string;
  name: string;
  type: string;
  subject: string;
  content: string;
  variables: string[];
  usage: number;
  status: string;
}

export function MessagingSystem() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [showNewMessageDialog, setShowNewMessageDialog] = useState(false);
  const [showBulkMessageDialog, setShowBulkMessageDialog] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [messageContent, setMessageContent] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [selectedJob, setSelectedJob] = useState<string>("");
  const [bulkRecipients, setBulkRecipients] = useState<string[]>([]);
  const [bulkFilters, setBulkFilters] = useState<any>({});
  const [showContactSupportDialog, setShowContactSupportDialog] = useState(false);
  const [supportCategory, setSupportCategory] = useState("Technical Issue");
  const [supportPriority, setSupportPriority] = useState("Normal");
  const [supportDescription, setSupportDescription] = useState("");
  const [isGeneratingSupport, setIsGeneratingSupport] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [isConnected, setIsConnected] = useState(true); // Optimistic initial state
  const [refreshing, setRefreshing] = useState(false);
  const [messageHistory, setMessageHistory] = useState<Map<string, Message[]>>(new Map());
  const [currentUserId, setCurrentUserId] = useState<string>("");

  const getPreviewContent = (content: string) => {
    return content
      .replace(/{{name}}/g, "John Doe")
      .replace(/{{firstName}}/g, "John")
      .replace(/{{lastName}}/g, "Doe")
      .replace(/{{company}}/g, "Your Company")
      .replace(/{{jobTitle}}/g, "Senior Developer");
  };

  const { toast } = useToast();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  // Initialize WebSocket connection on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    if (userId) setCurrentUserId(userId);
    if (token) {
      websocketService.connect(token);
    }
  }, []);

  useEffect(() => {
    loadConversations(1, true); // Initial load
    loadTemplates();

    // WebSocket Listeners
    const handleNewMessage = (data: any) => {
      if (!data.message) return;

      // Update messages if conversation is open
      if (selectedConversation && (
        (data.message.sender._id === selectedConversation.user[0]._id) ||
        (data.message.recipient._id === selectedConversation.user[0]._id)
      )) {
        setMessages((prev) => {
          // Avoid duplicates
          if (prev.some(m => m._id === data.message._id)) return prev;
          return [...prev, data.message];
        });
        // Mark as read if I'm receiving and looking at it
        const currentUserId = localStorage.getItem('userId');
        if (data.message.sender._id !== currentUserId && data.message.recipient._id === currentUserId) {
          markAsRead(data.message._id);
        }
      }
      // Refresh conversations to update order/unread count
      loadConversations(1, true);
    };

    const handleMessageRead = (data: any) => {
      // Update message read status in current view
      setMessages((prev) =>
        prev.map(msg => msg._id === data.messageId ? { ...msg, isRead: true } : msg)
      );
      // Also update in message history for search
      setMessageHistory((prev) => {
        const updated = new Map(prev);
        updated.forEach((msgs, key) => {
          updated.set(key, msgs.map(msg => msg._id === data.messageId ? { ...msg, isRead: true } : msg));
        });
        return updated;
      });
    };

    const unsubscribeNew = websocketService.on('new_message', handleNewMessage);
    const unsubscribeRead = websocketService.on('message_read', handleMessageRead);
    const unsubscribeConnect = websocketService.on('connected', () => {
      setIsConnected(true);
      // Refresh conversations when reconnected
      loadConversations(1, true);
    });
    const unsubscribeDisconnect = websocketService.on('disconnected', () => setIsConnected(false));
    const unsubscribeError = websocketService.on('error', () => {
      setIsConnected(false);
      toast({ title: "Connection Error", description: "Lost connection to messaging server", variant: "destructive" });
    });

    return () => {
      if (unsubscribeNew) unsubscribeNew();
      if (unsubscribeRead) unsubscribeRead();
      if (unsubscribeConnect) unsubscribeConnect();
      if (unsubscribeDisconnect) unsubscribeDisconnect();
      if (unsubscribeError) unsubscribeError();
    };
  }, [selectedConversation]);

  // Periodic Polling (every 15 seconds for better real-time feel)
  useEffect(() => {
    const intervalId = setInterval(() => {
      setRefreshing(true);
      loadConversations(1, true).finally(() => setRefreshing(false));
    }, 15000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.user[0]._id);
    }
  }, [selectedConversation]);

  const loadConversations = async (pageNum = 1, reset = false) => {
    if (pageNum === 1 && !refreshing) setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${apiUrl}/api/v1/messages`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { page: pageNum, limit: 50, includeAll: true } // Increased limit and includeAll flag
      });

      if (response.data.success) {
        const newConversations = response.data.data || [];
        if (reset) {
          setConversations(newConversations);
        } else {
          // Merge and deduplicate conversations
          setConversations((prev) => {
            const merged = [...prev, ...newConversations];
            const unique = merged.filter((conv, index, self) =>
              index === self.findIndex((c) => c._id === conv._id)
            );
            return unique;
          });
        }
        setHasMore(newConversations.length === 50);
      }
    } catch (error: any) {
      console.error('Failed to load conversations:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to load conversations",
        variant: "destructive",
      });
    } finally {
      if (pageNum === 1 && !refreshing) setLoading(false);
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${apiUrl}/api/v1/messages/${messageId}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err: any) {
      console.error('Failed to mark message as read:', err);
      // Don't show toast for read status updates to avoid spam
    }
  };

  const loadMessages = async (userId: string) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${apiUrl}/api/v1/messages/conversation/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        const loadedMessages = response.data.data || [];
        setMessages(loadedMessages);
        // Store in message history for search
        setMessageHistory((prev) => {
          const updated = new Map(prev);
          updated.set(userId, loadedMessages);
          return updated;
        });
        // Mark unread messages as read when loading conversation
        const currentUserId = localStorage.getItem('userId');
        const unreadMsgs = loadedMessages.filter((m: Message) =>
          !m.isRead && m.sender._id === userId && m.recipient._id === currentUserId
        );
        unreadMsgs.forEach((m: Message) => markAsRead(m._id));
      }
    } catch (error: any) {
      console.error('Failed to load messages:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to load messages",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  /* ... loadTemplates, sendMessage, sendBulkMessages, etc. keep existing logic ... */
  // Re-implementing sendBulkMessages to include new filters

  const sendBulkMessages = async () => {
    setSending(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${apiUrl}/api/v1/messages/bulk`,
        {
          recipients: bulkRecipients.length > 0 ? bulkRecipients : undefined,
          filters: Object.keys(bulkFilters).length > 0 ? bulkFilters : undefined,
          jobId: selectedJob || undefined,
          content: messageContent,
          templateId: selectedTemplate || undefined,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        toast({
          title: "Bulk Messages Sent",
          description: `${response.data.data.sent} messages sent successfully`,
        });
        setShowBulkMessageDialog(false);
        setMessageContent("");
        setBulkRecipients([]);
        setBulkFilters({});
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to send bulk messages",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  /* ... generateSupportMessage, sendSupportMessage ... */
  // Keeping these the same as they were not requested to change drastically, just ensuring imports match.

  const loadTemplates = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${apiUrl}/api/v1/messages/templates`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { status: 'active' },
      });

      if (response.data.success) {
        setTemplates(response.data.data || []);
      }
    } catch (error: any) {
      console.error('Failed to load templates:', error);
    }
  };

  const sendMessage = async (recipientId: string, content: string, templateId?: string) => {
    setSending(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${apiUrl}/api/v1/messages`,
        {
          recipient: recipientId,
          content,
          templateId,
          relatedJob: selectedJob || undefined,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        toast({
          title: "Message Sent",
          description: "Your message has been sent successfully",
        });
        setMessageContent("");
        if (selectedConversation) {
          loadMessages(selectedConversation.user[0]._id);
        }
        loadConversations(1, true);
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

  const generateSupportMessage = async () => {
    setIsGeneratingSupport(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${apiUrl}/api/v1/ai/generate-support-message`,
        {
          category: supportCategory,
          description: supportDescription || "I am facing an issue with the platform.",
          priority: supportPriority
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setSupportDescription(response.data.data.content);
        toast({
          title: "AI Draft Generated",
          description: "Support message draft has been generated.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to generate ID draft",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingSupport(false);
    }
  };

  const sendSupportMessage = async () => {
    setSending(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${apiUrl}/api/v1/messages/support`,
        {
          category: supportCategory,
          priority: supportPriority,
          content: supportDescription,
          subject: `${supportCategory} - ${supportPriority}`
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        toast({
          title: "Support Request Sent",
          description: "Your support request has been sent to the admin team.",
        });
        setShowContactSupportDialog(false);
        setSupportDescription("");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to send support request",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const filteredConversations = conversations.filter(conv => {
    if (!searchTerm.trim()) {
      // No search term, just apply filter
      switch (selectedFilter) {
        case "unread":
          return conv.unreadCount > 0;
        default:
          return true;
      }
    }

    const searchLower = searchTerm.toLowerCase();
    const userName = `${conv.user[0]?.firstName || ''} ${conv.user[0]?.lastName || ''}`.toLowerCase();
    const jobTitle = (conv.user[0]?.preferences?.jobTitle || '').toLowerCase();
    const contentMatch = conv.lastMessage.toLowerCase().includes(searchLower);

    // Search in message history for this conversation
    const userId = conv.user[0]?._id;
    const historyMessages = messageHistory.get(userId) || [];
    const historyMatch = historyMessages.some((msg: Message) =>
      msg.content.toLowerCase().includes(searchLower)
    );

    // Search in Name, Last Message, Job Title, and Message History
    const matchesSearch = userName.includes(searchLower) ||
      contentMatch ||
      jobTitle.includes(searchLower) ||
      historyMatch;

    switch (selectedFilter) {
      case "unread":
        return conv.unreadCount > 0 && matchesSearch;
      default:
        return matchesSearch;
    }
  });

  const unreadCount = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
          <div className="flex items-center gap-2">
            <p className="text-gray-600">Communicate with candidates</p>
            {!isConnected && (
              <Badge variant="destructive" className="text-xs">
                Disconnected
              </Badge>
            )}
            {refreshing && (
              <Badge variant="outline" className="text-xs">
                <Loader2 className="h-3 w-3 mr-1 animate-spin inline" />
                Refreshing...
              </Badge>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowBulkMessageDialog(true)}
          >
            <Users className="h-4 w-4 mr-2" />
            Bulk Message
          </Button>
          <Button
            variant="outline"
            className="border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
            onClick={() => setShowContactSupportDialog(true)}
          >
            <AlertCircle className="h-4 w-4 mr-2" />
            Contact Support
          </Button>
          <Button
            className="text-white"
            style={{ backgroundColor: '#02243b' }}
            onClick={() => setShowNewMessageDialog(true)}
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            New Message
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Filters */}
        <div className="lg:col-span-1">
          <Card className="p-4">
            <div className="space-y-2">
              <Button
                variant={selectedFilter === "all" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setSelectedFilter("all")}
              >
                All Messages ({conversations.length})
              </Button>
              <Button
                variant={selectedFilter === "unread" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setSelectedFilter("unread")}
              >
                Unread ({unreadCount})
              </Button>
            </div>
          </Card>

          {/* Templates */}
          <Card className="p-4 mt-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium">Templates</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowTemplateDialog(true)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2">
              {templates.slice(0, 5).map((template) => (
                <Button
                  key={template._id}
                  variant="outline"
                  size="sm"
                  className="w-full text-left justify-start"
                  onClick={() => {
                    setSelectedTemplate(template._id);
                    setMessageContent(template.content);
                  }}
                >
                  <FileText className="h-3 w-3 mr-2" />
                  {template.name}
                </Button>
              ))}
            </div>
          </Card>
        </div>

        {/* Conversation List & Messages */}
        <div className="lg:col-span-3">
          {!selectedConversation ? (
            <Card className="p-6">
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

              <div className="space-y-3">
                {loading && page === 1 ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                  </div>
                ) : filteredConversations.length > 0 ? (
                  <>
                    {filteredConversations.map((conv) => (
                      <div
                        key={conv._id}
                        className={`p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${conv.unreadCount > 0 ? "bg-blue-50 border-blue-200" : "border-gray-200"
                          }`}
                        onClick={() => setSelectedConversation(conv)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`font-medium ${conv.unreadCount > 0 ? "font-semibold" : ""}`}>
                                {conv.user[0]?.firstName} {conv.user[0]?.lastName}
                              </span>
                              {conv.unreadCount > 0 && (
                                <Badge variant="default" className="bg-blue-600">
                                  {conv.unreadCount}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-500 line-clamp-2">{conv.lastMessage}</p>
                          </div>
                          <span className="text-xs text-gray-500 ml-4">
                            {new Date(conv.lastMessageTime).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                    {!loading && hasMore && filteredConversations.length >= 20 && (
                      <Button
                        variant="ghost"
                        className="w-full text-blue-600"
                        onClick={() => {
                          const nextPage = page + 1;
                          setPage(nextPage);
                          loadConversations(nextPage);
                        }}
                      >
                        Load More
                      </Button>
                    )}
                    {loading && page > 1 && (
                      <div className="flex justify-center py-2">
                        <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8">
                    <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No conversations</h3>
                    <p className="text-gray-600">Start a new conversation to get started.</p>
                  </div>
                )}
              </div>
            </Card>
          ) : (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold">
                    {selectedConversation.user[0]?.firstName} {selectedConversation.user[0]?.lastName}
                  </h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedConversation(null)}
                >
                  Back
                </Button>
              </div>

              {/* Messages */}
              <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
                {messages.map((msg) => {
                  const isFromMe = msg.sender._id === currentUserId;
                  return (
                    <div
                      key={msg._id}
                      className={`flex ${isFromMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg ${isFromMe
                          ? 'text-white'
                          : 'bg-gray-100 text-gray-900'
                          }`}
                        style={isFromMe ? { backgroundColor: '#02243b' } : {}}
                      >
                        {!isFromMe && (
                          <p className="text-xs font-bold mb-1 text-blue-800">
                            {msg.sender.firstName} {msg.sender.lastName}
                          </p>
                        )}
                        <p className="text-sm">{msg.content}</p>
                        <div className="flex items-center justify-end gap-1 mt-1">
                          <p className="text-xs opacity-70">
                            {new Date(msg.createdAt).toLocaleString()}
                          </p>
                          {isFromMe && (
                            <div className="flex items-center gap-1" title={msg.isRead ? "Read" : "Sent"}>
                              {msg.isRead ? (
                                <CheckCheck className="h-3 w-3 text-blue-400" />
                              ) : (
                                <CheckCircle className="h-3 w-3 opacity-50" />
                              )}
                            </div>
                          )}
                        </div>
                        {msg.flagged && (
                          <Badge variant="destructive" className="mt-1 text-xs">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Flagged
                          </Badge>
                        )}
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
                    rows={3}
                  />
                  <Button
                    onClick={() => {
                      if (messageContent.trim() && selectedConversation) {
                        sendMessage(selectedConversation.user[0]._id, messageContent, selectedTemplate);
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
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* New Message Dialog */}
      <Dialog open={showNewMessageDialog} onOpenChange={setShowNewMessageDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Message</DialogTitle>
            <DialogDescription>Send a message to a candidate</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Template (Optional)</Label>
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template._id} value={template._id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <Label>Message</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs text-blue-600"
                  onClick={() => setShowPreview(!showPreview)}
                >
                  {showPreview ? "Edit Message" : "Preview"}
                </Button>
              </div>
              {showPreview ? (
                <div className="p-3 border rounded-md bg-gray-50 text-sm min-h-[120px] whitespace-pre-wrap">
                  {getPreviewContent(messageContent)}
                </div>
              ) : (
                <Textarea
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  rows={5}
                  placeholder="Enter your message..."
                />
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewMessageDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                // Implementation for selecting recipient
                setShowNewMessageDialog(false);
              }}
              className="text-white"
              style={{ backgroundColor: '#02243b' }}
            >
              Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Message Dialog */}
      <Dialog open={showBulkMessageDialog} onOpenChange={setShowBulkMessageDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Bulk Message</DialogTitle>
            <DialogDescription>Send a message to multiple candidates</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Template (Optional)</Label>
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template._id} value={template._id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <Label>Message</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs text-blue-600"
                  onClick={() => setShowPreview(!showPreview)}
                >
                  {showPreview ? "Edit Message" : "Preview"}
                </Button>
              </div>
              {showPreview ? (
                <div className="p-3 border rounded-md bg-gray-50 text-sm min-h-[120px] whitespace-pre-wrap">
                  {getPreviewContent(messageContent)}
                </div>
              ) : (
                <Textarea
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  rows={5}
                  placeholder="Enter your message..."
                />
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Filter by Status</Label>
                <Select
                  value={bulkFilters.status || "all"}
                  onValueChange={(value) => {
                    const newFilters = { ...bulkFilters };
                    if (value === "all") delete newFilters.status;
                    else newFilters.status = value;
                    setBulkFilters(newFilters);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="applied">Applied</SelectItem>
                    <SelectItem value="shortlisted">Shortlisted</SelectItem>
                    <SelectItem value="interview">Interview</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="hired">Hired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Filter by Job Title</Label>
                <Input
                  placeholder="e.g. Frontend Dev"
                  value={bulkFilters.jobTitle || ""}
                  onChange={(e) => setBulkFilters({ ...bulkFilters, jobTitle: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Filter by Location</Label>
                <Input
                  placeholder="e.g. New York"
                  value={bulkFilters.location || ""}
                  onChange={(e) => setBulkFilters({ ...bulkFilters, location: e.target.value })}
                />
              </div>
              <div>
                <Label>Filter by Experience (years)</Label>
                <Input
                  type="number"
                  placeholder="e.g. 3"
                  value={bulkFilters.experience || ""}
                  onChange={(e) => setBulkFilters({ ...bulkFilters, experience: e.target.value ? parseInt(e.target.value) : undefined })}
                />
              </div>
            </div>
            <div>
              <Label>Filter by Skills (comma-separated)</Label>
              <Input
                placeholder="e.g. React, Node.js, TypeScript"
                value={bulkFilters.skills || ""}
                onChange={(e) => {
                  const skills = e.target.value.split(',').map(s => s.trim()).filter(s => s);
                  setBulkFilters({ ...bulkFilters, skills: skills.length > 0 ? skills : undefined });
                }}
              />
            </div>
            <div>
              <Label>Filter by Education Level</Label>
              <Select
                value={bulkFilters.education || "all"}
                onValueChange={(value) => {
                  const newFilters = { ...bulkFilters };
                  if (value === "all") delete newFilters.education;
                  else newFilters.education = value;
                  setBulkFilters(newFilters);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All education levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All education levels</SelectItem>
                  <SelectItem value="high-school">High School</SelectItem>
                  <SelectItem value="bachelor">Bachelor's</SelectItem>
                  <SelectItem value="master">Master's</SelectItem>
                  <SelectItem value="phd">PhD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkMessageDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={sendBulkMessages}
              disabled={!messageContent.trim() || sending}
              className="text-white"
              style={{ backgroundColor: '#02243b' }}
            >
              {sending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Users className="h-4 w-4 mr-2" />
                  Send Bulk Message
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Contact Support Dialog */}
      <Dialog open={showContactSupportDialog} onOpenChange={setShowContactSupportDialog}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Contact Support</DialogTitle>
            <DialogDescription>
              Need help? Send a message to our support team.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Category</Label>
                <Select value={supportCategory} onValueChange={setSupportCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Technical Issue">Technical Issue</SelectItem>
                    <SelectItem value="Billing Inquiry">Billing Inquiry</SelectItem>
                    <SelectItem value="Feature Request">Feature Request</SelectItem>
                    <SelectItem value="Account Management">Account Management</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Priority</Label>
                <Select value={supportPriority} onValueChange={setSupportPriority}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Normal">Normal</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <Label>Message</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs text-blue-600 hover:text-blue-800"
                  onClick={generateSupportMessage}
                  disabled={isGeneratingSupport}
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  {isGeneratingSupport ? 'Generating...' : 'AI Assist'}
                </Button>
              </div>
              <Textarea
                value={supportDescription}
                onChange={(e) => setSupportDescription(e.target.value)}
                rows={6}
                placeholder="Describe your issue..."
                className="resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowContactSupportDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={sendSupportMessage}
              disabled={!supportDescription.trim() || sending}
              className="text-white"
              style={{ backgroundColor: '#02243b' }}
            >
              {sending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Request
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
