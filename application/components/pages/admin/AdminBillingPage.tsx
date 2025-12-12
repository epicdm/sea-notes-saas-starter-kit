import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DollarSign, TrendingUp, TrendingDown, AlertCircle, CheckCircle, CreditCard, RefreshCw } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const revenueData = [
  { month: 'Jan', revenue: 42340, mrr: 38900 },
  { month: 'Feb', revenue: 48920, mrr: 42100 },
  { month: 'Mar', revenue: 53210, mrr: 45600 },
  { month: 'Apr', revenue: 58930, mrr: 49200 },
  { month: 'May', revenue: 67240, mrr: 54800 },
  { month: 'Jun', revenue: 73450, mrr: 61300 },
  { month: 'Jul', revenue: 79830, mrr: 68900 },
  { month: 'Aug', revenue: 84230, mrr: 74200 },
  { month: 'Sep', revenue: 89420, mrr: 78900 },
  { month: 'Oct', revenue: 94560, mrr: 84500 },
];

const failedPayments = [
  { id: 1, user: "Emma Wilson", email: "emma@design.co", amount: 49, reason: "Insufficient funds", date: "2024-10-30" },
  { id: 2, user: "Alex Thompson", email: "alex.t@corp.com", amount: 149, reason: "Card expired", date: "2024-10-29" },
  { id: 3, user: "Ryan Martinez", email: "ryan@startup.io", amount: 299, reason: "Payment declined", date: "2024-10-28" },
];

const recentRefunds = [
  { id: 1, user: "Lisa Brown", amount: 149, reason: "Service downtime", date: "2024-10-29", status: "completed" },
  { id: 2, user: "Mark Davis", amount: 49, reason: "Duplicate charge", date: "2024-10-27", status: "pending" },
];

const planDistribution = [
  { plan: 'Starter', users: 623, revenue: 31150 },
  { plan: 'Pro', users: 512, revenue: 76800 },
  { plan: 'Enterprise', users: 112, revenue: 44800 },
];

export function AdminBillingPage() {
  const totalRevenue = revenueData[revenueData.length - 1].revenue;
  const previousRevenue = revenueData[revenueData.length - 2].revenue;
  const revenueGrowth = ((totalRevenue - previousRevenue) / previousRevenue * 100).toFixed(1);
  
  const currentMRR = revenueData[revenueData.length - 1].mrr;
  const previousMRR = revenueData[revenueData.length - 2].mrr;
  const mrrGrowth = ((currentMRR - previousMRR) / previousMRR * 100).toFixed(1);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl mb-2">Billing & Revenue</h1>
        <p className="text-slate-500 dark:text-slate-400">Financial overview and payment management</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
              +{revenueGrowth}%
            </Badge>
          </div>
          <div className="text-2xl mb-1">${(totalRevenue / 1000).toFixed(1)}k</div>
          <div className="text-sm text-slate-500 dark:text-slate-400">Total Revenue (Oct)</div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
              +{mrrGrowth}%
            </Badge>
          </div>
          <div className="text-2xl mb-1">${(currentMRR / 1000).toFixed(1)}k</div>
          <div className="text-sm text-slate-500 dark:text-slate-400">Monthly Recurring Revenue</div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <Badge variant="destructive">{failedPayments.length}</Badge>
          </div>
          <div className="text-2xl mb-1">${failedPayments.reduce((sum, p) => sum + p.amount, 0)}</div>
          <div className="text-sm text-slate-500 dark:text-slate-400">Failed Payments</div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <CreditCard className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <Badge variant="secondary">${(currentMRR * 12 / 1000).toFixed(0)}k</Badge>
          </div>
          <div className="text-2xl mb-1">${((currentMRR * 12) / 1000).toFixed(0)}k</div>
          <div className="text-sm text-slate-500 dark:text-slate-400">ARR (Annual)</div>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card className="p-6">
        <h3 className="mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
          Revenue & MRR Trends
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={revenueData}>
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
            <Line type="monotone" dataKey="mrr" stroke="#3b82f6" strokeWidth={2} name="MRR" />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Plan Distribution */}
      <Card className="p-6">
        <h3 className="mb-4 flex items-center gap-2">
          <BarChart className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          Revenue by Plan
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={planDistribution}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
            <XAxis dataKey="plan" className="text-xs" />
            <YAxis className="text-xs" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgb(30 41 59)', 
                border: 'none', 
                borderRadius: '8px',
                color: 'white'
              }} 
            />
            <Bar dataKey="revenue" fill="#3b82f6" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <div className="grid grid-cols-3 gap-4 mt-4">
          {planDistribution.map((plan, idx) => (
            <div key={idx} className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div className="text-sm text-slate-500 dark:text-slate-400">{plan.plan}</div>
              <div className="text-xl mt-1">{plan.users}</div>
              <div className="text-xs text-slate-400 dark:text-slate-500">${plan.revenue.toLocaleString()}/mo</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Failed Payments */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            Failed Payments - Requires Attention
          </h3>
          <Button size="sm" variant="outline">View All</Button>
        </div>
        <div className="space-y-3">
          {failedPayments.map((payment) => (
            <div key={payment.id} className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span>{payment.user}</span>
                  <Badge variant="destructive" className="text-xs">${payment.amount}</Badge>
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  {payment.email} • {payment.reason} • {payment.date}
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="gap-2">
                  <RefreshCw className="h-3 w-3" />
                  Retry
                </Button>
                <Button size="sm" variant="outline">Contact</Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Recent Refunds */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            Recent Refunds
          </h3>
          <Button size="sm" variant="outline">View All</Button>
        </div>
        <div className="space-y-3">
          {recentRefunds.map((refund) => (
            <div key={refund.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span>{refund.user}</span>
                  <Badge variant="secondary">${refund.amount}</Badge>
                  <Badge className={refund.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'}>
                    {refund.status}
                  </Badge>
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  {refund.reason} • {refund.date}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
