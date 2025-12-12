import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, Filter, Download, UserPlus, MoreVertical, 
  Ban, CheckCircle, Eye, DollarSign, Settings, Trash2, 
  Shield, TrendingUp, Phone, Mail
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

// Mock user data
const mockUsers = [
  { 
    id: 1, 
    name: "Sarah Johnson", 
    email: "sarah.j@company.com", 
    plan: "Enterprise", 
    status: "active", 
    agents: 12, 
    calls: 8934, 
    minutes: 12456, 
    spend: 2340, 
    joined: "2024-01-15",
    lastActive: "2 hours ago"
  },
  { 
    id: 2, 
    name: "Michael Chen", 
    email: "m.chen@startup.io", 
    plan: "Pro", 
    status: "active", 
    agents: 5, 
    calls: 3421, 
    minutes: 4892, 
    spend: 890, 
    joined: "2024-03-22",
    lastActive: "5 minutes ago"
  },
  { 
    id: 3, 
    name: "Emma Wilson", 
    email: "emma@design.co", 
    plan: "Starter", 
    status: "trial", 
    agents: 2, 
    calls: 156, 
    minutes: 234, 
    spend: 0, 
    joined: "2024-10-28",
    lastActive: "1 day ago"
  },
  { 
    id: 4, 
    name: "James Rodriguez", 
    email: "james.r@sales.com", 
    plan: "Pro", 
    status: "suspended", 
    agents: 8, 
    calls: 5123, 
    minutes: 7234, 
    spend: 1450, 
    joined: "2024-02-10",
    lastActive: "3 days ago"
  },
  { 
    id: 5, 
    name: "Lisa Anderson", 
    email: "l.anderson@tech.io", 
    plan: "Enterprise", 
    status: "active", 
    agents: 15, 
    calls: 12456, 
    minutes: 18923, 
    spend: 3890, 
    joined: "2023-11-05",
    lastActive: "30 minutes ago"
  },
];

export function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPlan, setFilterPlan] = useState("all");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);

  const filteredUsers = mockUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || user.status === filterStatus;
    const matchesPlan = filterPlan === "all" || user.plan === filterPlan;
    return matchesSearch && matchesStatus && matchesPlan;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'trial': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'suspended': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'Enterprise': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      case 'Pro': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'Starter': return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl mb-2">User Management</h1>
          <p className="text-slate-500 dark:text-slate-400">
            Manage all {mockUsers.length} users across the platform
          </p>
        </div>
        <Button className="gap-2">
          <UserPlus className="h-4 w-4" />
          Create User
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-2xl mb-1">{mockUsers.length}</div>
          <div className="text-sm text-slate-500 dark:text-slate-400">Total Users</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl mb-1">{mockUsers.filter(u => u.status === 'active').length}</div>
          <div className="text-sm text-slate-500 dark:text-slate-400">Active Users</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl mb-1">{mockUsers.filter(u => u.status === 'trial').length}</div>
          <div className="text-sm text-slate-500 dark:text-slate-400">Trial Users</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl mb-1">${mockUsers.reduce((sum, u) => sum + u.spend, 0).toLocaleString()}</div>
          <div className="text-sm text-slate-500 dark:text-slate-400">Total Revenue</div>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by name or email..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="trial">Trial</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterPlan} onValueChange={setFilterPlan}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Plan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Plans</SelectItem>
              <SelectItem value="Enterprise">Enterprise</SelectItem>
              <SelectItem value="Pro">Pro</SelectItem>
              <SelectItem value="Starter">Starter</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </Card>

      {/* Users Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b dark:border-slate-700">
              <tr className="text-left text-sm text-slate-500 dark:text-slate-400">
                <th className="p-4">User</th>
                <th className="p-4">Plan</th>
                <th className="p-4">Status</th>
                <th className="p-4">Agents</th>
                <th className="p-4">Calls</th>
                <th className="p-4">Spend</th>
                <th className="p-4">Last Active</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="p-4">
                    <div>
                      <div>{user.name}</div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">{user.email}</div>
                    </div>
                  </td>
                  <td className="p-4">
                    <Badge className={getPlanColor(user.plan)}>{user.plan}</Badge>
                  </td>
                  <td className="p-4">
                    <Badge className={getStatusColor(user.status)}>{user.status}</Badge>
                  </td>
                  <td className="p-4">{user.agents}</td>
                  <td className="p-4">{user.calls.toLocaleString()}</td>
                  <td className="p-4">${user.spend.toLocaleString()}</td>
                  <td className="p-4 text-sm text-slate-500 dark:text-slate-400">{user.lastActive}</td>
                  <td className="p-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => {
                          setSelectedUser(user);
                          setShowUserDetails(true);
                        }}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Shield className="h-4 w-4 mr-2" />
                          Impersonate User
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <DollarSign className="h-4 w-4 mr-2" />
                          Adjust Billing
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Settings className="h-4 w-4 mr-2" />
                          Edit Limits
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-yellow-600">
                          <Ban className="h-4 w-4 mr-2" />
                          Suspend User
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* User Details Dialog */}
      <Dialog open={showUserDetails} onOpenChange={setShowUserDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>Comprehensive information about this user</DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div>
                <h3 className="text-sm mb-3">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-slate-500 dark:text-slate-400">Full Name</Label>
                    <div className="mt-1">{selectedUser.name}</div>
                  </div>
                  <div>
                    <Label className="text-xs text-slate-500 dark:text-slate-400">Email</Label>
                    <div className="mt-1">{selectedUser.email}</div>
                  </div>
                  <div>
                    <Label className="text-xs text-slate-500 dark:text-slate-400">Plan</Label>
                    <div className="mt-1">
                      <Badge className={getPlanColor(selectedUser.plan)}>{selectedUser.plan}</Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-slate-500 dark:text-slate-400">Status</Label>
                    <div className="mt-1">
                      <Badge className={getStatusColor(selectedUser.status)}>{selectedUser.status}</Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-slate-500 dark:text-slate-400">Joined</Label>
                    <div className="mt-1">{selectedUser.joined}</div>
                  </div>
                  <div>
                    <Label className="text-xs text-slate-500 dark:text-slate-400">Last Active</Label>
                    <div className="mt-1">{selectedUser.lastActive}</div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Usage Stats */}
              <div>
                <h3 className="text-sm mb-3">Usage Statistics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <Card className="p-4">
                    <div className="text-2xl mb-1">{selectedUser.agents}</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">AI Agents</div>
                  </Card>
                  <Card className="p-4">
                    <div className="text-2xl mb-1">{selectedUser.calls.toLocaleString()}</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">Total Calls</div>
                  </Card>
                  <Card className="p-4">
                    <div className="text-2xl mb-1">{selectedUser.minutes.toLocaleString()}</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">Minutes Used</div>
                  </Card>
                  <Card className="p-4">
                    <div className="text-2xl mb-1">${selectedUser.spend.toLocaleString()}</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">Total Spend</div>
                  </Card>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 gap-2">
                  <Mail className="h-4 w-4" />
                  Email User
                </Button>
                <Button variant="outline" className="flex-1 gap-2">
                  <Shield className="h-4 w-4" />
                  Impersonate
                </Button>
                <Button variant="outline" className="flex-1 gap-2">
                  <Settings className="h-4 w-4" />
                  Edit Limits
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
