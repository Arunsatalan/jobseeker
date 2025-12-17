"use client";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, Search, Star, Reply, Trash2, MoreVertical } from "lucide-react";

interface Message {
  id: string;
  candidateName: string;
  jobTitle: string;
  subject: string;
  preview: string;
  date: string;
  isRead: boolean;
  isStarred: boolean;
  type: "application" | "interview" | "general";
}

export function MessagingSystem() {
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      candidateName: "Sarah Johnson",
      jobTitle: "Senior Frontend Developer",
      subject: "Thank you for the interview opportunity",
      preview: "I wanted to thank you for taking the time to interview me yesterday...",
      date: "2025-12-17",
      isRead: false,
      isStarred: true,
      type: "interview",
    },
    {
      id: "2",
      candidateName: "Mike Chen",
      jobTitle: "Product Manager",
      subject: "Follow-up on application status",
      preview: "I hope this email finds you well. I wanted to follow up on my application...",
      date: "2025-12-16",
      isRead: true,
      isStarred: false,
      type: "application",
    },
    {
      id: "3",
      candidateName: "Emily Rodriguez",
      jobTitle: "UX Designer",
      subject: "Portfolio submission",
      preview: "I'm excited to share my portfolio with you as requested...",
      date: "2025-12-15",
      isRead: false,
      isStarred: false,
      type: "general",
    },
  ]);

  const filteredMessages = messages.filter(message => {
    const matchesSearch = message.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.subject.toLowerCase().includes(searchTerm.toLowerCase());
    
    switch (selectedFilter) {
      case "unread":
        return !message.isRead && matchesSearch;
      case "starred":
        return message.isStarred && matchesSearch;
      case "interview":
        return message.type === "interview" && matchesSearch;
      case "application":
        return message.type === "application" && matchesSearch;
      default:
        return matchesSearch;
    }
  });

  const unreadCount = messages.filter(m => !m.isRead).length;
  const starredCount = messages.filter(m => m.isStarred).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
          <p className="text-gray-600">Communicate with candidates</p>
        </div>
        <Button className="text-white" style={{ backgroundColor: '#02243b' }}>
          <MessageCircle className="h-4 w-4 mr-2" />
          New Message
        </Button>
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
                All Messages ({messages.length})
              </Button>
              <Button
                variant={selectedFilter === "unread" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setSelectedFilter("unread")}
              >
                Unread ({unreadCount})
              </Button>
              <Button
                variant={selectedFilter === "starred" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setSelectedFilter("starred")}
              >
                <Star className="h-4 w-4 mr-2" />
                Starred ({starredCount})
              </Button>
              <hr className="my-2" />
              <Button
                variant={selectedFilter === "application" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setSelectedFilter("application")}
              >
                Applications
              </Button>
              <Button
                variant={selectedFilter === "interview" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setSelectedFilter("interview")}
              >
                Interviews
              </Button>
            </div>
          </Card>

          {/* Quick Reply Templates */}
          <Card className="p-4 mt-4">
            <h4 className="font-medium mb-3">Quick Templates</h4>
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full text-left justify-start">
                Interview Invite
              </Button>
              <Button variant="outline" size="sm" className="w-full text-left justify-start">
                Application Received
              </Button>
              <Button variant="outline" size="sm" className="w-full text-left justify-start">
                Rejection Letter
              </Button>
              <Button variant="outline" size="sm" className="w-full text-left justify-start">
                Offer Letter
              </Button>
            </div>
          </Card>
        </div>

        {/* Message List */}
        <div className="lg:col-span-3">
          <Card className="p-6">
            {/* Search */}
            <div className="mb-4">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search messages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Messages */}
            <div className="space-y-3">
              {filteredMessages.map((message) => (
                <div
                  key={message.id}
                  className={`p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                    !message.isRead ? "bg-blue-50 border-blue-200" : "border-gray-200"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`font-medium ${!message.isRead ? "font-semibold" : ""}`}>
                          {message.candidateName}
                        </span>
                        {message.isStarred && <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />}
                        {!message.isRead && <div className="h-2 w-2 rounded-full" style={{ backgroundColor: '#02243b' }} />}
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{message.jobTitle}</p>
                      <p className={`text-sm mb-2 ${!message.isRead ? "font-medium" : ""}`}>
                        {message.subject}
                      </p>
                      <p className="text-sm text-gray-500 line-clamp-2">{message.preview}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <span className="text-xs text-gray-500">{message.date}</span>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-200">
                    <Badge variant="outline" className="text-xs">
                      {message.type}
                    </Badge>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Reply className="h-4 w-4 mr-1" />
                        Reply
                      </Button>
                      <Button size="sm" variant="ghost" className="text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredMessages.length === 0 && (
              <div className="text-center py-8">
                <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No messages found</h3>
                <p className="text-gray-600">No messages match your current filter.</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}