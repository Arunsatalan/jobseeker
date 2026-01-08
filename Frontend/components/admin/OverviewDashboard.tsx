"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import {
  Users,
  Briefcase,
  FileText,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Activity,
  Globe,
  MapPin,
  Calendar,
  Eye,
  UserPlus,
  Building2,
  RefreshCw,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export function OverviewDashboard() {
  const [dateRange, setDateRange] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const { toast } = useToast();

  // State for data
  const [overviewStats, setOverviewStats] = useState<any>(null);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [userGrowthData, setUserGrowthData] = useState<any[]>([]);
  const [geoData, setGeoData] = useState<any[]>([]);
  const [jobCategoryData, setJobCategoryData] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  const fetchData = async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const [
        overviewRes,
        revenueRes,
        growthRes,
        geoRes,
        activitiesRes
      ] = await Promise.all([
        axios.get(`${apiUrl}/api/v1/admin/stats/overview`, config),
        axios.get(`${apiUrl}/api/v1/admin/stats/revenue`, config),
        axios.get(`${apiUrl}/api/v1/admin/stats/user-growth`, config),
        axios.get(`${apiUrl}/api/v1/admin/stats/geography`, config),
        axios.get(`${apiUrl}/api/v1/admin/stats/activities/recent`, config),
      ]);

      if (overviewRes.data.success) {
        setOverviewStats(overviewRes.data.data);
        setJobCategoryData(
          overviewRes.data.data.jobStats.categories.map((c: any, index: number) => ({
            ...c,
            color: ['#02243b', '#8a4b04', '#10b981', '#f59e0b', '#ef4444'][index % 5]
          }))
        );
      }
      if (revenueRes.data.success) setRevenueData(revenueRes.data.data);
      if (growthRes.data.success) setUserGrowthData(growthRes.data.data);
      if (geoRes.data.success) {
        // Normalize geo data for display percentage, simplified logic for now
        // Assuming backend returns { name, value }
        const total = geoRes.data.data.reduce((acc: number, item: any) => acc + item.value, 0);
        setGeoData(geoRes.data.data.map((item: any) => ({
          province: item.name || 'Unknown',
          users: item.value,
          percentage: total > 0 ? Math.round((item.value / total) * 100) : 0
        })));
      }
      if (activitiesRes.data.success) {
        // Map activity types to UI colors/messages if needed
        setRecentActivities(activitiesRes.data.data.map((a: any) => ({
          ...a,
          timestamp: new Date(a.time).toLocaleString(), // Simple formatting
          message: a.action, // Backend returns 'action'
          severity: a.type === 'job' ? 'success' : a.type === 'user' ? 'info' : 'warning'
        })));
      }

    } catch (error: any) {
      console.error("Failed to fetch admin stats:", error);
      setErrorMessage("Failed to load dashboard data. Please try again.");
      toast({
        title: "Error",
        description: "Could not fetch dashboard statistics.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const StatCard = ({ title, value, change, changeType, icon: Icon, color }: any) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
        <Icon className="h-4 w-4 text-gray-500" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold" style={{ color }}>{value}</div>
        <div className="flex items-center text-xs text-gray-500 mt-1">
          {changeType && (
            <>
              {changeType === 'positive' ? (
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
              )}
              <span className={changeType === 'positive' ? 'text-green-600' : 'text-red-600'}>
                {change}
              </span>
              <span className="ml-1">from last month</span>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (errorMessage && !overviewStats) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center text-red-500">
          <p>{errorMessage}</p>
          <Button onClick={fetchData} className="mt-4" variant="outline">Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with your platform today.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Last 30 days
          </Button>
          <Button
            size="sm"
            style={{ backgroundColor: 'var(--admin-primary)', color: 'white' }}
          >
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={overviewStats?.userStats?.totalUsers?.toLocaleString() || 0}
          change={`+${overviewStats?.userStats?.newRegistrations || 0} New`}
          changeType="positive"
          icon={Users}
          color="var(--admin-primary)"
        />
        <StatCard
          title="Active Jobs"
          value={overviewStats?.jobStats?.activeJobs?.toLocaleString() || 0}
          // change="+8.7%" // We don't have historical job data yet for "change"
          changeType="positive"
          icon={Briefcase}
          color="var(--admin-secondary)"
        />
        <StatCard
          title="Applications"
          value={overviewStats?.jobStats?.totalApplications?.toLocaleString() || 0}
          // change="+15.2%"
          changeType="positive"
          icon={FileText}
          color="#10b981"
        />
        <StatCard
          title="Daily Active Users" // Swapped from Revenue as Revenue might be 0 initially
          value={overviewStats?.userStats?.dailyActiveUsers?.toLocaleString() || 0}
          change="~24h"
          changeType="positive"
          icon={Activity}
          color="#f59e0b"
        />
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* User Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle>User Growth Trend</CardTitle>
            <CardDescription>Monthly growth in users (Registered)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="users"
                  name="New Users"
                  stroke="var(--admin-primary)"
                  fill="var(--admin-primary)"
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Job Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Job Categories Distribution</CardTitle>
            <CardDescription>Current job postings by industry</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              {jobCategoryData.length > 0 ? (
                <PieChart>
                  <Pie
                    data={jobCategoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {jobCategoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || '#cccccc'} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">No job data available</div>
              )}
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Revenue & Geography Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue & Subscriptions</CardTitle>
            <CardDescription>Monthly revenue and subscription growth</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full">
              {revenueData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Bar
                      yAxisId="right"
                      dataKey="subscriptions"
                      fill="var(--admin-accent-500)"
                      opacity={0.3}
                    />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="revenue"
                      stroke="var(--admin-primary)"
                      strokeWidth={3}
                      dot={{ fill: 'var(--admin-primary)' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">No revenue data available yet</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Geographic Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Geographic Distribution</CardTitle>
            <CardDescription>Users by location</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {geoData.length > 0 ? (
                geoData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3 w-3 text-gray-400" />
                      <span className="text-sm font-medium truncate w-24" title={item.province}>{item.province}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2 rounded-full"
                        style={{
                          width: `${Math.min(item.percentage * 2, 80)}px`,
                          backgroundColor: 'var(--admin-primary)',
                          opacity: 0.7
                        }}
                      />
                      <span className="text-xs text-gray-500 w-8">{item.percentage}%</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-8">No location data found</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest platform activities and events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                    <div
                      className={`h-2 w-2 rounded-full mt-2 ${activity.severity === 'success' ? 'bg-green-500' :
                          activity.severity === 'warning' ? 'bg-yellow-500' :
                            'bg-blue-500'
                        }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.message} <span className="text-gray-400 text-xs">by {activity.user}</span>
                      </p>
                      <p className="text-xs text-gray-500">{activity.timestamp}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No recent activity</p>
              )}
            </div>
            <Button variant="outline" className="w-full mt-4">
              <Activity className="h-4 w-4 mr-2" />
              View All Activities
            </Button>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                style={{ borderColor: 'var(--admin-primary)', color: 'var(--admin-primary)' }}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Add New Admin
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                style={{ borderColor: 'var(--admin-secondary)', color: 'var(--admin-secondary)' }}
              >
                <Building2 className="h-4 w-4 mr-2" />
                Verify Employer
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Eye className="h-4 w-4 mr-2" />
                Review Flagged Content
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Globe className="h-4 w-4 mr-2" />
                Platform Settings
              </Button>
            </div>

            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
              <h4 className="font-semibold text-sm text-gray-900">System Health</h4>
              <p className="text-xs text-gray-600 mt-1">All systems operational</p>
              <div className="flex items-center gap-2 mt-2">
                <div className="h-2 w-2 bg-green-500 rounded-full" />
                <span className="text-xs text-gray-500">99.9% uptime</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}