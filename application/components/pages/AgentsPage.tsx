import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Bot, Plus, Search, Loader2, MoreVertical, Trash2, Power, PowerOff, Activity, TrendingUp, Phone, DollarSign, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { Agent, getAgents, deleteAgent } from "@/components/../utils/api";
import { AgentCard } from "@/components/AgentCard";
import { CreateAgentDialog } from "@/components/CreateAgentDialog";
import { EditAgentDialog } from "@/components/EditAgentDialog";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { toast } from "sonner";

interface AgentsPageProps {
  accessToken: string;
}

export function AgentsPage({ accessToken }: AgentsPageProps) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [filteredAgents, setFilteredAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>("name");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; title: string; message: string; onConfirm: () => void }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {}
  });

  useEffect(() => {
    loadAgents();

    // Listen for agent created events
    const handleAgentCreated = (event: CustomEvent) => {
      const newAgent = event.detail;
      setAgents(prev => [...prev, newAgent]);
      toast.success(`Agent "${newAgent.name}" created successfully!`);
    };

    window.addEventListener('agentCreated', handleAgentCreated as EventListener);
    return () => window.removeEventListener('agentCreated', handleAgentCreated as EventListener);
  }, []);

  // Filter and sort agents
  useEffect(() => {
    let filtered = [...agents];
    
    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(agent => 
        agent && agent.name && agent.type &&
        (agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.type.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    // Status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter(agent => agent.status === filterStatus);
    }
    
    // Type filter
    if (filterType !== "all") {
      filtered = filtered.filter(agent => agent.type === filterType);
    }
    
    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "created":
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        case "performance":
          return (b.performance || 0) - (a.performance || 0);
        case "calls":
          return (b.totalCalls || 0) - (a.totalCalls || 0);
        default:
          return 0;
      }
    });
    
    setFilteredAgents(filtered);
  }, [searchQuery, agents, sortBy, filterStatus, filterType]);

  const loadAgents = async () => {
    try {
      setIsLoading(true);
      const fetchedAgents = await getAgents(accessToken);
      // Filter out any null or invalid agents
      const validAgents = fetchedAgents.filter(agent => agent != null && agent.id);
      setAgents(validAgents);
      setFilteredAgents(validAgents);
    } catch (error) {
      console.error('Error loading agents:', error);
      toast.error("Failed to load agents");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAgentCreated = (agent: Agent) => {
    setAgents([...agents, agent]);
    setIsCreateDialogOpen(false);
    toast.success("Agent created successfully!");
  };

  const handleAgentUpdated = (updatedAgent: Agent) => {
    setAgents(agents.map(a => a.id === updatedAgent.id ? updatedAgent : a));
    setSelectedAgent(null);
    toast.success("Agent updated successfully!");
  };

  const handleDeleteAgent = async (agentId: string) => {
    try {
      await deleteAgent(accessToken, agentId);
      setAgents(agents.filter(a => a.id !== agentId));
      setSelectedAgent(null);
      toast.success("Agent deleted successfully!");
    } catch (error) {
      console.error('Error deleting agent:', error);
      toast.error("Failed to delete agent");
    }
  };

  // Bulk actions
  const toggleSelectAgent = (agentId: string) => {
    setSelectedAgents(prev => 
      prev.includes(agentId) 
        ? prev.filter(id => id !== agentId)
        : [...prev, agentId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedAgents.length === filteredAgents.length) {
      setSelectedAgents([]);
    } else {
      setSelectedAgents(filteredAgents.map(a => a.id));
    }
  };

  const handleBulkDelete = () => {
    setConfirmDialog({
      isOpen: true,
      title: "Delete Agents",
      message: `Are you sure you want to delete ${selectedAgents.length} agent(s)? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          await Promise.all(selectedAgents.map(id => deleteAgent(accessToken, id)));
          setAgents(agents.filter(a => !selectedAgents.includes(a.id)));
          setSelectedAgents([]);
          toast.success(`${selectedAgents.length} agent(s) deleted successfully!`);
        } catch (error) {
          console.error('Error deleting agents:', error);
          toast.error("Failed to delete some agents");
        }
        setConfirmDialog({ ...confirmDialog, isOpen: false });
      }
    });
  };

  const handleBulkActivate = async () => {
    try {
      // In real app, would call API to update status
      setAgents(agents.map(a => 
        selectedAgents.includes(a.id) ? { ...a, status: 'active' } : a
      ));
      toast.success(`${selectedAgents.length} agent(s) activated!`);
      setSelectedAgents([]);
    } catch (error) {
      toast.error("Failed to activate agents");
    }
  };

  const handleBulkDeactivate = async () => {
    try {
      // In real app, would call API to update status
      setAgents(agents.map(a => 
        selectedAgents.includes(a.id) ? { ...a, status: 'inactive' } : a
      ));
      toast.success(`${selectedAgents.length} agent(s) deactivated!`);
      setSelectedAgents([]);
    } catch (error) {
      toast.error("Failed to deactivate agents");
    }
  };

  // Calculate stats
  const totalAgents = agents.length;
  const activeAgents = agents.filter(a => a.status === 'active').length;
  const totalCalls = agents.reduce((sum, a) => sum + (a.totalCalls || 0), 0);
  const avgPerformance = agents.length > 0 
    ? (agents.reduce((sum, a) => sum + (a.performance || 0), 0) / agents.length).toFixed(1)
    : '0';

  // Get agent health status
  const getHealthStatus = (agent: Agent) => {
    const perf = agent.performance || 0;
    if (perf >= 80) return { status: 'healthy', color: 'text-green-600 bg-green-50', icon: CheckCircle2 };
    if (perf >= 60) return { status: 'warning', color: 'text-yellow-600 bg-yellow-50', icon: Clock };
    return { status: 'critical', color: 'text-red-600 bg-red-50', icon: AlertCircle };
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl mb-2">AI Agents</h1>
          <p className="text-slate-600 dark:text-slate-400">Create and manage your voice AI agents</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Agent
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Total Agents</CardTitle>
              <Bot className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl mb-1">{totalAgents}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {activeAgents} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Total Calls</CardTitle>
              <Phone className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl mb-1">{totalCalls.toLocaleString()}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              All time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Avg Performance</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl mb-1">{avgPerformance}%</div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Success rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Health Status</CardTitle>
              <Activity className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl mb-1">
              {agents.filter(a => (a.performance || 0) >= 80).length}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Healthy agents
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search agents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="created">Date Created</SelectItem>
              <SelectItem value="performance">Performance</SelectItem>
              <SelectItem value="calls">Total Calls</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="voice">Voice</SelectItem>
              <SelectItem value="chat">Chat</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedAgents.length > 0 && (
        <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={selectedAgents.length === filteredAgents.length}
                  onCheckedChange={toggleSelectAll}
                />
                <span className="text-sm">
                  {selectedAgents.length} agent(s) selected
                </span>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={handleBulkActivate}>
                  <Power className="h-4 w-4 mr-2" />
                  Activate
                </Button>
                <Button size="sm" variant="outline" onClick={handleBulkDeactivate}>
                  <PowerOff className="h-4 w-4 mr-2" />
                  Deactivate
                </Button>
                <Button size="sm" variant="destructive" onClick={handleBulkDelete}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Agents Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : filteredAgents.length === 0 ? (
        <div className="text-center py-20">
          {searchQuery ? (
            <>
              <Search className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-2xl mb-2">No agents found</h3>
              <p className="text-slate-600 mb-6">
                Try adjusting your search query
              </p>
            </>
          ) : (
            <>
              <Bot className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-2xl mb-2">No Agents Yet</h3>
              <p className="text-slate-600 mb-6">
                Create your first AI agent to get started
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Agent
              </Button>
            </>
          )}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAgents.filter(agent => agent != null && agent.id).map(agent => {
            const health = getHealthStatus(agent);
            const HealthIcon = health.icon;
            
            return (
              <Card 
                key={agent.id} 
                className="relative cursor-pointer hover:shadow-lg transition-shadow"
                onClick={(e) => {
                  if (!(e.target as HTMLElement).closest('.checkbox-container')) {
                    setSelectedAgent(agent);
                  }
                }}
              >
                {/* Selection Checkbox */}
                <div className="absolute top-4 left-4 z-10 checkbox-container">
                  <Checkbox
                    checked={selectedAgents.includes(agent.id)}
                    onCheckedChange={() => toggleSelectAgent(agent.id)}
                  />
                </div>

                {/* Health Indicator */}
                <div className={`absolute top-4 right-4 flex items-center gap-1 px-2 py-1 rounded-full text-xs ${health.color}`}>
                  <HealthIcon className="h-3 w-3" />
                  <span className="capitalize">{health.status}</span>
                </div>

                <CardHeader className="pt-12">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="mb-2">{agent.name}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant={agent.status === 'active' ? 'default' : 'secondary'}>
                          {agent.status}
                        </Badge>
                        <Badge variant="outline" className="capitalize">
                          {agent.type}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Performance Metrics */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">Performance</span>
                      <span className="font-medium">{agent.performance || 0}%</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${agent.performance || 0}%` }}
                      />
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t dark:border-slate-700">
                    <div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">Total Calls</div>
                      <div className="text-2xl">{agent.totalCalls || 0}</div>
                    </div>
                    <div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">Avg Duration</div>
                      <div className="text-2xl">{agent.avgDuration || '0:00'}</div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedAgent(agent);
                      }}
                    >
                      Edit
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button size="sm" variant="ghost">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => {
                          setAgents(agents.map(a => 
                            a.id === agent.id ? { ...a, status: a.status === 'active' ? 'inactive' : 'active' } : a
                          ));
                          toast.success(`Agent ${agent.status === 'active' ? 'deactivated' : 'activated'}`);
                        }}>
                          {agent.status === 'active' ? (
                            <>
                              <PowerOff className="h-4 w-4 mr-2" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <Power className="h-4 w-4 mr-2" />
                              Activate
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => {
                            setConfirmDialog({
                              isOpen: true,
                              title: "Delete Agent",
                              message: `Are you sure you want to delete "${agent.name}"? This action cannot be undone.`,
                              onConfirm: () => {
                                handleDeleteAgent(agent.id);
                                setConfirmDialog({ ...confirmDialog, isOpen: false });
                              }
                            });
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Dialogs */}
      <CreateAgentDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onAgentCreated={handleAgentCreated}
        accessToken={accessToken}
      />

      {selectedAgent && (
        <EditAgentDialog
          agent={selectedAgent}
          isOpen={!!selectedAgent}
          onClose={() => setSelectedAgent(null)}
          onAgentUpdated={handleAgentUpdated}
          accessToken={accessToken}
        />
      )}

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
      />
    </div>
  );
}
