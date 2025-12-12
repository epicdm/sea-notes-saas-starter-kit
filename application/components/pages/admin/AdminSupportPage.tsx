import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Shield, Eye, Mail, Phone, AlertCircle, Download, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const supportTickets = [
  { id: 1, user: "Emma Wilson", email: "emma@design.co", subject: "Cannot create new agent", priority: "high", status: "open", created: "2 hours ago" },
  { id: 2, user: "Alex Thompson", email: "alex.t@corp.com", subject: "Billing question", priority: "medium", status: "pending", created: "5 hours ago" },
  { id: 3, user: "Ryan Martinez", email: "ryan@startup.io", subject: "API rate limit exceeded", priority: "urgent", status: "open", created: "10 minutes ago" },
];

const recentErrors = [
  { user: "michael.chen@startup.io", error: "API Gateway timeout", count: 12, lastOccurred: "5 min ago" },
  { user: "sarah.j@company.com", error: "Voice provider connection failed", count: 3, lastOccurred: "15 min ago" },
  { user: "james.r@sales.com", error: "Rate limit exceeded", count: 45, lastOccurred: "1 hour ago" },
];

const mockUserData = {
  name: "Emma Wilson",
  email: "emma@design.co",
  plan: "Starter",
  status: "trial",
  joined: "2024-10-28",
  lastActive: "1 day ago",
  agents: 2,
  calls: 156,
  minutes: 234,
  spend: 0,
  recentActivity: [
    { action: "Created agent", timestamp: "2024-10-30 14:30", details: "Customer Support Bot" },
    { action: "Made test call", timestamp: "2024-10-30 14:45", details: "Duration: 2:34" },
    { action: "Updated agent settings", timestamp: "2024-10-31 10:15", details: "Changed voice model" },
  ],
  errorLog: [
    { timestamp: "2024-11-01 11:20", error: "Failed to create agent", message: "API key validation failed" },
  ]
};

export function AdminSupportPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);

  const handleUserSearch = () => {
    if (searchQuery.includes("emma")) {
      setSelectedUser(mockUserData);
      setShowUserDetails(true);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'high': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
      case 'medium': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'low': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl mb-2">Support Tools</h1>
        <p className="text-slate-500 dark:text-slate-400">
          Quick user lookup and troubleshooting tools
        </p>
      </div>

      {/* Quick User Lookup */}
      <Card className="p-6">
        <h3 className="mb-4 flex items-center gap-2">
          <Search className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          Quick User Lookup
        </h3>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by email, name, user ID, or phone number..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleUserSearch()}
            />
          </div>
          <Button onClick={handleUserSearch}>
            Search
          </Button>
        </div>
        <div className="mt-4 text-sm text-slate-500 dark:text-slate-400">
          Try searching: emma@design.co, sarah.j@company.com, +1-555-0123
        </div>
      </Card>

      {/* Active Support Tickets */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            Active Support Tickets
          </h3>
          <Badge variant="destructive">{supportTickets.length}</Badge>
        </div>
        <div className="space-y-3">
          {supportTickets.map((ticket) => (
            <div key={ticket.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span>{ticket.user}</span>
                  <Badge className={getPriorityColor(ticket.priority)}>{ticket.priority}</Badge>
                  <Badge variant="secondary">{ticket.status}</Badge>
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">{ticket.subject}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {ticket.created}
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => {
                  setSelectedUser(mockUserData);
                  setShowUserDetails(true);
                }}>
                  <Eye className="h-4 w-4 mr-1" />
                  View User
                </Button>
                <Button size="sm">Respond</Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Recent User Errors */}
      <Card className="p-6">
        <h3 className="mb-4 flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
          Recent User Errors
        </h3>
        <div className="space-y-3">
          {recentErrors.map((error, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm">{error.user}</span>
                  <Badge variant="destructive">{error.count}x</Badge>
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">{error.error}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Last occurred: {error.lastOccurred}
                </div>
              </div>
              <Button size="sm" variant="outline">Investigate</Button>
            </div>
          ))}
        </div>
      </Card>

      {/* User Details Dialog */}
      <Dialog open={showUserDetails} onOpenChange={setShowUserDetails}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>User Details & Troubleshooting</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              {/* User Info Header */}
              <div className="flex items-start justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div>
                  <h3 className="text-xl mb-1">{selectedUser.name}</h3>
                  <div className="text-sm text-slate-600 dark:text-slate-400">{selectedUser.email}</div>
                  <div className="flex gap-2 mt-2">
                    <Badge>{selectedUser.plan}</Badge>
                    <Badge variant="secondary">{selectedUser.status}</Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="gap-2">
                    <Shield className="h-4 w-4" />
                    Impersonate
                  </Button>
                  <Button size="sm" variant="outline" className="gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </Button>
                </div>
              </div>

              <Tabs defaultValue="overview">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="activity">Recent Activity</TabsTrigger>
                  <TabsTrigger value="errors">Error Logs</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="p-4">
                      <div className="text-2xl mb-1">{selectedUser.agents}</div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">AI Agents</div>
                    </Card>
                    <Card className="p-4">
                      <div className="text-2xl mb-1">{selectedUser.calls}</div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">Total Calls</div>
                    </Card>
                    <Card className="p-4">
                      <div className="text-2xl mb-1">{selectedUser.minutes}</div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">Minutes Used</div>
                    </Card>
                    <Card className="p-4">
                      <div className="text-2xl mb-1">${selectedUser.spend}</div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">Total Spend</div>
                    </Card>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-slate-500 dark:text-slate-400">Joined</Label>
                      <div className="mt-1">{selectedUser.joined}</div>
                    </div>
                    <div>
                      <Label className="text-xs text-slate-500 dark:text-slate-400">Last Active</Label>
                      <div className="mt-1">{selectedUser.lastActive}</div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="activity" className="space-y-3">
                  {selectedUser.recentActivity.map((activity: any, idx: number) => (
                    <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span>{activity.action}</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">{activity.timestamp}</span>
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">{activity.details}</div>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="errors" className="space-y-3">
                  {selectedUser.errorLog.map((error: any, idx: number) => (
                    <div key={idx} className="p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm">{error.error}</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">{error.timestamp}</span>
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">{error.message}</div>
                    </div>
                  ))}
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
