"use client";

import { useState } from "react";
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
} from "lucide-react";

// Mock data for messaging
const conversationData = [
  {
    id: "conv_001",
    participants: {
      jobSeeker: {
        id: "user_001",
        name: "Sarah Johnson",
        avatar: "https://ui-avatars.com/api/?name=Sarah+Johnson&background=02243b&color=fff",
        email: "sarah.j@email.com",
      },
      employer: {
        id: "emp_001",
        name: "TechCorp Solutions",
        avatar: "https://ui-avatars.com/api/?name=TechCorp&background=8a4b04&color=fff",
        contact: "hr@techcorp.com",
      }
    },
    jobTitle: "Senior Full Stack Developer",
    lastMessage: "Thank you for considering my application. I'm excited about the opportunity.",
    lastMessageTime: "2025-12-16 14:30",
    messageCount: 8,
    status: "Active",
    flagged: false,
    priority: "Normal",
  },
  {
    id: "conv_002",
    participants: {
      jobSeeker: {
        id: "user_002",
        name: "Michael Chen",
        avatar: "https://ui-avatars.com/api/?name=Michael+Chen&background=10b981&color=fff",
        email: "m.chen@email.com",
      },
      employer: {
        id: "emp_002",
        name: "Creative Studio Inc",
        avatar: "https://ui-avatars.com/api/?name=Creative+Studio&background=f59e0b&color=fff",
        contact: "talent@creative.com",
      }
    },
    jobTitle: "UX/UI Designer",
    lastMessage: "Could you please share your portfolio link?",
    lastMessageTime: "2025-12-16 11:15",
    messageCount: 5,
    status: "Active",
    flagged: true,
    flagReason: "Potential inappropriate language detected",
    priority: "High",
  },
];

// Mock notification data
const notificationData = [
  {
    id: "notif_001",
    type: "job_status",
    recipient: "user_001",
    recipientName: "Sarah Johnson",
    title: "Application Status Update",
    message: "Your application for Senior Developer at TechCorp has been reviewed.",
    template: "application_reviewed",
    status: "Sent",
    sentDate: "2025-12-16 09:00",
    channel: "Email",
    delivered: true,
    opened: true,
    clicked: false,
  },
  {
    id: "notif_002",
    type: "interview_reminder",
    recipient: "user_002",
    recipientName: "Michael Chen",
    title: "Interview Reminder",
    message: "Don't forget your interview tomorrow at 2 PM with Creative Studio.",
    template: "interview_reminder",
    status: "Pending",
    sentDate: null,
    channel: "Push",
    delivered: false,
    opened: false,
    clicked: false,
  },
  {
    id: "notif_003",
    type: "new_message",
    recipient: "emp_001",
    recipientName: "TechCorp Solutions",
    title: "New Message from Candidate",
    message: "You have received a new message from Sarah Johnson.",
    template: "new_message_employer",
    status: "Failed",
    sentDate: "2025-12-15 16:45",
    channel: "SMS",
    delivered: false,
    opened: false,
    clicked: false,
    error: "Invalid phone number",
  },
];

// Template data
const templateData = [
  {
    id: "template_001",
    name: "Welcome Email",
    type: "welcome",
    subject: "Welcome to CanadaJobs!",
    content: "Welcome to CanadaJobs! We're excited to have you join our community...",
    variables: ["{{name}}", "{{email}}"],
    status: "Active",
    lastModified: "2025-12-10",
    usage: 156,
  },
  {
    id: "template_002",
    name: "Application Received",
    type: "application_confirmation",
    subject: "Application Received - {{job_title}}",
    content: "Thank you for applying to {{job_title}} at {{company_name}}...",
    variables: ["{{name}}", "{{job_title}}", "{{company_name}}"],
    status: "Active",
    lastModified: "2025-12-08",
    usage: 89,
  },
  {
    id: "template_003",
    name: "Interview Reminder",
    type: "interview_reminder",
    subject: "Interview Reminder - {{job_title}}",
    content: "This is a friendly reminder about your upcoming interview...",
    variables: ["{{name}}", "{{job_title}}", "{{interview_date}}", "{{interview_time}}"],
    status: "Active",
    lastModified: "2025-12-05",
    usage: 34,
  },
];

export function MessagingAndNotifications() {
  const [selectedTab, setSelectedTab] = useState("conversations");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [showConversationDetails, setShowConversationDetails] = useState(false);

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

  const ChannelIcon = ({ channel }: { channel: string }) => {
    const icons = {
      Email: <Mail className="w-4 h-4" />,
      SMS: <Smartphone className="w-4 h-4" />,
      Push: <Bell className="w-4 h-4" />,
    };

    return icons[channel as keyof typeof icons] || <Bell className="w-4 h-4" />;
  };

  const stats = {
    totalConversations: conversationData.length,
    activeConversations: conversationData.filter(c => c.status === "Active").length,
    flaggedConversations: conversationData.filter(c => c.flagged).length,
    totalNotifications: notificationData.length,
    deliveredNotifications: notificationData.filter(n => n.delivered).length,
    failedNotifications: notificationData.filter(n => n.status === "Failed").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Messaging & Notifications</h2>
          <p className="text-gray-600 mt-1">
            Monitor platform communication, manage notifications, and review flagged content.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="shadow-sm">
            <Download className="h-4 w-4 mr-2" />
            Export Logs
          </Button>
          <Button 
            size="sm"
            className="shadow-sm bg-gradient-to-r from-slate-900 to-slate-700 hover:from-slate-800 hover:to-slate-600"
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
              <CardTitle className="text-sm font-medium text-gray-600">Total Conversations</CardTitle>
              <MessageSquare className="h-4 w-4 text-gray-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.totalConversations}</div>
            <div className="text-xs text-gray-500 mt-1">{stats.activeConversations} active</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-red-50 to-red-100">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-red-700">Flagged Content</CardTitle>
              <Flag className="h-4 w-4 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-800">{stats.flaggedConversations}</div>
            <div className="text-xs text-red-600 mt-1">Need moderation</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-blue-700">Notifications Sent</CardTitle>
              <Bell className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-800">{stats.totalNotifications}</div>
            <div className="text-xs text-blue-600 mt-1">{stats.deliveredNotifications} delivered</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-yellow-50 to-yellow-100">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-yellow-700">Failed Deliveries</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-800">{stats.failedNotifications}</div>
            <div className="text-xs text-yellow-600 mt-1">Need attention</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3 lg:w-96">
          <TabsTrigger value="conversations">Conversations</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        {/* Conversations Tab */}
        <TabsContent value="conversations" className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardHeader className="border-b border-gray-100">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">Platform Conversations</CardTitle>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search conversations..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 w-64 border-gray-200"
                    />
                  </div>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-100">
                    <TableHead className="font-semibold text-gray-700">Participants</TableHead>
                    <TableHead className="font-semibold text-gray-700">Job Title</TableHead>
                    <TableHead className="font-semibold text-gray-700">Last Message</TableHead>
                    <TableHead className="font-semibold text-gray-700">Status</TableHead>
                    <TableHead className="font-semibold text-gray-700">Messages</TableHead>
                    <TableHead className="font-semibold text-gray-700">Last Activity</TableHead>
                    <TableHead className="text-right font-semibold text-gray-700">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {conversationData.map((conversation) => (
                    <TableRow 
                      key={conversation.id} 
                      className="border-gray-100 hover:bg-gray-50/50 transition-colors cursor-pointer"
                      onClick={() => {
                        setSelectedConversation(conversation);
                        setShowConversationDetails(true);
                      }}
                    >
                      <TableCell className="py-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={conversation.participants.jobSeeker.avatar} />
                              <AvatarFallback className="text-xs">
                                {conversation.participants.jobSeeker.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium">{conversation.participants.jobSeeker.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={conversation.participants.employer.avatar} />
                              <AvatarFallback className="text-xs">
                                {conversation.participants.employer.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm text-gray-600">{conversation.participants.employer.name}</span>
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="font-medium text-gray-900">{conversation.jobTitle}</div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="max-w-48 truncate text-sm text-gray-600">
                          {conversation.lastMessage}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="space-y-1">
                          <StatusBadge status={conversation.status} />
                          {conversation.flagged && (
                            <Badge variant="outline" className="text-red-600 border-red-300 bg-red-50 block w-fit">
                              <Flag className="w-3 h-3 mr-1" />
                              Flagged
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-gray-900">{conversation.messageCount}</div>
                          <div className="text-xs text-gray-500">messages</div>
                        </div>
                      </TableCell>
                      
                      <TableCell className="text-sm text-gray-600">
                        {new Date(conversation.lastMessageTime).toLocaleDateString()}
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
                            <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Full Thread
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                              <Download className="mr-2 h-4 w-4" />
                              Export Conversation
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {conversation.flagged ? (
                              <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                                <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                                Remove Flag
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                                <Flag className="mr-2 h-4 w-4 text-red-600" />
                                Flag Conversation
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={(e) => e.stopPropagation()} className="text-red-600">
                              <Ban className="mr-2 h-4 w-4" />
                              Archive Conversation
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="text-lg font-semibold">Notification History</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-100">
                    <TableHead className="font-semibold text-gray-700">Recipient</TableHead>
                    <TableHead className="font-semibold text-gray-700">Title & Message</TableHead>
                    <TableHead className="font-semibold text-gray-700">Channel</TableHead>
                    <TableHead className="font-semibold text-gray-700">Status</TableHead>
                    <TableHead className="font-semibold text-gray-700">Engagement</TableHead>
                    <TableHead className="font-semibold text-gray-700">Sent Date</TableHead>
                    <TableHead className="text-right font-semibold text-gray-700">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {notificationData.map((notification) => (
                    <TableRow key={notification.id} className="border-gray-100 hover:bg-gray-50/50 transition-colors">
                      <TableCell className="py-4">
                        <div>
                          <div className="font-medium text-gray-900">{notification.recipientName}</div>
                          <div className="text-sm text-gray-500">{notification.recipient}</div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div>
                          <div className="font-medium text-gray-900">{notification.title}</div>
                          <div className="text-sm text-gray-500 max-w-64 truncate">{notification.message}</div>
                          <div className="text-xs text-gray-400 mt-1">Template: {notification.template}</div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <ChannelIcon channel={notification.channel} />
                          <span className="text-sm font-medium">{notification.channel}</span>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="space-y-1">
                          <StatusBadge status={notification.status} />
                          {notification.error && (
                            <div className="text-xs text-red-600">{notification.error}</div>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-3 text-xs">
                          <div className="flex items-center gap-1">
                            {notification.delivered ? (
                              <CheckCircle className="h-3 w-3 text-green-600" />
                            ) : (
                              <XCircle className="h-3 w-3 text-red-600" />
                            )}
                            <span>Delivered</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {notification.opened ? (
                              <Eye className="h-3 w-3 text-blue-600" />
                            ) : (
                              <Eye className="h-3 w-3 text-gray-400" />
                            )}
                            <span>Opened</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {notification.clicked ? (
                              <CheckCircle className="h-3 w-3 text-purple-600" />
                            ) : (
                              <CheckCircle className="h-3 w-3 text-gray-400" />
                            )}
                            <span>Clicked</span>
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell className="text-sm text-gray-600">
                        {notification.sentDate ? new Date(notification.sentDate).toLocaleDateString() : "Pending"}
                      </TableCell>
                      
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-gray-100">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            {notification.status === "Failed" && (
                              <DropdownMenuItem>
                                <Send className="mr-2 h-4 w-4" />
                                Resend
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardHeader className="border-b border-gray-100">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">Message Templates</CardTitle>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  <Settings className="h-4 w-4 mr-2" />
                  Create Template
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-100">
                    <TableHead className="font-semibold text-gray-700">Template Name</TableHead>
                    <TableHead className="font-semibold text-gray-700">Type</TableHead>
                    <TableHead className="font-semibold text-gray-700">Subject</TableHead>
                    <TableHead className="font-semibold text-gray-700">Variables</TableHead>
                    <TableHead className="font-semibold text-gray-700">Usage</TableHead>
                    <TableHead className="font-semibold text-gray-700">Status</TableHead>
                    <TableHead className="text-right font-semibold text-gray-700">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templateData.map((template) => (
                    <TableRow key={template.id} className="border-gray-100 hover:bg-gray-50/50 transition-colors">
                      <TableCell className="py-4">
                        <div>
                          <div className="font-medium text-gray-900">{template.name}</div>
                          <div className="text-sm text-gray-500">Modified {template.lastModified}</div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <Badge variant="outline" className="border-gray-300">
                          {template.type}
                        </Badge>
                      </TableCell>
                      
                      <TableCell>
                        <div className="font-medium text-gray-900 max-w-64 truncate">{template.subject}</div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex flex-wrap gap-1 max-w-48">
                          {template.variables.slice(0, 2).map((variable, index) => (
                            <Badge key={index} variant="outline" className="text-xs border-blue-200 text-blue-700 bg-blue-50">
                              {variable}
                            </Badge>
                          ))}
                          {template.variables.length > 2 && (
                            <Badge variant="outline" className="text-xs border-gray-200">
                              +{template.variables.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-gray-900">{template.usage}</div>
                          <div className="text-xs text-gray-500">times used</div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <StatusBadge status={template.status} />
                      </TableCell>
                      
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-gray-100">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              Preview
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Settings className="mr-2 h-4 w-4" />
                              Edit Template
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Send className="mr-2 h-4 w-4" />
                              Test Send
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {template.status === "Active" ? (
                              <DropdownMenuItem className="text-orange-600">
                                <VolumeX className="mr-2 h-4 w-4" />
                                Disable
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem className="text-green-600">
                                <Volume2 className="mr-2 h-4 w-4" />
                                Enable
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Conversation Details Dialog */}
      <Dialog open={showConversationDetails} onOpenChange={setShowConversationDetails}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          {selectedConversation && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">Conversation Details</DialogTitle>
                <DialogDescription className="text-gray-600">
                  {selectedConversation.jobTitle} • ID: {selectedConversation.id}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Job Seeker</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={selectedConversation.participants.jobSeeker.avatar} />
                          <AvatarFallback>
                            {selectedConversation.participants.jobSeeker.name.split(' ').map((n: string) => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-semibold">{selectedConversation.participants.jobSeeker.name}</div>
                          <div className="text-sm text-gray-500">{selectedConversation.participants.jobSeeker.email}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Employer</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={selectedConversation.participants.employer.avatar} />
                          <AvatarFallback>
                            {selectedConversation.participants.employer.name.split(' ').map((n: string) => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-semibold">{selectedConversation.participants.employer.name}</div>
                          <div className="text-sm text-gray-500">{selectedConversation.participants.employer.contact}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {selectedConversation.flagged && (
                  <Card className="border-red-200 bg-red-50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base text-red-800 flex items-center gap-2">
                        <Flag className="h-4 w-4" />
                        Flagged Content
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-red-700">{selectedConversation.flagReason}</p>
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Recent Messages</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="text-sm font-medium text-gray-900">{selectedConversation.participants.jobSeeker.name}</div>
                        <div className="text-sm text-gray-700 mt-1">{selectedConversation.lastMessage}</div>
                        <div className="text-xs text-gray-500 mt-1">{selectedConversation.lastMessageTime}</div>
                      </div>
                      <div className="text-center text-sm text-gray-500">
                        {selectedConversation.messageCount} total messages in this conversation
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setShowConversationDetails(false)}>
                  Close
                </Button>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export Full Thread
                </Button>
                {selectedConversation.flagged ? (
                  <Button className="bg-green-600 hover:bg-green-700">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Remove Flag
                  </Button>
                ) : (
                  <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50">
                    <Flag className="h-4 w-4 mr-2" />
                    Flag Conversation
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}