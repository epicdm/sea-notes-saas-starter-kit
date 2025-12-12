import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Users, Phone, Clock, DollarSign } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

const topUsers = [
  { name: "Lisa Anderson", calls: 12456, minutes: 18923, cost: 3890, margin: 72 },
  { name: "Sarah Johnson", calls: 8934, minutes: 12456, cost: 2340, margin: 68 },
  { name: "James Rodriguez", calls: 5123, minutes: 7234, cost: 1450, margin: 65 },
  { name: "Michael Chen", calls: 3421, minutes: 4892, cost: 890, margin: 70 },
  { name: "Emma Wilson", calls: 156, minutes: 234, cost: 45, margin: 45 },
];

const usageByHour = [
  { hour: '00', calls: 234 },
  { hour: '04', calls: 89 },
  { hour: '08', calls: 892 },
  { hour: '12', calls: 1234 },
  { hour: '16', calls: 1456 },
  { hour: '20', calls: 678 },
];

const costAnalysis = [
  { month: 'Jul', infrastructure: 12340, revenue: 79830, margin: 84.5 },
  { month: 'Aug', infrastructure: 14230, revenue: 84230, margin: 83.1 },
  { month: 'Sep', infrastructure: 15920, revenue: 89420, margin: 82.2 },
  { month: 'Oct', infrastructure: 17560, revenue: 94560, margin: 81.4 },
];

export function AdminAnalyticsPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl mb-2">Usage Analytics</h1>
        <p className="text-slate-500 dark:text-slate-400">Per-tenant usage tracking and cost analysis</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="text-2xl mb-1">89,234</div>
          <div className="text-sm text-slate-500 dark:text-slate-400 mb-2">Total Calls (30d)</div>
          <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
            <TrendingUp className="h-3 w-3" />
            +12.5% from last month
          </div>
        </Card>
        <Card className="p-6">
          <div className="text-2xl mb-1">134,567</div>
          <div className="text-sm text-slate-500 dark:text-slate-400 mb-2">Minutes Used</div>
          <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
            <TrendingUp className="h-3 w-3" />
            +8.3% from last month
          </div>
        </Card>
        <Card className="p-6">
          <div className="text-2xl mb-1">$17.5k</div>
          <div className="text-sm text-slate-500 dark:text-slate-400 mb-2">Infrastructure Cost</div>
          <div className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
            <TrendingUp className="h-3 w-3" />
            +10.3% from last month
          </div>
        </Card>
        <Card className="p-6">
          <div className="text-2xl mb-1">81.4%</div>
          <div className="text-sm text-slate-500 dark:text-slate-400 mb-2">Gross Margin</div>
          <div className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
            <TrendingDown className="h-3 w-3" />
            -1.0% from last month
          </div>
        </Card>
      </div>

      {/* Top Users by Usage */}
      <Card className="p-6">
        <h3 className="mb-4 flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          Top Users by Usage
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b dark:border-slate-700">
              <tr className="text-left text-sm text-slate-500 dark:text-slate-400">
                <th className="pb-3">User</th>
                <th className="pb-3">Calls</th>
                <th className="pb-3">Minutes</th>
                <th className="pb-3">Cost</th>
                <th className="pb-3">Margin</th>
              </tr>
            </thead>
            <tbody>
              {topUsers.map((user, idx) => (
                <tr key={idx} className="border-b dark:border-slate-700">
                  <td className="py-3">{user.name}</td>
                  <td className="py-3">{user.calls.toLocaleString()}</td>
                  <td className="py-3">{user.minutes.toLocaleString()}</td>
                  <td className="py-3">${user.cost.toLocaleString()}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${user.margin > 60 ? 'bg-green-500' : 'bg-yellow-500'}`}
                          style={{ width: `${user.margin}%` }}
                        />
                      </div>
                      <span className="text-sm">{user.margin}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Usage Patterns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            Usage by Hour
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={usageByHour}>
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
              <Bar dataKey="calls" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="mb-4 flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
            Cost vs Revenue
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={costAnalysis}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
              <XAxis dataKey="month" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgb(30 41 59)', 
                  border: 'none', 
                  borderRadius: '8px',
                  color: 'white'
                }} 
              />
              <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} name="Revenue" />
              <Line type="monotone" dataKey="infrastructure" stroke="#ef4444" strokeWidth={2} name="Cost" />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Quota Warnings */}
      <Card className="p-6">
        <h3 className="mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          Users Near Quota Limits
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800 rounded-lg">
            <div>
              <div className="mb-1">Emma Wilson</div>
              <div className="text-sm text-slate-500 dark:text-slate-400">Starter Plan • 4,800 / 5,000 minutes used</div>
            </div>
            <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">96%</Badge>
          </div>
          <div className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div>
              <div className="mb-1">Michael Chen</div>
              <div className="text-sm text-slate-500 dark:text-slate-400">Pro Plan • 8,200 / 10,000 minutes used</div>
            </div>
            <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">82%</Badge>
          </div>
        </div>
      </Card>
    </div>
  );
}
