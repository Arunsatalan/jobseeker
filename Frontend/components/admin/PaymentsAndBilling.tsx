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
  CreditCard,
  Search,
  MoreHorizontal,
  Eye,
  RefreshCw,
  Download,
  AlertTriangle,
  DollarSign,
  Calendar,
  TrendingUp,
  TrendingDown,
  Filter,
  Plus,
  Ban,
  CheckCircle,
  XCircle,
  Clock,
  Receipt,
  Building,
  Users,
} from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

// Mock data for subscriptions
const subscriptionData = [
  {
    id: "sub_001",
    employer: {
      id: "emp_001",
      name: "TechCorp Solutions",
      email: "billing@techcorp.com",
      avatar: "https://ui-avatars.com/api/?name=TechCorp&background=02243b&color=fff",
    },
    plan: "Enterprise",
    planId: "enterprise_monthly",
    status: "Active",
    billingCycle: "Monthly",
    amount: 299.00,
    currency: "CAD",
    startDate: "2025-01-01",
    nextBillingDate: "2026-01-01",
    jobPostings: 50,
    usedJobPostings: 32,
    resumeViews: "Unlimited",
    usedResumeViews: 1456,
    featuredListings: 10,
    usedFeaturedListings: 7,
    paymentMethod: "•••• 4532",
    autoRenew: true,
  },
  {
    id: "sub_002",
    employer: {
      id: "emp_002",
      name: "StartupCo Inc",
      email: "finance@startupco.com",
      avatar: "https://ui-avatars.com/api/?name=StartupCo&background=10b981&color=fff",
    },
    plan: "Professional",
    planId: "professional_monthly",
    status: "Past Due",
    billingCycle: "Monthly",
    amount: 99.00,
    currency: "CAD",
    startDate: "2024-06-15",
    nextBillingDate: "2025-12-15",
    jobPostings: 15,
    usedJobPostings: 15,
    resumeViews: 500,
    usedResumeViews: 487,
    featuredListings: 3,
    usedFeaturedListings: 3,
    paymentMethod: "•••• 7891",
    autoRenew: true,
    overdueAmount: 99.00,
    daysPastDue: 3,
  },
  {
    id: "sub_003",
    employer: {
      id: "emp_003",
      name: "Creative Agency",
      email: "admin@creative.agency",
      avatar: "https://ui-avatars.com/api/?name=Creative&background=f59e0b&color=fff",
    },
    plan: "Basic",
    planId: "basic_yearly",
    status: "Active",
    billingCycle: "Yearly",
    amount: 588.00,
    currency: "CAD",
    startDate: "2024-12-01",
    nextBillingDate: "2025-12-01",
    jobPostings: 5,
    usedJobPostings: 2,
    resumeViews: 100,
    usedResumeViews: 34,
    featuredListings: 1,
    usedFeaturedListings: 0,
    paymentMethod: "•••• 1234",
    autoRenew: false,
  },
];

// Mock payment history data
const paymentData = [
  {
    id: "pay_001",
    employer: "TechCorp Solutions",
    employerId: "emp_001",
    amount: 299.00,
    currency: "CAD",
    status: "Completed",
    date: "2025-12-01",
    paymentMethod: "Visa •••• 4532",
    transactionId: "tx_1234567890",
    description: "Enterprise Plan - Monthly",
    invoiceNumber: "INV-2025-0001",
  },
  {
    id: "pay_002",
    employer: "StartupCo Inc",
    employerId: "emp_002",
    amount: 99.00,
    currency: "CAD",
    status: "Failed",
    date: "2025-12-15",
    paymentMethod: "Mastercard •••• 7891",
    transactionId: "tx_1234567891",
    description: "Professional Plan - Monthly",
    invoiceNumber: "INV-2025-0002",
    failureReason: "Insufficient funds",
  },
  {
    id: "pay_003",
    employer: "Creative Agency",
    employerId: "emp_003",
    amount: 588.00,
    currency: "CAD",
    status: "Completed",
    date: "2025-12-01",
    paymentMethod: "Visa •••• 1234",
    transactionId: "tx_1234567892",
    description: "Basic Plan - Yearly",
    invoiceNumber: "INV-2025-0003",
  },
];

// Revenue data for charts
const revenueData = [
  { month: "Jul", monthly: 12400, yearly: 3200 },
  { month: "Aug", monthly: 14200, yearly: 4100 },
  { month: "Sep", monthly: 15800, yearly: 4800 },
  { month: "Oct", monthly: 16900, yearly: 5200 },
  { month: "Nov", monthly: 18200, yearly: 5900 },
  { month: "Dec", monthly: 19800, yearly: 6400 },
];

const planDistribution = [
  { name: "Enterprise", value: 45, color: "#02243b" },
  { name: "Professional", value: 35, color: "#8a4b04" },
  { name: "Basic", value: 20, color: "#10b981" },
];

export function PaymentsAndBilling() {
  const [selectedTab, setSelectedTab] = useState("subscriptions");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubscription, setSelectedSubscription] = useState<any>(null);
  const [showSubscriptionDetails, setShowSubscriptionDetails] = useState(false);

  const StatusBadge = ({ status }: { status: string }) => {
    const variants = {
      Active: "bg-green-100 text-green-800 border-green-200",
      "Past Due": "bg-red-100 text-red-800 border-red-200",
      Cancelled: "bg-gray-100 text-gray-800 border-gray-200",
      Suspended: "bg-yellow-100 text-yellow-800 border-yellow-200",
      Completed: "bg-green-100 text-green-800 border-green-200",
      Failed: "bg-red-100 text-red-800 border-red-200",
      Pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      Refunded: "bg-purple-100 text-purple-800 border-purple-200",
    };

    return (
      <Badge className={`${variants[status as keyof typeof variants]} border font-medium`}>
        {status}
      </Badge>
    );
  };

  const stats = {
    totalRevenue: paymentData.filter(p => p.status === "Completed").reduce((sum, p) => sum + p.amount, 0),
    monthlyRevenue: 19800,
    activeSubscriptions: subscriptionData.filter(s => s.status === "Active").length,
    pastDuePayments: paymentData.filter(p => p.status === "Failed").length,
    totalSubscriptions: subscriptionData.length,
    averageMonthlyRevenue: 16700,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Payments & Billing</h2>
          <p className="text-gray-600 mt-1">
            Manage subscriptions, monitor revenue, and track payment performance across the platform.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="shadow-sm">
            <Download className="h-4 w-4 mr-2" />
            Export Revenue Report
          </Button>
          <Button 
            size="sm"
            className="shadow-sm bg-gradient-to-r from-slate-900 to-slate-700 hover:from-slate-800 hover:to-slate-600"
          >
            <Plus className="h-4 w-4 mr-2" />
            Manual Payment Entry
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-green-700">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-800">${stats.totalRevenue.toLocaleString()}</div>
            <div className="text-xs text-green-600 mt-1">All-time revenue</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-blue-700">Monthly Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-800">${stats.monthlyRevenue.toLocaleString()}</div>
            <div className="text-xs text-blue-600 mt-1 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              +12.5% vs last month
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-purple-100">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-purple-700">Active Subscriptions</CardTitle>
              <Users className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-800">{stats.activeSubscriptions}</div>
            <div className="text-xs text-purple-600 mt-1">of {stats.totalSubscriptions} total</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-red-50 to-red-100">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-red-700">Past Due Payments</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-800">{stats.pastDuePayments}</div>
            <div className="text-xs text-red-600 mt-1">Need attention</div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-0 shadow-sm">
          <CardHeader className="border-b border-gray-100">
            <CardTitle className="text-lg font-semibold">Revenue Trends</CardTitle>
            <CardDescription>Monthly vs yearly subscription revenue over time</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `$${value/1000}K`}
                />
                <Tooltip 
                  formatter={(value: number) => [`$${value.toLocaleString()}`, undefined]}
                  labelFormatter={(label) => `Month: ${label}`}
                />
                <Area
                  type="monotone"
                  dataKey="monthly"
                  stackId="1"
                  stroke="#02243b"
                  fill="#02243b"
                  fillOpacity={0.8}
                  name="Monthly Plans"
                />
                <Area
                  type="monotone"
                  dataKey="yearly"
                  stackId="1"
                  stroke="#8a4b04"
                  fill="#8a4b04"
                  fillOpacity={0.8}
                  name="Yearly Plans"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="border-b border-gray-100">
            <CardTitle className="text-lg font-semibold">Plan Distribution</CardTitle>
            <CardDescription>Current subscription breakdown</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={planDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {planDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, undefined]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-4">
              {planDistribution.map((plan) => (
                <div key={plan.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: plan.color }}
                    />
                    <span className="font-medium">{plan.name}</span>
                  </div>
                  <span className="text-gray-600">{plan.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-2 lg:w-80">
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          <TabsTrigger value="payments">Payment History</TabsTrigger>
        </TabsList>

        {/* Subscriptions Tab */}
        <TabsContent value="subscriptions" className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardHeader className="border-b border-gray-100">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">Active Subscriptions</CardTitle>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search subscriptions..."
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
                    <TableHead className="font-semibold text-gray-700">Employer</TableHead>
                    <TableHead className="font-semibold text-gray-700">Plan Details</TableHead>
                    <TableHead className="font-semibold text-gray-700">Usage</TableHead>
                    <TableHead className="font-semibold text-gray-700">Billing</TableHead>
                    <TableHead className="font-semibold text-gray-700">Status</TableHead>
                    <TableHead className="font-semibold text-gray-700">Next Billing</TableHead>
                    <TableHead className="text-right font-semibold text-gray-700">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscriptionData.map((subscription) => (
                    <TableRow 
                      key={subscription.id} 
                      className="border-gray-100 hover:bg-gray-50/50 transition-colors cursor-pointer"
                      onClick={() => {
                        setSelectedSubscription(subscription);
                        setShowSubscriptionDetails(true);
                      }}
                    >
                      <TableCell className="py-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={subscription.employer.avatar} />
                            <AvatarFallback className="text-xs">
                              {subscription.employer.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-gray-900">{subscription.employer.name}</div>
                            <div className="text-sm text-gray-500">{subscription.employer.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div>
                          <div className="font-medium text-gray-900">{subscription.plan}</div>
                          <div className="text-sm text-gray-500">{subscription.billingCycle}</div>
                          <div className="text-sm text-gray-500">ID: {subscription.planId}</div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="space-y-1 text-sm">
                          <div>Jobs: {subscription.usedJobPostings}/{subscription.jobPostings}</div>
                          <div>Views: {subscription.usedResumeViews}/{subscription.resumeViews === "Unlimited" ? "∞" : subscription.resumeViews}</div>
                          <div>Featured: {subscription.usedFeaturedListings}/{subscription.featuredListings}</div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div>
                          <div className="font-semibold text-gray-900">${subscription.amount.toFixed(2)} {subscription.currency}</div>
                          <div className="text-sm text-gray-500">{subscription.paymentMethod}</div>
                          {subscription.overdueAmount && (
                            <div className="text-sm text-red-600">Overdue: ${subscription.overdueAmount.toFixed(2)}</div>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="space-y-1">
                          <StatusBadge status={subscription.status} />
                          {subscription.status === "Past Due" && subscription.daysPastDue && (
                            <div className="text-xs text-red-600">{subscription.daysPastDue} days overdue</div>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell className="text-sm text-gray-600">
                        {new Date(subscription.nextBillingDate).toLocaleDateString()}
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
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                              <Receipt className="mr-2 h-4 w-4" />
                              View Invoices
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                              <CreditCard className="mr-2 h-4 w-4" />
                              Update Payment Method
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {subscription.status === "Past Due" && (
                              <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                                <RefreshCw className="mr-2 h-4 w-4 text-blue-600" />
                                Retry Payment
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={(e) => e.stopPropagation()} className="text-red-600">
                              <Ban className="mr-2 h-4 w-4" />
                              Suspend Subscription
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

        {/* Payment History Tab */}
        <TabsContent value="payments" className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="text-lg font-semibold">Payment History</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-100">
                    <TableHead className="font-semibold text-gray-700">Employer</TableHead>
                    <TableHead className="font-semibold text-gray-700">Amount</TableHead>
                    <TableHead className="font-semibold text-gray-700">Description</TableHead>
                    <TableHead className="font-semibold text-gray-700">Payment Method</TableHead>
                    <TableHead className="font-semibold text-gray-700">Status</TableHead>
                    <TableHead className="font-semibold text-gray-700">Date</TableHead>
                    <TableHead className="text-right font-semibold text-gray-700">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paymentData.map((payment) => (
                    <TableRow key={payment.id} className="border-gray-100 hover:bg-gray-50/50 transition-colors">
                      <TableCell className="py-4">
                        <div>
                          <div className="font-medium text-gray-900">{payment.employer}</div>
                          <div className="text-sm text-gray-500">{payment.employerId}</div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="font-semibold text-gray-900">
                          ${payment.amount.toFixed(2)} {payment.currency}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div>
                          <div className="font-medium text-gray-900">{payment.description}</div>
                          <div className="text-sm text-gray-500">Invoice: {payment.invoiceNumber}</div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="text-sm text-gray-600">{payment.paymentMethod}</div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="space-y-1">
                          <StatusBadge status={payment.status} />
                          {payment.failureReason && (
                            <div className="text-xs text-red-600">{payment.failureReason}</div>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell className="text-sm text-gray-600">
                        {new Date(payment.date).toLocaleDateString()}
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
                            <DropdownMenuItem>
                              <Download className="mr-2 h-4 w-4" />
                              Download Invoice
                            </DropdownMenuItem>
                            {payment.status === "Failed" && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                  <RefreshCw className="mr-2 h-4 w-4" />
                                  Retry Payment
                                </DropdownMenuItem>
                              </>
                            )}
                            {payment.status === "Completed" && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-purple-600">
                                  <RefreshCw className="mr-2 h-4 w-4" />
                                  Process Refund
                                </DropdownMenuItem>
                              </>
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

      {/* Subscription Details Dialog */}
      <Dialog open={showSubscriptionDetails} onOpenChange={setShowSubscriptionDetails}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          {selectedSubscription && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">Subscription Details</DialogTitle>
                <DialogDescription className="text-gray-600">
                  {selectedSubscription.employer.name} • {selectedSubscription.plan} Plan
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Billing Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Plan:</span>
                        <span className="font-medium">{selectedSubscription.plan}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Amount:</span>
                        <span className="font-medium">${selectedSubscription.amount.toFixed(2)} {selectedSubscription.currency}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Billing Cycle:</span>
                        <span className="font-medium">{selectedSubscription.billingCycle}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Payment Method:</span>
                        <span className="font-medium">{selectedSubscription.paymentMethod}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Auto Renew:</span>
                        <span className="font-medium">{selectedSubscription.autoRenew ? "Yes" : "No"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Next Billing:</span>
                        <span className="font-medium">{new Date(selectedSubscription.nextBillingDate).toLocaleDateString()}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Usage Analytics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-gray-600">Job Postings</span>
                          <span className="text-sm font-medium">{selectedSubscription.usedJobPostings}/{selectedSubscription.jobPostings}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${(selectedSubscription.usedJobPostings / selectedSubscription.jobPostings) * 100}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-gray-600">Resume Views</span>
                          <span className="text-sm font-medium">
                            {selectedSubscription.usedResumeViews}/{selectedSubscription.resumeViews === "Unlimited" ? "∞" : selectedSubscription.resumeViews}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{ 
                              width: selectedSubscription.resumeViews === "Unlimited" 
                                ? "100%" 
                                : `${(selectedSubscription.usedResumeViews / selectedSubscription.resumeViews) * 100}%` 
                            }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-gray-600">Featured Listings</span>
                          <span className="text-sm font-medium">{selectedSubscription.usedFeaturedListings}/{selectedSubscription.featuredListings}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-purple-600 h-2 rounded-full" 
                            style={{ width: `${(selectedSubscription.usedFeaturedListings / selectedSubscription.featuredListings) * 100}%` }}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {selectedSubscription.status === "Past Due" && (
                  <Card className="border-red-200 bg-red-50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base text-red-800 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        Payment Issue
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-red-700 mb-3">
                        This subscription is {selectedSubscription.daysPastDue} days past due with an outstanding amount of 
                        ${selectedSubscription.overdueAmount?.toFixed(2)} {selectedSubscription.currency}.
                      </p>
                      <div className="flex gap-2">
                        <Button size="sm" className="bg-red-600 hover:bg-red-700">
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Retry Payment
                        </Button>
                        <Button variant="outline" size="sm">
                          <CreditCard className="h-4 w-4 mr-2" />
                          Update Payment Method
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setShowSubscriptionDetails(false)}>
                  Close
                </Button>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export Subscription Data
                </Button>
                <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50">
                  <Ban className="h-4 w-4 mr-2" />
                  Suspend Subscription
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}