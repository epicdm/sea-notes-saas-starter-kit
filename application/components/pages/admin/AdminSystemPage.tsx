import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Server, Database, HardDrive, Cpu, Activity, TrendingUp, TrendingDown, Zap } from "lucide-react";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Progress } from "@/components/ui/progress";

const cpuData = [
  { time: '00:00', usage: 45 },
  { time: '04:00', usage: 23 },
  { time: '08:00', usage: 67 },
  { time: '12:00', usage: 82 },
  { time: '16:00', usage: 78 },
  { time: '20:00', usage: 56 },
  { time: '23:00', usage: 42 },
];

const memoryData = [
  { time: '00:00', usage: 8.2 },
  { time: '04:00', usage: 7.1 },
  { time: '08:00', usage: 11.4 },
  { time: '12:00', usage: 14.2 },
  { time: '16:00', usage: 13.8 },
  { time: '20:00', usage: 10.5 },
  { time: '23:00', usage: 8.9 },
];

const servers = [
  { name: 'api-server-1', status: 'healthy', cpu: 45, memory: 62, requests: 12340, region: 'us-east-1' },
  { name: 'api-server-2', status: 'healthy', cpu: 38, memory: 58, requests: 11230, region: 'us-east-1' },
  { name: 'api-server-3', status: 'degraded', cpu: 89, memory: 91, requests: 8920, region: 'eu-west-1' },
  { name: 'voice-server-1', status: 'healthy', cpu: 52, memory: 67, requests: 23450, region: 'us-east-1' },
  { name: 'voice-server-2', status: 'healthy', cpu: 48, memory: 63, requests: 21340, region: 'eu-west-1' },
];

const databases = [
  { name: 'postgres-primary', status: 'healthy', size: '234 GB', connections: 145, qps: 2340 },
  { name: 'postgres-replica-1', status: 'healthy', size: '234 GB', connections: 89, qps: 1890 },
  { name: 'redis-cache', status: 'healthy', size: '12 GB', connections: 234, qps: 8920 },
];

const storageStats = [
  { type: 'Call Recordings', size: 1.2, percentage: 48 },
  { type: 'User Data', size: 0.4, percentage: 16 },
  { type: 'Logs', size: 0.6, percentage: 24 },
  { type: 'Backups', size: 0.3, percentage: 12 },
];

export function AdminSystemPage() {
  const totalStorage = storageStats.reduce((sum, s) => sum + s.size, 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl mb-2">System & Resources</h1>
        <p className="text-slate-500 dark:text-slate-400">
          Infrastructure monitoring and resource management
        </p>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Cpu className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
              Normal
            </Badge>
          </div>
          <div className="text-2xl mb-1">58%</div>
          <div className="text-sm text-slate-500 dark:text-slate-400">Avg CPU Usage</div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Activity className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
              Normal
            </Badge>
          </div>
          <div className="text-2xl mb-1">11.2 GB</div>
          <div className="text-sm text-slate-500 dark:text-slate-400">Avg Memory Usage</div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Database className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
              Healthy
            </Badge>
          </div>
          <div className="text-2xl mb-1">234 GB</div>
          <div className="text-sm text-slate-500 dark:text-slate-400">Database Size</div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <HardDrive className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
              {((totalStorage / 5) * 100).toFixed(0)}%
            </Badge>
          </div>
          <div className="text-2xl mb-1">{totalStorage.toFixed(1)} TB</div>
          <div className="text-sm text-slate-500 dark:text-slate-400">Storage Used</div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="mb-4 flex items-center gap-2">
            <Cpu className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            CPU Usage (24 Hours)
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={cpuData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
              <XAxis dataKey="time" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgb(30 41 59)', 
                  border: 'none', 
                  borderRadius: '8px',
                  color: 'white'
                }} 
              />
              <Area type="monotone" dataKey="usage" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            Memory Usage (24 Hours)
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={memoryData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
              <XAxis dataKey="time" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgb(30 41 59)', 
                  border: 'none', 
                  borderRadius: '8px',
                  color: 'white'
                }} 
              />
              <Line type="monotone" dataKey="usage" stroke="#8b5cf6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Server Status */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="flex items-center gap-2">
            <Server className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            Server Status
          </h3>
          <Button size="sm">Scale Servers</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b dark:border-slate-700">
              <tr className="text-left text-sm text-slate-500 dark:text-slate-400">
                <th className="pb-3">Server</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">CPU</th>
                <th className="pb-3">Memory</th>
                <th className="pb-3">Requests/min</th>
                <th className="pb-3">Region</th>
              </tr>
            </thead>
            <tbody>
              {servers.map((server, idx) => (
                <tr key={idx} className="border-b dark:border-slate-700">
                  <td className="py-3">{server.name}</td>
                  <td className="py-3">
                    <Badge className={server.status === 'healthy' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'}>
                      {server.status}
                    </Badge>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <Progress value={server.cpu} className="w-20 h-2" />
                      <span className="text-sm">{server.cpu}%</span>
                    </div>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <Progress value={server.memory} className="w-20 h-2" />
                      <span className="text-sm">{server.memory}%</span>
                    </div>
                  </td>
                  <td className="py-3">{server.requests.toLocaleString()}</td>
                  <td className="py-3">{server.region}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Database Status */}
      <Card className="p-6">
        <h3 className="mb-4 flex items-center gap-2">
          <Database className="h-5 w-5 text-green-600 dark:text-green-400" />
          Database Status
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {databases.map((db, idx) => (
            <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <span>{db.name}</span>
                <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  {db.status}
                </Badge>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Size:</span>
                  <span>{db.size}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Connections:</span>
                  <span>{db.connections}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">QPS:</span>
                  <span>{db.qps.toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Storage Breakdown */}
      <Card className="p-6">
        <h3 className="mb-4 flex items-center gap-2">
          <HardDrive className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          Storage Breakdown
        </h3>
        <div className="space-y-4">
          {storageStats.map((item, idx) => (
            <div key={idx}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">{item.type}</span>
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  {item.size.toFixed(1)} TB ({item.percentage}%)
                </span>
              </div>
              <Progress value={item.percentage} className="h-2" />
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t dark:border-slate-700">
          <div className="flex items-center justify-between">
            <span>Total Storage Used</span>
            <span className="text-lg">{totalStorage.toFixed(1)} TB / 5 TB</span>
          </div>
        </div>
      </Card>

      {/* Cost Optimization */}
      <Card className="p-6">
        <h3 className="mb-4 flex items-center gap-2">
          <Zap className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
          Cost Optimization Recommendations
        </h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg">
            <TrendingDown className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div className="flex-1">
              <div className="mb-1">Archive old call recordings</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                Move recordings older than 90 days to cold storage. Potential savings: $450/month
              </div>
            </div>
            <Button size="sm" variant="outline">Apply</Button>
          </div>
          <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg">
            <TrendingDown className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div className="flex-1">
              <div className="mb-1">Downsize api-server-3</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                Server is underutilized. Potential savings: $180/month
              </div>
            </div>
            <Button size="sm" variant="outline">Apply</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
