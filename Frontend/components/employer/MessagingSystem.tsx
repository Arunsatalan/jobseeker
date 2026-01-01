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
  const { toast } = useToast();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    loadConversations();
    loadTemplates();
  }, []);

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
      toast({
        title: "Error",
        description: "Failed to load conversations",
        variant: "destructive",
      });
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
      }
    } catch (error: any) {
      console.error('Failed to load messages:', error);
    }
  };

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
        loadConversations();
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

  const filteredConversations = conversations.filter(conv => {
    const userName = `${conv.user[0]?.firstName || ''} ${conv.user[0]?.lastName || ''}`.toLowerCase();
    const matchesSearch = userName.includes(searchTerm.toLowerCase()) ||
                         conv.lastMessage.toLowerCase().includes(searchTerm.toLowerCase());
    
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
          <p className="text-gray-600">Communicate with candidates</p>
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
                {loading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                  </div>
                ) : filteredConversations.length > 0 ? (
                  filteredConversations.map((conv) => (
                    <div
                      key={conv._id}
                      className={`p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                        conv.unreadCount > 0 ? "bg-blue-50 border-blue-200" : "border-gray-200"
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
                  ))
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
                  const isFromMe = msg.sender._id === localStorage.getItem('userId');
                  return (
                    <div
                      key={msg._id}
                      className={`flex ${isFromMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg ${
                          isFromMe
                            ? 'text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                        style={isFromMe ? { backgroundColor: '#02243b' } : {}}
                      >
                        <p className="text-sm">{msg.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {new Date(msg.createdAt).toLocaleString()}
                        </p>
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
              <Label>Message</Label>
              <Textarea
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                rows={5}
                placeholder="Enter your message..."
              />
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
              <Label>Message</Label>
              <Textarea
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                rows={5}
                placeholder="Enter your message..."
              />
            </div>
            <div>
              <Label>Filter by Application Status</Label>
              <Select 
                value={bulkFilters.status || ""} 
                onValueChange={(value) => setBulkFilters({ ...bulkFilters, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All statuses</SelectItem>
                  <SelectItem value="applied">Applied</SelectItem>
                  <SelectItem value="shortlisted">Shortlisted</SelectItem>
                  <SelectItem value="interview">Interview</SelectItem>
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
    </div>
  );
}
