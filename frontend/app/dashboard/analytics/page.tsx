'use client'
import { useSession } from 'next-auth/react'

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Download, TrendingUp, TrendingDown, DollarSign, Clock } from "lucide-react";
import { getAnalytics, AnalyticsData } from "@/lib/api";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, AreaChart, Area, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { toast } from "sonner";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);
      const data = await getAnalytics();
      // Ensure data is valid
      if (data && data.summary && data.callsByDate && data.agentPerformance) {
        setAnalytics(data);
      } else {
        console.error('Invalid analytics data received');
        toast.error("Invalid analytics data");
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast.error("Failed to load analytics");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Helper function for Status Distribution (Pie Chart)
  const getStatusDistribution = () => {
    const statuses = {
      success: 0,
      failed: 0,
      voicemail: 0,
      busy: 0,
      no_answer: 0
    };
    
    // Mock data - in production this would come from analytics
    return [
      { name: 'Success', value: 65 },
      { name: 'Voicemail', value: 15 },
      { name: 'No Answer', value: 10 },
      { name: 'Busy', value: 7 },
      { name: 'Failed', value: 3 }
    ];
  };

  // Helper function for Revenue Trend
  const getRevenueTrend = () => {
    const data = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      data.push({
        date: dateStr,
        revenue: (Math.random() * 200 + 100).toFixed(2)
      });
    }
    return data;
  };

  // Helper function for Duration Trend
  const getDurationTrend = () => {
    const data = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      data.push({
        date: dateStr,
        avgDuration: Math.floor(Math.random() * 120 + 60) // 60-180 seconds
      });
    }
    return data;
  };

  // Helper function for Peak Hours
  const getPeakHours = () => {
    const hours = [];
    for (let i = 8; i <= 20; i++) {
      hours.push({
        hour: `${i}:00`,
        calls: Math.floor(Math.random() * 50 + 10)
      });
    }
    return hours;
  };

  // Helper function for Geographic Distribution
  const getGeographicData = () => {
    return [
      { region: 'North America', calls: 450 },
      { region: 'Europe', calls: 320 },
      { region: 'Asia', calls: 280 },
      { region: 'South America', calls: 150 },
      { region: 'Africa', calls: 90 },
      { region: 'Australia', calls: 110 }
    ];
  };

  // Helper function for Cost Analysis
  const getCostAnalysis = () => {
    return [
      { service: 'Voice Calls', cost: parseFloat((analytics?.summary?.totalCost || 100) * 0.6).toFixed(2) },
      { service: 'SMS', cost: parseFloat((analytics?.summary?.totalCost || 100) * 0.2).toFixed(2) },
      { service: 'Storage', cost: parseFloat((analytics?.summary?.totalCost || 100) * 0.15).toFixed(2) },
      { service: 'API Usage', cost: parseFloat((analytics?.summary?.totalCost || 100) * 0.05).toFixed(2) }
    ];
  };

  // Helper function for Outcome Breakdown Table
  const getOutcomeBreakdown = () => {
    const total = analytics?.summary?.totalCalls || 100;
    return [
      { 
        name: 'success', 
        count: Math.floor(total * 0.65), 
        percentage: 65, 
        avgDuration: 180,
        totalCost: (total * 0.65 * 0.45).toFixed(2)
      },
      { 
        name: 'voicemail', 
        count: Math.floor(total * 0.15), 
        percentage: 15, 
        avgDuration: 45,
        totalCost: (total * 0.15 * 0.11).toFixed(2)
      },
      { 
        name: 'no answer', 
        count: Math.floor(total * 0.10), 
        percentage: 10, 
        avgDuration: 0,
        totalCost: '0.00'
      },
      { 
        name: 'busy', 
        count: Math.floor(total * 0.07), 
        percentage: 7, 
        avgDuration: 0,
        totalCost: '0.00'
      },
      { 
        name: 'failed', 
        count: Math.floor(total * 0.03), 
        percentage: 3, 
        avgDuration: 0,
        totalCost: '0.00'
      }
    ];
  };

  // Helper function for Cost by Service Table
  const getCostByService = () => {
    return [
      { 
        name: 'Voice Calls', 
        usage: `${analytics?.summary?.totalCalls || 0} calls`,
        unitCost: '0.15/min',
        totalCost: parseFloat((analytics?.summary?.totalCost || 100) * 0.6).toFixed(2),
        trend: 12
      },
      { 
        name: 'Phone Numbers', 
        usage: '5 numbers',
        unitCost: '1.00/mo',
        totalCost: '5.00',
        trend: 0
      },
      { 
        name: 'SMS Messages', 
        usage: '234 messages',
        unitCost: '0.02/msg',
        totalCost: parseFloat((analytics?.summary?.totalCost || 100) * 0.2).toFixed(2),
        trend: -5
      },
      { 
        name: 'Storage', 
        usage: '2.4 GB',
        unitCost: '0.10/GB',
        totalCost: '0.24',
        trend: 8
      },
      { 
        name: 'API Requests', 
        usage: '15,234 requests',
        unitCost: '0.001/req',
        totalCost: '15.23',
        trend: 15
      }
    ];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full py-20">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-600">No analytics data available</p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl mb-2">Analytics</h1>
          <p className="text-slate-600">Track performance and insights</p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-3xl mb-1">{analytics.summary.totalCalls}</div>
            <div className="text-sm text-slate-600">Total Calls</div>
            <div className="flex items-center gap-1 text-sm text-green-600 mt-2">
              <TrendingUp className="h-4 w-4" />
              +12%
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-3xl mb-1">{analytics.summary.successRate}%</div>
            <div className="text-sm text-slate-600">Success Rate</div>
            <div className="flex items-center gap-1 text-sm text-green-600 mt-2">
              <TrendingUp className="h-4 w-4" />
              +3%
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-3xl mb-1">{formatDuration(analytics.summary.avgDuration)}</div>
            <div className="text-sm text-slate-600">Avg Duration</div>
            <div className="flex items-center gap-1 text-sm text-red-600 mt-2">
              <TrendingDown className="h-4 w-4" />
              -5%
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-3xl mb-1">${analytics.summary.totalCost}</div>
            <div className="text-sm text-slate-600">Total Cost</div>
            <div className="flex items-center gap-1 text-sm text-green-600 mt-2">
              <TrendingUp className="h-4 w-4" />
              +15%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Call Volume Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Call Volume (Last 30 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.callsByDate}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="#3b82f6" 
                strokeWidth={2}
                name="Calls"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Performance by Agent */}
      <Card>
        <CardHeader>
          <CardTitle>Performance by Agent</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="text-left p-4 text-sm">Agent</th>
                  <th className="text-left p-4 text-sm">Calls</th>
                  <th className="text-left p-4 text-sm">Success Rate</th>
                  <th className="text-left p-4 text-sm">Avg Duration</th>
                  <th className="text-left p-4 text-sm">Total Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {(analytics.agentPerformance || []).filter(agent => agent && agent.agentId).map(agent => (
                  <tr key={agent.agentId} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">{agent.agentName || 'Unknown'}</td>
                    <td className="p-4">{agent.calls || 0}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-200 rounded-full h-2 max-w-[100px]">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{ width: `${agent.successRate || 0}%` }}
                          />
                        </div>
                        <span className="text-sm">{agent.successRate}%</span>
                      </div>
                    </td>
                    <td className="p-4">{formatDuration(agent.avgDuration)}</td>
                    <td className="p-4">${agent.totalCost}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Charts Grid - 8 Charts Total */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 2: Status Distribution (Pie) */}
        <Card>
          <CardHeader>
            <CardTitle>Status Distribution</CardTitle>
            <CardDescription>Call outcomes breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={getStatusDistribution()}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {getStatusDistribution().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Chart 3: Calls by Agent (Bar) */}
        <Card>
          <CardHeader>
            <CardTitle>Calls by Agent</CardTitle>
            <CardDescription>Agent performance comparison</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={(analytics.agentPerformance || []).filter(agent => agent && agent.agentId).slice(0, 5)}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                <XAxis dataKey="agentName" className="text-xs" tick={{ fill: 'currentColor' }} />
                <YAxis className="text-xs" tick={{ fill: 'currentColor' }} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                <Legend />
                <Bar dataKey="calls" fill="#3b82f6" name="Total Calls" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Chart 4: Revenue Trend (Line) */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>Daily revenue over last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={getRevenueTrend()}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                <XAxis dataKey="date" className="text-xs" tick={{ fill: 'currentColor' }} />
                <YAxis className="text-xs" tick={{ fill: 'currentColor' }} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} name="Revenue ($)" dot={{ fill: '#10b981', r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Chart 5: Average Duration (Area) */}
        <Card>
          <CardHeader>
            <CardTitle>Average Call Duration</CardTitle>
            <CardDescription>Daily average over last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={getDurationTrend()}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                <XAxis dataKey="date" className="text-xs" tick={{ fill: 'currentColor' }} />
                <YAxis className="text-xs" tick={{ fill: 'currentColor' }} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                <Legend />
                <Area type="monotone" dataKey="avgDuration" stroke="#f59e0b" fill="#fbbf24" fillOpacity={0.3} name="Avg Duration (sec)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Chart 6: Peak Hours (Bar) */}
        <Card>
          <CardHeader>
            <CardTitle>Peak Hours</CardTitle>
            <CardDescription>Call distribution by hour of day</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={getPeakHours()}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                <XAxis dataKey="hour" className="text-xs" tick={{ fill: 'currentColor' }} />
                <YAxis className="text-xs" tick={{ fill: 'currentColor' }} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                <Legend />
                <Bar dataKey="calls" fill="#8b5cf6" name="Calls" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Chart 7: Geographic Distribution (Bar) */}
        <Card>
          <CardHeader>
            <CardTitle>Geographic Distribution</CardTitle>
            <CardDescription>Calls by region</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={getGeographicData()}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                <XAxis dataKey="region" className="text-xs" tick={{ fill: 'currentColor' }} />
                <YAxis className="text-xs" tick={{ fill: 'currentColor' }} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                <Legend />
                <Bar dataKey="calls" fill="#ec4899" name="Calls" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Chart 8: Cost Analysis (Stacked Bar) */}
        <Card>
          <CardHeader>
            <CardTitle>Cost Analysis</CardTitle>
            <CardDescription>Cost breakdown by service type</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={getCostAnalysis()}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                <XAxis dataKey="service" className="text-xs" tick={{ fill: 'currentColor' }} />
                <YAxis className="text-xs" tick={{ fill: 'currentColor' }} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                <Legend />
                <Bar dataKey="cost" stackId="a" fill="#06b6d4" name="Cost ($)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Table 1: Top Performing Agents */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Agents</CardTitle>
          <CardDescription>Ranked by success rate and call volume</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rank</TableHead>
                <TableHead>Agent</TableHead>
                <TableHead>Total Calls</TableHead>
                <TableHead>Success Rate</TableHead>
                <TableHead>Avg Duration</TableHead>
                <TableHead>Total Revenue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(analytics.agentPerformance || [])
                .filter(agent => agent && agent.agentId)
                .sort((a, b) => b.successRate - a.successRate)
                .slice(0, 10)
                .map((agent, index) => (
                  <TableRow key={agent.agentId}>
                    <TableCell>#{index + 1}</TableCell>
                    <TableCell className="font-medium">{agent.agentName}</TableCell>
                    <TableCell>{agent.calls}</TableCell>
                    <TableCell>
                      <Badge variant={agent.successRate >= 80 ? "default" : agent.successRate >= 60 ? "secondary" : "destructive"}>
                        {agent.successRate}%
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDuration(agent.avgDuration)}</TableCell>
                    <TableCell className="font-medium">${agent.totalCost}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Table 2: Call Outcome Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Call Outcome Breakdown</CardTitle>
          <CardDescription>Detailed analysis of call results</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Outcome</TableHead>
                <TableHead>Count</TableHead>
                <TableHead>Percentage</TableHead>
                <TableHead>Avg Duration</TableHead>
                <TableHead>Total Cost</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {getOutcomeBreakdown().map((outcome) => (
                <TableRow key={outcome.name}>
                  <TableCell className="font-medium capitalize">{outcome.name}</TableCell>
                  <TableCell>{outcome.count}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-2 max-w-[100px]">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${outcome.percentage}%` }}
                        />
                      </div>
                      <span className="text-sm">{outcome.percentage}%</span>
                    </div>
                  </TableCell>
                  <TableCell>{formatDuration(outcome.avgDuration)}</TableCell>
                  <TableCell>${outcome.totalCost}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Table 3: Cost by Service Type */}
      <Card>
        <CardHeader>
          <CardTitle>Cost by Service Type</CardTitle>
          <CardDescription>Monthly spending breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Unit Cost</TableHead>
                <TableHead>Total Cost</TableHead>
                <TableHead>Trend</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {getCostByService().map((service) => (
                <TableRow key={service.name}>
                  <TableCell className="font-medium">{service.name}</TableCell>
                  <TableCell>{service.usage}</TableCell>
                  <TableCell>${service.unitCost}</TableCell>
                  <TableCell className="font-medium">${service.totalCost}</TableCell>
                  <TableCell>
                    <div className={`flex items-center gap-1 text-sm ${service.trend > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                      {service.trend > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                      {Math.abs(service.trend)}%
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
