import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Download, Shield, User, DollarSign, Settings, Ban, Eye, FileText } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const auditLogs = [
  {
    id: 1,
    timestamp: "2024-11-01 14:32:45",
    admin: "Admin User",
    action: "user_impersonation",
    target: "sarah.j@company.com",
    details: "Impersonated user to troubleshoot billing issue",
    severity: "high",
    ip: "192.168.1.100"
  },
  {
    id: 2,
    timestamp: "2024-11-01 13:15:22",
    admin: "Admin User",
    action: "user_suspension",
    target: "james.r@sales.com",
    details: "Suspended user account due to quota violation",
    severity: "critical",
    ip: "192.168.1.100"
  },
  {
    id: 3,
    timestamp: "2024-11-01 11:45:10",
    admin: "Support Agent",
    action: "billing_adjustment",
    target: "lisa@tech.io",
    details: "Applied $100 credit for service downtime",
    severity: "medium",
    ip: "192.168.1.105"
  },
  {
    id: 4,
    timestamp: "2024-11-01 10:20:33",
    admin: "Admin User",
    action: "data_export",
    target: "emma@design.co",
    details: "Exported user data for GDPR request",
    severity: "high",
    ip: "192.168.1.100"
  },
  {
    id: 5,
    timestamp: "2024-11-01 09:05:18",
    admin: "Admin User",
    action: "settings_change",
    target: "System Settings",
    details: "Updated default rate limits from 1000 to 1500 req/min",
    severity: "medium",
    ip: "192.168.1.100"
  },
  {
    id: 6,
    timestamp: "2024-10-31 16:42:55",
    admin: "Support Agent",
    action: "user_view",
    target: "michael.c@startup.io",
    details: "Viewed user profile for support ticket #1234",
    severity: "low",
    ip: "192.168.1.105"
  },
  {
    id: 7,
    timestamp: "2024-10-31 15:30:12",
    admin: "Admin User",
    action: "refund_issued",
    target: "lisa.brown@corp.com",
    details: "Issued refund of $149 for duplicate charge",
    severity: "medium",
    ip: "192.168.1.100"
  },
  {
    id: 8,
    timestamp: "2024-10-31 14:18:45",
    admin: "Admin User",
    action: "user_deletion",
    target: "deleted_user@example.com",
    details: "Permanently deleted user account and all data",
    severity: "critical",
    ip: "192.168.1.100"
  },
];

const actionIcons: Record<string, any> = {
  user_impersonation: Shield,
  user_suspension: Ban,
  billing_adjustment: DollarSign,
  data_export: FileText,
  settings_change: Settings,
  user_view: Eye,
  refund_issued: DollarSign,
  user_deletion: User,
};

export function AdminAuditLogsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterAction, setFilterAction] = useState("all");
  const [filterSeverity, setFilterSeverity] = useState("all");

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = log.admin.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         log.target.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         log.details.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAction = filterAction === "all" || log.action === filterAction;
    const matchesSeverity = filterSeverity === "all" || log.severity === filterSeverity;
    return matchesSearch && matchesAction && matchesSeverity;
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'high': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
      case 'medium': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'low': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl mb-2">Audit Logs</h1>
          <p className="text-slate-500 dark:text-slate-400">
            Track all administrative actions for compliance and security
          </p>
        </div>
        <Button className="gap-2">
          <Download className="h-4 w-4" />
          Export Logs
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-2xl mb-1">{auditLogs.length}</div>
          <div className="text-sm text-slate-500 dark:text-slate-400">Total Actions (30d)</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl mb-1">{auditLogs.filter(l => l.severity === 'critical').length}</div>
          <div className="text-sm text-slate-500 dark:text-slate-400">Critical Actions</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl mb-1">2</div>
          <div className="text-sm text-slate-500 dark:text-slate-400">Active Admins</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl mb-1">100%</div>
          <div className="text-sm text-slate-500 dark:text-slate-400">Compliance Rate</div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search logs..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={filterAction} onValueChange={setFilterAction}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Action Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              <SelectItem value="user_impersonation">Impersonation</SelectItem>
              <SelectItem value="user_suspension">Suspension</SelectItem>
              <SelectItem value="billing_adjustment">Billing</SelectItem>
              <SelectItem value="data_export">Data Export</SelectItem>
              <SelectItem value="settings_change">Settings</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterSeverity} onValueChange={setFilterSeverity}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severity</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Logs Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b dark:border-slate-700">
              <tr className="text-left text-sm text-slate-500 dark:text-slate-400">
                <th className="p-4">Timestamp</th>
                <th className="p-4">Admin</th>
                <th className="p-4">Action</th>
                <th className="p-4">Target</th>
                <th className="p-4">Details</th>
                <th className="p-4">Severity</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => {
                const Icon = actionIcons[log.action] || FileText;
                return (
                  <tr key={log.id} className="border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-4">
                      <div className="text-sm">{log.timestamp}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{log.ip}</div>
                    </td>
                    <td className="p-4">{log.admin}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-slate-400" />
                        <span className="text-sm">{log.action.replace(/_/g, ' ')}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm">{log.target}</td>
                    <td className="p-4 text-sm text-slate-600 dark:text-slate-400 max-w-md truncate">
                      {log.details}
                    </td>
                    <td className="p-4">
                      <Badge className={getSeverityColor(log.severity)}>{log.severity}</Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
