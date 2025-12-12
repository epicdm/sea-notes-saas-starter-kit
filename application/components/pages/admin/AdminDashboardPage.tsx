import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Phone, TrendingUp, DollarSign, Activity, AlertCircle, CheckCircle, Clock, Server, Database, Zap } from "lucide-react";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

// Mock data
const systemMetrics = {
  totalUsers: 1247,
  activeUsers: 892,
  callsToday: 3456,
  callsThisMonth: 89234,
  apiRequests: 234567,
  errorRate: 0.3,
  avgLatency: 145,
  callsInProgress: 23,
};

const callVolumeData = [
  { hour: '00:00', calls: 120 },
  { hour: '04:00', calls: 45 },
  { hour: '08:00', calls: 380 },
  { hour: '12:00', calls: 520 },
  { hour: '16:00', calls: 445 },
  { hour: '20:00', calls: 290 },
  { hour: '23:00', calls: 180 },
];

const revenueData = [
  { date: 'Mon', revenue: 2340 },
  { date: 'Tue', revenue: 2890 },
  { date: 'Wed', revenue: 3120 },
  { date: 'Thu', revenue: 2750 },
  { date: 'Fri', revenue: 4230 },
  { date: 'Sat', revenue: 3890 },
  { date: 'Sun', revenue: 3450 },
];

const geoData = [
  { country: 'United States', calls: 45234, color: '#3b82f6' },
  { country: 'United Kingdom', calls: 12456, color: '#8b5cf6' },
  { country: 'Canada', calls: 8923, color: '#06b6d4' },
  { country: 'Australia', calls: 6734, color: '#10b981' },
  { country: 'Others', calls: 15887, color: '#6b7280' },
];

const systemHealth = [
  { name: 'API Gateway', status: 'healthy', latency: '45ms', uptime: '99.99%' },
  { name: 'Database', status: 'healthy', latency: '12ms', uptime: '99.97%' },
  { name: 'Voice Provider', status: 'degraded', latency: '234ms', uptime: '99.85%' },
  { name: 'Storage', status: 'healthy', latency: '23ms', uptime: '100%' },
  { name: 'Cache', status: 'healthy', latency: '2ms', uptime: '99.99%' },
];

const recentAlerts = [
  { time: '5m ago', severity: 'warning', message: 'High latency detected on Voice Provider' },
  { time: '23m ago', severity: 'info', message: 'Scheduled maintenance completed successfully' },
  { time: '1h ago', severity: 'error', message: 'Rate limit exceeded for user #1234' },
  { time: '2h ago', severity: 'warning', message: 'Database connection pool at 85%' },
];

export function AdminDashboardPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl mb-2">System Dashboard</h1>
        <p className="text-slate-500 dark:text-slate-400">Real-time monitoring and analytics for the entire platform</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
              +12%
            </Badge>
          </div>
          <div className="text-2xl mb-1">{systemMetrics.totalUsers.toLocaleString()}</div>
          <div className="text-sm text-slate-500 dark:text-slate-400">Total Users</div>
          <div className="text-xs text-slate-400 dark:text-slate-500 mt-2">
            {systemMetrics.activeUsers} active today
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Phone className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
              +8%
            </Badge>
          </div>
          <div className="text-2xl mb-1">{systemMetrics.callsToday.toLocaleString()}</div>
          <div className="text-sm text-slate-500 dark:text-slate-400">Calls Today</div>
          <div className="text-xs text-slate-400 dark:text-slate-500 mt-2">
            {systemMetrics.callsInProgress} in progress
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
              +15%
            </Badge>
          </div>
          <div className="text-2xl mb-1">${(revenueData.reduce((sum, d) => sum + d.revenue, 0) / 1000).toFixed(1)}k</div>
          <div className="text-sm text-slate-500 dark:text-slate-400">Revenue (7 days)</div>
          <div className="text-xs text-slate-400 dark:text-slate-500 mt-2">
            MRR: $89.4k
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <Activity className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <Badge variant="secondary" className={systemMetrics.errorRate < 1 ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"}>
              {systemMetrics.errorRate}%
            </Badge>
          </div>
          <div className="text-2xl mb-1">{systemMetrics.avgLatency}ms</div>
          <div className="text-sm text-slate-500 dark:text-slate-400">Avg Latency</div>
          <div className="text-xs text-slate-400 dark:text-slate-500 mt-2">
            {systemMetrics.apiRequests.toLocaleString()} API requests
          </div>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Call Volume Chart */}
        <Card className="p-6">
          <h3 className="mb-4 flex items-center gap-2">
            <Phone className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            Call Volume (24 Hours)
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={callVolumeData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
              <XAxis dataKey="hour" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgb(30 41 59)', 
                  border: 'none', 
                  borderRadius: '8px',
                  color: 'white'
                }} 
              />
              <Area type="monotone" dataKey="calls" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Revenue Chart */}
        <Card className="p-6">
          <h3 className="mb-4 flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
            Revenue (7 Days)
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
              <XAxis dataKey="date" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgb(30 41 59)', 
                  border: 'none', 
                  borderRadius: '8px',
                  color: 'white'
                }} 
              />
              <Bar dataKey="revenue" fill="#10b981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* System Health and Geographic Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Health */}
        <Card className="p-6">
          <h3 className="mb-4 flex items-center gap-2">
            <Server className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            System Health
          </h3>
          <div className="space-y-3">
            {systemHealth.map((service, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div className="flex items-center gap-3">
                  {service.status === 'healthy' ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-yellow-500" />
                  )}
                  <div>
                    <div className="text-sm">{service.name}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {service.latency} • {service.uptime} uptime
                    </div>
                  </div>
                </div>
                <Badge 
                  variant={service.status === 'healthy' ? 'secondary' : 'destructive'}
                  className={service.status === 'healthy' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : ''}
                >
                  {service.status}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Geographic Distribution */}
        <Card className="p-6">
          <h3 className="mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            Geographic Distribution
          </h3>
          <div className="space-y-3">
            {geoData.map((item, idx) => {
              const total = geoData.reduce((sum, d) => sum + d.calls, 0);
              const percentage = ((item.calls / total) * 100).toFixed(1);
              return (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm">{item.country}</span>
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      {item.calls.toLocaleString()} ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full transition-all" 
                      style={{ 
                        width: `${percentage}%`,
                        backgroundColor: item.color
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Recent Alerts */}
      <Card className="p-6">
        <h3 className="mb-4 flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          Recent Alerts & Events
        </h3>
        <div className="space-y-3">
          {recentAlerts.map((alert, idx) => (
            <div key={idx} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div className={`p-1 rounded ${
                alert.severity === 'error' ? 'bg-red-100 dark:bg-red-900/30' :
                alert.severity === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                'bg-blue-100 dark:bg-blue-900/30'
              }`}>
                {alert.severity === 'error' ? (
                  <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                ) : alert.severity === 'warning' ? (
                  <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                ) : (
                  <CheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                )}
              </div>
              <div className="flex-1">
                <div className="text-sm">{alert.message}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {alert.time}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
