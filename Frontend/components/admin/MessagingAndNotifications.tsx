"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MessageSquare,
  Search,
  MoreHorizontal,
  Eye,
  Flag,
  Ban,
  CheckCircle,
  XCircle,
  Clock,
  Send,
  Bell,
  Mail,
  Smartphone,
  Users,
  AlertTriangle,
  Filter,
  Download,
  Settings,
  Volume2,
  VolumeX,
  Loader2,
  BarChart3,
  Sparkles,
} from "lucide-react";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";

interface FlaggedMessage {
  _id: string;
  sender: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  recipient: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  content: string;
  moderationScore: number;
  moderationReason: string;
  flagged: boolean;
  createdAt: string;
  relatedJob?: {
    _id: string;
    title: string;
  };
}

interface Analytics {
  overview: {
    totalMessages: number;
    sentMessages: number;
    receivedMessages: number;
    unreadMessages: number;
    flaggedMessages: number;
  };
  engagement: {
    totalDelivered: number;
    totalOpened: number;
    totalClicked: number;
    openRate: string;
    clickRate: string;
  };
  dailyStats: Array<{
    _id: string;
    count: number;
  }>;
}

export function MessagingAndNotifications() {
  const [selectedTab, setSelectedTab] = useState("flagged");
  const [searchQuery, setSearchQuery] = useState("");
  const [flaggedMessages, setFlaggedMessages] = useState<FlaggedMessage[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<FlaggedMessage | null>(null);
  const [showMessageDetails, setShowMessageDetails] = useState(false);
  const [loading, setLoading] = useState(false);
  const [moderating, setModerating] = useState(false);
  const { toast } = useToast();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    if (selectedTab === "flagged") {
      loadFlaggedMessages();
    } else if (selectedTab === "analytics") {
      loadAnalytics();
    }
  }, [selectedTab]);

  const loadFlaggedMessages = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${apiUrl}/api/v1/messages/flagged`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setFlaggedMessages(response.data.data || []);
      }
    } catch (error: any) {
      console.error('Failed to load flagged messages:', error);
      toast({
        title: "Error",
        description: "Failed to load flagged messages",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${apiUrl}/api/v1/messages/analytics`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setAnalytics(response.data.data);
      }
    } catch (error: any) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateModerationStatus = async (messageId: string, flagged: boolean, reason?: string) => {
    setModerating(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${apiUrl}/api/v1/messages/${messageId}/moderate`,
        {
          flagged,
          moderationReason: reason,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        toast({
          title: "Success",
          description: `Message ${flagged ? 'flagged' : 'unflagged'} successfully`,
        });
        loadFlaggedMessages();
        setShowMessageDetails(false);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update moderation status",
        variant: "destructive",
      });
    } finally {
      setModerating(false);
    }
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const variants = {
      Active: "bg-green-100 text-green-800 border-green-200",
      Archived: "bg-gray-100 text-gray-800 border-gray-200",
      Flagged: "bg-red-100 text-red-800 border-red-200",
      Sent: "bg-green-100 text-green-800 border-green-200",
      Pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      Failed: "bg-red-100 text-red-800 border-red-200",
    };

    return (
      <Badge className={`${variants[status as keyof typeof variants]} border font-medium`}>
        {status}
      </Badge>
    );
  };

  const filteredFlaggedMessages = flaggedMessages.filter(msg => {
    const senderName = `${msg.sender.firstName} ${msg.sender.lastName}`.toLowerCase();
    const recipientName = `${msg.recipient.firstName} ${msg.recipient.lastName}`.toLowerCase();
    const content = msg.content.toLowerCase();
    return senderName.includes(searchQuery.toLowerCase()) ||
           recipientName.includes(searchQuery.toLowerCase()) ||
           content.includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Messaging & Notifications</h2>
          <p className="text-gray-600 mt-1">
            Monitor platform communication, manage notifications, and review flagged content with AI moderation.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="shadow-sm">
            <Download className="h-4 w-4 mr-2" />
            Export Logs
          </Button>
          <Button 
            size="sm"
            className="shadow-sm text-white"
            style={{ backgroundColor: '#02243b' }}
          >
            <Send className="h-4 w-4 mr-2" />
            Send Announcement
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-gray-50">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">Flagged Messages</CardTitle>
              <Flag className="h-4 w-4 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-800">{flaggedMessages.length}</div>
            <div className="text-xs text-red-600 mt-1">Need moderation</div>
          </CardContent>
        </Card>

        {analytics && (
          <>
            <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-blue-700">Total Messages</CardTitle>
                  <MessageSquare className="h-4 w-4 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-800">{analytics.overview.totalMessages}</div>
                <div className="text-xs text-blue-600 mt-1">{analytics.overview.unreadMessages} unread</div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-green-100">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-green-700">Open Rate</CardTitle>
                  <BarChart3 className="h-4 w-4 text-green-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-800">{analytics.engagement.openRate}%</div>
                <div className="text-xs text-green-600 mt-1">{analytics.engagement.totalOpened} opened</div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-purple-100">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-purple-700">Click Rate</CardTitle>
                  <Bell className="h-4 w-4 text-purple-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-800">{analytics.engagement.clickRate}%</div>
                <div className="text-xs text-purple-600 mt-1">{analytics.engagement.totalClicked} clicked</div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3 lg:w-96">
          <TabsTrigger value="flagged">
            <Flag className="h-4 w-4 mr-2" />
            Flagged Messages
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="templates">
            <FileText className="h-4 w-4 mr-2" />
            Templates
          </TabsTrigger>
        </TabsList>

        {/* Flagged Messages Tab */}
        <TabsContent value="flagged" className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardHeader className="border-b border-gray-100">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">AI-Flagged Messages</CardTitle>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search flagged messages..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 w-64 border-gray-200"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-100">
                      <TableHead className="font-semibold text-gray-700">Sender</TableHead>
                      <TableHead className="font-semibold text-gray-700">Recipient</TableHead>
                      <TableHead className="font-semibold text-gray-700">Content Preview</TableHead>
                      <TableHead className="font-semibold text-gray-700">AI Score</TableHead>
                      <TableHead className="font-semibold text-gray-700">Reason</TableHead>
                      <TableHead className="font-semibold text-gray-700">Date</TableHead>
                      <TableHead className="text-right font-semibold text-gray-700">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredFlaggedMessages.length > 0 ? (
                      filteredFlaggedMessages.map((message) => (
                        <TableRow 
                          key={message._id} 
                          className="border-gray-100 hover:bg-gray-50/50 transition-colors cursor-pointer"
                          onClick={() => {
                            setSelectedMessage(message);
                            setShowMessageDetails(true);
                          }}
                        >
                          <TableCell className="py-4">
                            <div className="font-medium text-gray-900">
                              {message.sender.firstName} {message.sender.lastName}
                            </div>
                            <div className="text-sm text-gray-500">{message.sender.email}</div>
                          </TableCell>
                          
                          <TableCell>
                            <div className="font-medium text-gray-900">
                              {message.recipient.firstName} {message.recipient.lastName}
                            </div>
                            <div className="text-sm text-gray-500">{message.recipient.email}</div>
                          </TableCell>
                          
                          <TableCell>
                            <div className="max-w-64 truncate text-sm text-gray-600">
                              {message.content}
                            </div>
                          </TableCell>
                          
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Badge 
                                variant="outline" 
                                className={`${
                                  message.moderationScore < 30 
                                    ? 'border-red-300 text-red-700 bg-red-50'
                                    : message.moderationScore < 50
                                    ? 'border-yellow-300 text-yellow-700 bg-yellow-50'
                                    : 'border-green-300 text-green-700 bg-green-50'
                                }`}
                              >
                                {message.moderationScore}/100
                              </Badge>
                              {message.moderationScore < 50 && (
                                <Sparkles className="h-4 w-4 text-red-600" />
                              )}
                            </div>
                          </TableCell>
                          
                          <TableCell>
                            <div className="text-sm text-red-700 max-w-48 truncate">
                              {message.moderationReason || 'AI detected inappropriate content'}
                            </div>
                          </TableCell>
                          
                          <TableCell className="text-sm text-gray-600">
                            {new Date(message.createdAt).toLocaleDateString()}
                          </TableCell>
                          
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  className="h-8 w-8 p-0 hover:bg-gray-100"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedMessage(message);
                                  setShowMessageDetails(true);
                                }}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={(e) => {
                                  e.stopPropagation();
                                  updateModerationStatus(message._id, false);
                                }}>
                                  <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                                  Approve Message
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={(e) => {
                                  e.stopPropagation();
                                  updateModerationStatus(message._id, true);
                                }} className="text-red-600">
                                  <Ban className="mr-2 h-4 w-4" />
                                  Keep Flagged
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-12">
                          <Flag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No flagged messages</h3>
                          <p className="text-gray-600">All messages have been reviewed and approved.</p>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          {analytics ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Message Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total Messages</span>
                      <span className="font-semibold">{analytics.overview.totalMessages}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Sent</span>
                      <span className="font-semibold">{analytics.overview.sentMessages}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Received</span>
                      <span className="font-semibold">{analytics.overview.receivedMessages}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Unread</span>
                      <span className="font-semibold text-amber-600">{analytics.overview.unreadMessages}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Flagged</span>
                      <span className="font-semibold text-red-600">{analytics.overview.flaggedMessages}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Engagement Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Delivered</span>
                      <span className="font-semibold">{analytics.engagement.totalDelivered}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Opened</span>
                      <span className="font-semibold text-blue-600">{analytics.engagement.totalOpened}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Clicked</span>
                      <span className="font-semibold text-purple-600">{analytics.engagement.totalClicked}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t">
                      <span className="text-sm font-medium text-gray-700">Open Rate</span>
                      <span className="font-bold text-lg text-blue-600">{analytics.engagement.openRate}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Click Rate</span>
                      <span className="font-bold text-lg text-purple-600">{analytics.engagement.clickRate}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="p-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Loading analytics...</p>
            </Card>
          )}
        </TabsContent>

        {/* Templates Tab - Placeholder for template management */}
        <TabsContent value="templates" className="space-y-4">
          <Card className="p-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Template Management</h3>
            <p className="text-gray-600">Template management interface coming soon.</p>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Message Details Dialog */}
      <Dialog open={showMessageDetails} onOpenChange={setShowMessageDetails}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          {selectedMessage && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl font-bold flex items-center gap-2">
                  <Flag className="h-5 w-5 text-red-600" />
                  Flagged Message Details
                </DialogTitle>
                <DialogDescription className="text-gray-600">
                  Review AI-detected content and take moderation action
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Sender</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="font-semibold">
                        {selectedMessage.sender.firstName} {selectedMessage.sender.lastName}
                      </div>
                      <div className="text-sm text-gray-500">{selectedMessage.sender.email}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Recipient</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="font-semibold">
                        {selectedMessage.recipient.firstName} {selectedMessage.recipient.lastName}
                      </div>
                      <div className="text-sm text-gray-500">{selectedMessage.recipient.email}</div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="border-red-200 bg-red-50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base text-red-800 flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      AI Moderation Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-red-700">Moderation Score:</span>
                        <Badge 
                          variant="outline" 
                          className={`${
                            selectedMessage.moderationScore < 30 
                              ? 'border-red-300 text-red-700 bg-red-100'
                              : 'border-yellow-300 text-yellow-700 bg-yellow-100'
                          }`}
                        >
                          {selectedMessage.moderationScore}/100
                        </Badge>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-red-700">Reason:</span>
                        <p className="text-sm text-red-600 mt-1">{selectedMessage.moderationReason || 'AI detected inappropriate content'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Message Content</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedMessage.content}</p>
                    </div>
                    {selectedMessage.relatedJob && (
                      <div className="mt-3 text-sm text-gray-600">
                        Related to: <span className="font-medium">{selectedMessage.relatedJob.title}</span>
                      </div>
                    )}
                    <div className="mt-2 text-xs text-gray-500">
                      Sent: {new Date(selectedMessage.createdAt).toLocaleString()}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setShowMessageDetails(false)}>
                  Close
                </Button>
                <Button
                  variant="outline"
                  className="text-green-600 border-green-300 hover:bg-green-50"
                  onClick={() => updateModerationStatus(selectedMessage._id, false)}
                  disabled={moderating}
                >
                  {moderating ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  Approve Message
                </Button>
                <Button
                  variant="outline"
                  className="text-red-600 border-red-300 hover:bg-red-50"
                  onClick={() => updateModerationStatus(selectedMessage._id, true)}
                  disabled={moderating}
                >
                  {moderating ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Ban className="h-4 w-4 mr-2" />
                  )}
                  Keep Flagged
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
