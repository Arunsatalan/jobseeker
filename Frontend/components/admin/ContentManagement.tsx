"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  FileText,
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Plus,
  Calendar,
  Users,
  Globe,
  Image,
  Video,
  Download,
  Upload,
  Save,
  X,
  CheckCircle,
  Clock,
  AlertTriangle,
  Filter,
  Bookmark,
  Share,
  Tag,
} from "lucide-react";

// Mock data for content management
const contentData = [
  {
    id: "content_001",
    title: "How to Write an Effective Resume in 2025",
    type: "Blog Post",
    category: "Career Tips",
    status: "Published",
    author: {
      id: "admin_001",
      name: "Sarah Wilson",
      avatar: "https://ui-avatars.com/api/?name=Sarah+Wilson&background=02243b&color=fff",
    },
    publishedDate: "2025-12-10",
    lastModified: "2025-12-15",
    views: 1456,
    likes: 89,
    shares: 23,
    featured: true,
    tags: ["resume", "career", "job search", "tips"],
    excerpt: "Learn the essential elements of a modern resume that will get you noticed by employers in today's competitive job market.",
  },
  {
    id: "content_002",
    title: "Top 10 In-Demand Jobs in Canada 2025",
    type: "Article",
    category: "Market Insights",
    status: "Draft",
    author: {
      id: "admin_002",
      name: "Michael Chen",
      avatar: "https://ui-avatars.com/api/?name=Michael+Chen&background=10b981&color=fff",
    },
    publishedDate: null,
    lastModified: "2025-12-16",
    views: 0,
    likes: 0,
    shares: 0,
    featured: false,
    tags: ["jobs", "market", "canada", "trends"],
    excerpt: "Discover the most sought-after careers in Canada and what skills you need to land these positions.",
  },
  {
    id: "content_003",
    title: "Interview Success Guide",
    type: "Video",
    category: "Interview Prep",
    status: "Published",
    author: {
      id: "admin_003",
      name: "Lisa Rodriguez",
      avatar: "https://ui-avatars.com/api/?name=Lisa+Rodriguez&background=f59e0b&color=fff",
    },
    publishedDate: "2025-12-08",
    lastModified: "2025-12-08",
    views: 2341,
    likes: 156,
    shares: 78,
    featured: true,
    tags: ["interview", "preparation", "success", "video"],
    excerpt: "A comprehensive video guide covering everything from pre-interview preparation to follow-up strategies.",
  },
  {
    id: "content_004",
    title: "Networking Tips for Job Seekers",
    type: "Blog Post",
    category: "Networking",
    status: "Under Review",
    author: {
      id: "admin_004",
      name: "David Thompson",
      avatar: "https://ui-avatars.com/api/?name=David+Thompson&background=8b5cf6&color=fff",
    },
    publishedDate: null,
    lastModified: "2025-12-14",
    views: 0,
    likes: 0,
    shares: 0,
    featured: false,
    tags: ["networking", "job search", "career", "professional"],
    excerpt: "Build meaningful professional relationships that can open doors to new career opportunities.",
  },
];

// Mock data for pages
const pageData = [
  {
    id: "page_001",
    title: "About Us",
    slug: "/about",
    status: "Published",
    lastModified: "2025-12-05",
    template: "Default",
    views: 5432,
    isHomepage: false,
    seoOptimized: true,
  },
  {
    id: "page_002",
    title: "Privacy Policy",
    slug: "/privacy",
    status: "Published",
    lastModified: "2025-11-20",
    template: "Legal",
    views: 2187,
    isHomepage: false,
    seoOptimized: true,
  },
  {
    id: "page_003",
    title: "Homepage",
    slug: "/",
    status: "Published",
    lastModified: "2025-12-16",
    template: "Homepage",
    views: 15678,
    isHomepage: true,
    seoOptimized: true,
  },
  {
    id: "page_004",
    title: "FAQ",
    slug: "/faq",
    status: "Draft",
    lastModified: "2025-12-12",
    template: "FAQ",
    views: 0,
    isHomepage: false,
    seoOptimized: false,
  },
];

// Mock data for media files
const mediaData = [
  {
    id: "media_001",
    name: "resume-template-preview.jpg",
    type: "Image",
    size: "245 KB",
    uploadDate: "2025-12-15",
    uploadedBy: "Sarah Wilson",
    url: "https://via.placeholder.com/300x200",
    usageCount: 5,
    tags: ["resume", "template", "preview"],
  },
  {
    id: "media_002",
    name: "interview-tips-video.mp4",
    type: "Video",
    size: "12.5 MB",
    uploadDate: "2025-12-08",
    uploadedBy: "Lisa Rodriguez",
    url: "#",
    usageCount: 2,
    tags: ["interview", "video", "tips"],
  },
  {
    id: "media_003",
    name: "company-logo.png",
    type: "Image",
    size: "89 KB",
    uploadDate: "2025-12-01",
    uploadedBy: "Michael Chen",
    url: "https://via.placeholder.com/150x150",
    usageCount: 12,
    tags: ["logo", "brand", "company"],
  },
];

export function ContentManagement() {
  const [selectedTab, setSelectedTab] = useState("content");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContent, setSelectedContent] = useState<any>(null);
  const [showContentEditor, setShowContentEditor] = useState(false);
  const [showMediaUpload, setShowMediaUpload] = useState(false);

  const StatusBadge = ({ status }: { status: string }) => {
    const variants = {
      Published: "bg-green-100 text-green-800 border-green-200",
      Draft: "bg-yellow-100 text-yellow-800 border-yellow-200",
      "Under Review": "bg-blue-100 text-blue-800 border-blue-200",
      Archived: "bg-gray-100 text-gray-800 border-gray-200",
    };

    const icons = {
      Published: <CheckCircle className="w-3 h-3 mr-1" />,
      Draft: <Clock className="w-3 h-3 mr-1" />,
      "Under Review": <Eye className="w-3 h-3 mr-1" />,
      Archived: <X className="w-3 h-3 mr-1" />,
    };

    return (
      <Badge className={`${variants[status as keyof typeof variants]} border font-medium flex items-center`}>
        {icons[status as keyof typeof icons]}
        {status}
      </Badge>
    );
  };

  const TypeIcon = ({ type }: { type: string }) => {
    const icons = {
      "Blog Post": <FileText className="h-4 w-4" />,
      Article: <FileText className="h-4 w-4" />,
      Video: <Video className="h-4 w-4" />,
      Image: <Image className="h-4 w-4" />,
      Page: <Globe className="h-4 w-4" />,
    };

    return icons[type as keyof typeof icons] || <FileText className="h-4 w-4" />;
  };

  const stats = {
    totalContent: contentData.length,
    publishedContent: contentData.filter(c => c.status === "Published").length,
    draftContent: contentData.filter(c => c.status === "Draft").length,
    totalViews: contentData.reduce((sum, c) => sum + c.views, 0),
    totalPages: pageData.length,
    mediaFiles: mediaData.length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Content Management</h2>
          <p className="text-gray-600 mt-1">
            Create, edit, and manage website content, pages, and media assets.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="shadow-sm">
            <Download className="h-4 w-4 mr-2" />
            Export Content
          </Button>
          <Button 
            size="sm"
            className="shadow-sm bg-gradient-to-r from-slate-900 to-slate-700 hover:from-slate-800 hover:to-slate-600"
            onClick={() => {
              setSelectedContent(null);
              setShowContentEditor(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Content
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-blue-700">Total Content</CardTitle>
              <FileText className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-800">{stats.totalContent}</div>
            <div className="text-xs text-blue-600 mt-1">{stats.publishedContent} published</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-green-700">Total Views</CardTitle>
              <Eye className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-800">{stats.totalViews.toLocaleString()}</div>
            <div className="text-xs text-green-600 mt-1">This month</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-purple-100">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-purple-700">Pages</CardTitle>
              <Globe className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-800">{stats.totalPages}</div>
            <div className="text-xs text-purple-600 mt-1">Active pages</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-yellow-50 to-yellow-100">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-yellow-700">Media Files</CardTitle>
              <Image className="h-4 w-4 text-yellow-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-800">{stats.mediaFiles}</div>
            <div className="text-xs text-yellow-600 mt-1">Images & videos</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3 lg:w-96">
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="pages">Pages</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
        </TabsList>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardHeader className="border-b border-gray-100">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">Content Library</CardTitle>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search content..."
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
                    <TableHead className="font-semibold text-gray-700">Title</TableHead>
                    <TableHead className="font-semibold text-gray-700">Type</TableHead>
                    <TableHead className="font-semibold text-gray-700">Author</TableHead>
                    <TableHead className="font-semibold text-gray-700">Status</TableHead>
                    <TableHead className="font-semibold text-gray-700">Analytics</TableHead>
                    <TableHead className="font-semibold text-gray-700">Last Modified</TableHead>
                    <TableHead className="text-right font-semibold text-gray-700">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contentData.map((content) => (
                    <TableRow 
                      key={content.id} 
                      className="border-gray-100 hover:bg-gray-50/50 transition-colors cursor-pointer"
                      onClick={() => {
                        setSelectedContent(content);
                        setShowContentEditor(true);
                      }}
                    >
                      <TableCell className="py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <TypeIcon type={content.type} />
                            <span className="font-medium text-gray-900">{content.title}</span>
                            {content.featured && (
                              <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 text-xs">
                                <Bookmark className="w-3 h-3 mr-1" />
                                Featured
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-gray-500 max-w-96 truncate">{content.excerpt}</div>
                          <div className="flex gap-1">
                            {content.tags.slice(0, 3).map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {content.tags.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{content.tags.length - 3}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div>
                          <div className="font-medium text-gray-900">{content.type}</div>
                          <div className="text-sm text-gray-500">{content.category}</div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={content.author.avatar} />
                            <AvatarFallback className="text-xs">
                              {content.author.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">{content.author.name}</span>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <StatusBadge status={content.status} />
                      </TableCell>
                      
                      <TableCell>
                        <div className="text-sm space-y-1">
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {content.views.toLocaleString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="text-red-500">❤</span>
                              {content.likes}
                            </span>
                            <span className="flex items-center gap-1">
                              <Share className="h-3 w-3" />
                              {content.shares}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell className="text-sm text-gray-600">
                        {new Date(content.lastModified).toLocaleDateString()}
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
                              Preview
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                              <Share className="mr-2 h-4 w-4" />
                              Share
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {content.status === "Published" ? (
                              <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                                <X className="mr-2 h-4 w-4 text-yellow-600" />
                                Unpublish
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                                <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                                Publish
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={(e) => e.stopPropagation()} className="text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
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

        {/* Pages Tab */}
        <TabsContent value="pages" className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardHeader className="border-b border-gray-100">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">Website Pages</CardTitle>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Page
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-100">
                    <TableHead className="font-semibold text-gray-700">Page Title</TableHead>
                    <TableHead className="font-semibold text-gray-700">URL</TableHead>
                    <TableHead className="font-semibold text-gray-700">Template</TableHead>
                    <TableHead className="font-semibold text-gray-700">Status</TableHead>
                    <TableHead className="font-semibold text-gray-700">Views</TableHead>
                    <TableHead className="font-semibold text-gray-700">Last Modified</TableHead>
                    <TableHead className="text-right font-semibold text-gray-700">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pageData.map((page) => (
                    <TableRow key={page.id} className="border-gray-100 hover:bg-gray-50/50 transition-colors">
                      <TableCell className="py-4">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-gray-400" />
                          <span className="font-medium text-gray-900">{page.title}</span>
                          {page.isHomepage && (
                            <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs">
                              Homepage
                            </Badge>
                          )}
                          {page.seoOptimized && (
                            <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
                              SEO ✓
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded">{page.slug}</code>
                      </TableCell>
                      
                      <TableCell>
                        <span className="text-sm text-gray-600">{page.template}</span>
                      </TableCell>
                      
                      <TableCell>
                        <StatusBadge status={page.status} />
                      </TableCell>
                      
                      <TableCell>
                        <span className="font-medium">{page.views.toLocaleString()}</span>
                      </TableCell>
                      
                      <TableCell className="text-sm text-gray-600">
                        {new Date(page.lastModified).toLocaleDateString()}
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
                              View Page
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
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

        {/* Media Tab */}
        <TabsContent value="media" className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardHeader className="border-b border-gray-100">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">Media Library</CardTitle>
                <Button 
                  size="sm" 
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => setShowMediaUpload(true)}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Media
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mediaData.map((media) => (
                  <Card key={media.id} className="border border-gray-200 hover:border-gray-300 transition-colors">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                          {media.type === "Image" ? (
                            <img 
                              src={media.url} 
                              alt={media.name}
                              className="w-full h-full object-cover"
                            />
                          ) : media.type === "Video" ? (
                            <div className="flex items-center justify-center h-full">
                              <Video className="h-12 w-12 text-gray-400" />
                            </div>
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <FileText className="h-12 w-12 text-gray-400" />
                            </div>
                          )}
                        </div>
                        
                        <div>
                          <h3 className="font-medium text-gray-900 truncate">{media.name}</h3>
                          <div className="text-sm text-gray-500 space-y-1">
                            <div className="flex justify-between">
                              <span>Type:</span>
                              <span className="font-medium">{media.type}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Size:</span>
                              <span className="font-medium">{media.size}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Used:</span>
                              <span className="font-medium">{media.usageCount}x</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1">
                          {media.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              <Tag className="w-3 h-3 mr-1" />
                              {tag}
                            </Badge>
                          ))}
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                          <span className="text-xs text-gray-500">
                            {new Date(media.uploadDate).toLocaleDateString()}
                          </span>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                View
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Download className="mr-2 h-4 w-4" />
                                Download
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Details
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Content Editor Dialog */}
      <Dialog open={showContentEditor} onOpenChange={setShowContentEditor}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedContent ? "Edit Content" : "Create New Content"}</DialogTitle>
            <DialogDescription>
              {selectedContent ? `Editing: ${selectedContent.title}` : "Create engaging content for your platform"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contentTitle">Title</Label>
                <Input
                  id="contentTitle"
                  defaultValue={selectedContent?.title || ""}
                  placeholder="Enter content title..."
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="contentType">Type</Label>
                <Select defaultValue={selectedContent?.type || "Blog Post"}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Blog Post">Blog Post</SelectItem>
                    <SelectItem value="Article">Article</SelectItem>
                    <SelectItem value="Video">Video</SelectItem>
                    <SelectItem value="Tutorial">Tutorial</SelectItem>
                    <SelectItem value="News">News</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contentCategory">Category</Label>
                <Select defaultValue={selectedContent?.category || ""}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Career Tips">Career Tips</SelectItem>
                    <SelectItem value="Interview Prep">Interview Prep</SelectItem>
                    <SelectItem value="Market Insights">Market Insights</SelectItem>
                    <SelectItem value="Networking">Networking</SelectItem>
                    <SelectItem value="Resume Building">Resume Building</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="contentStatus">Status</Label>
                <Select defaultValue={selectedContent?.status || "Draft"}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Under Review">Under Review</SelectItem>
                    <SelectItem value="Published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="contentExcerpt">Excerpt</Label>
              <Textarea
                id="contentExcerpt"
                defaultValue={selectedContent?.excerpt || ""}
                placeholder="Brief description of the content..."
                className="mt-1 resize-none"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="contentTags">Tags</Label>
              <Input
                id="contentTags"
                defaultValue={selectedContent?.tags?.join(", ") || ""}
                placeholder="Enter tags separated by commas..."
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="contentBody">Content</Label>
              <Textarea
                id="contentBody"
                placeholder="Write your content here..."
                className="mt-1 resize-none min-h-64"
                rows={12}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowContentEditor(false)}>
              Cancel
            </Button>
            <Button variant="outline">
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Save className="h-4 w-4 mr-2" />
              {selectedContent ? "Update Content" : "Create Content"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Media Upload Dialog */}
      <Dialog open={showMediaUpload} onOpenChange={setShowMediaUpload}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Media</DialogTitle>
            <DialogDescription>
              Upload images, videos, or documents to your media library.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">Drop files here or click to browse</p>
              <p className="text-sm text-gray-500">Supports: JPG, PNG, MP4, PDF (max 10MB)</p>
              <Button className="mt-4">
                <Upload className="h-4 w-4 mr-2" />
                Select Files
              </Button>
            </div>

            <div>
              <Label htmlFor="mediaTags">Tags</Label>
              <Input
                id="mediaTags"
                placeholder="Enter tags separated by commas..."
                className="mt-1"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMediaUpload(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowMediaUpload(false)} className="bg-green-600 hover:bg-green-700">
              <Upload className="h-4 w-4 mr-2" />
              Upload Files
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}