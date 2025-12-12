import { useState, useEffect } from 'react';
import { Plus, Search, Filter, TrendingUp, Users, Phone, Globe, MessageSquare, Mail, Smartphone, MoreVertical, Play, Pause, Settings, BarChart3, Edit, Trash2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { CreateFunnelWizard } from '@/components/CreateFunnelWizard';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { EditFunnelWizard } from '@/components/EditFunnelWizard';
import FunnelAnalyticsDialog from '@/components/FunnelAnalyticsDialog';

interface FunnelsPageProps {
  accessToken: string;
  onNavigate?: (page: string) => void;
  onViewFunnel?: (funnelId: string) => void;
}

export function FunnelsPage({ accessToken, onNavigate, onViewFunnel }: FunnelsPageProps) {
  const [funnels, setFunnels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [agents, setAgents] = useState<any[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [funnelToDelete, setFunnelToDelete] = useState<string | null>(null);
  const [editWizardOpen, setEditWizardOpen] = useState(false);
  const [editingFunnel, setEditingFunnel] = useState<any>(null);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [selectedAnalyticsFunnel, setSelectedAnalyticsFunnel] = useState<any>(null);

  useEffect(() => {
    loadFunnels();
  }, []);

  const loadFunnels = async () => {
    setLoading(true);
    try {
      // Load agents for wizard
      const mockAgents = [
        { id: 'agent_1', name: 'Customer Support Agent', model: 'GPT-4' },
        { id: 'agent_2', name: 'Sales Outreach Bot', model: 'GPT-4-Turbo' },
        { id: 'agent_3', name: 'Appointment Scheduler', model: 'GPT-4' },
      ];
      setAgents(mockAgents);

      // Mock data for now - in production would call API
      const mockFunnels = [
        {
          id: 'funnel_1',
          name: 'Home Buyer Qualification',
          description: 'Qualify potential home buyers and book property viewings',
          status: 'active',
          type: 'lead_generation',
          entryPoints: ['phone', 'web_form'],
          phoneNumber: '+1 (767) 818-9426',
          stats: {
            totalCalls: 156,
            completed: 134,
            hotLeads: 89,
            booked: 67,
            conversionRate: 50,
          },
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'funnel_2',
          name: 'SaaS Product Demo Booking',
          description: 'Qualify leads and schedule product demonstrations',
          status: 'active',
          type: 'appointments',
          entryPoints: ['phone', 'web_form', 'chat'],
          phoneNumber: '+1 (767) 818-9267',
          stats: {
            totalCalls: 89,
            completed: 76,
            hotLeads: 42,
            booked: 31,
            conversionRate: 41,
          },
          createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'funnel_3',
          name: 'Customer Support Triage',
          description: 'Route support requests to appropriate teams',
          status: 'active',
          type: 'lead_generation',
          entryPoints: ['phone', 'chat'],
          phoneNumber: '+1 (767) 555-0123',
          stats: {
            totalCalls: 234,
            completed: 215,
            hotLeads: 23,
            booked: 0,
            conversionRate: 0,
          },
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ];
      setFunnels(mockFunnels);
    } catch (error) {
      console.error('Error loading funnels:', error);
      toast.error('Failed to load funnels');
    } finally {
      setLoading(false);
    }
  };

  const getEntryPointIcon = (entryPoint: string) => {
    switch (entryPoint) {
      case 'phone': return Phone;
      case 'web_form': return Globe;
      case 'chat': return MessageSquare;
      case 'email': return Mail;
      case 'sms': return Smartphone;
      default: return Phone;
    }
  };

  const handleCreateFunnel = () => {
    setIsWizardOpen(true);
  };

  const handleFunnelCreated = (funnel: any) => {
    setFunnels([funnel, ...funnels]);
    toast.success('Funnel created and activated!');
  };

  const handlePauseFunnel = (funnelId: string) => {
    toast.success('Funnel paused');
  };

  const handleDeleteFunnel = (funnelId: string) => {
    setFunnelToDelete(funnelId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (funnelToDelete) {
      setFunnels(funnels.filter(f => f.id !== funnelToDelete));
      toast.success('Funnel deleted successfully');
      setFunnelToDelete(null);
    }
    setDeleteDialogOpen(false);
  };

  const handleTestFunnel = (funnelId: string) => {
    const funnel = funnels.find(f => f.id === funnelId);
    toast.info(`Testing funnel: ${funnel?.name}`, {
      description: 'Opening test interface...'
    });
    // Navigate to testing page
    onNavigate?.('testing');
  };

  const handleEditFunnel = (funnelId: string) => {
    const funnel = funnels.find(f => f.id === funnelId);
    if (funnel) {
      setEditingFunnel(funnel);
      setEditWizardOpen(true);
    }
  };

  const handleSaveFunnel = (updatedFunnel: any) => {
    setFunnels(funnels.map(f => f.id === updatedFunnel.id ? updatedFunnel : f));
    toast.success('Funnel updated successfully!');
  };

  const filteredFunnels = funnels.filter(funnel => {
    const matchesSearch = funnel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      funnel.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || funnel.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="mt-4 text-slate-600 dark:text-slate-400">Loading funnels...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-6">
      {/* Deprecation Warning */}
      <div className="mb-4 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold text-orange-900 dark:text-orange-100">Legacy Page - Please Use New Version</p>
            <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
              This is the old funnels page. For better performance and features, please use:{' '}
              <a href="/dashboard/funnels" className="underline font-semibold hover:text-orange-900 dark:hover:text-orange-100">
                /dashboard/funnels
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl tracking-tight">Sales Funnels</h1>
              <Badge variant="secondary" className="bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                LEGACY
              </Badge>
            </div>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Automate lead qualification and conversion
            </p>
          </div>
          <Button onClick={handleCreateFunnel} size="lg">
            <Plus className="h-5 w-5 mr-2" />
            Create Funnel
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input
            placeholder="Search funnels..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="paused">Paused</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Funnels</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl">{funnels.length}</div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              {funnels.filter(f => f.status === 'active').length} active
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Calls Today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl">
              {funnels.reduce((sum, f) => sum + (f.stats?.totalCalls || 0), 0)}
            </div>
            <p className="text-sm text-green-600 dark:text-green-400 mt-1">
              +12% from yesterday
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Qualified Leads</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl">
              {funnels.reduce((sum, f) => sum + (f.stats?.hotLeads || 0), 0)}
            </div>
            <p className="text-sm text-green-600 dark:text-green-400 mt-1">
              +8% this week
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Avg Conversion</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl">
              {funnels.length > 0 ? Math.round(funnels.reduce((sum, f) => sum + (f.stats?.conversionRate || 0), 0) / funnels.length) : 0}%
            </div>
            <p className="text-sm text-green-600 dark:text-green-400 mt-1">
              Above industry avg
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Funnels Grid */}
      {filteredFunnels.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <TrendingUp className="h-16 w-16 text-slate-300 dark:text-slate-600 mb-4" />
            <h3 className="text-xl mb-2">No funnels found</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6 text-center max-w-md">
              {searchQuery || statusFilter !== 'all' 
                ? 'Try adjusting your filters'
                : 'Create your first sales funnel to start qualifying leads automatically'
              }
            </p>
            {!searchQuery && statusFilter === 'all' && (
              <Button onClick={handleCreateFunnel}>
                <Plus className="h-5 w-5 mr-2" />
                Create Your First Funnel
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredFunnels.map((funnel) => (
            <Card key={funnel.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-xl">{funnel.name}</CardTitle>
                      <Badge variant={funnel.status === 'active' ? 'default' : 'secondary'}>
                        {funnel.status === 'active' ? '● Live' : 'Paused'}
                      </Badge>
                    </div>
                    <CardDescription className="mt-1">
                      {funnel.description}
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onViewFunnel?.(funnel.id)}>
                        <BarChart3 className="h-4 w-4 mr-2" />
                        View Analytics
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEditFunnel(funnel.id)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Funnel
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEditFunnel(funnel.id)}>
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handlePauseFunnel(funnel.id)}>
                        <Pause className="h-4 w-4 mr-2" />
                        Pause Funnel
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDeleteFunnel(funnel.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                {/* Entry Points */}
                <div className="mb-4">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Entry Points:</p>
                  <div className="flex gap-2">
                    {funnel.entryPoints.map((point: string) => {
                      const Icon = getEntryPointIcon(point);
                      return (
                        <div 
                          key={point}
                          className="flex items-center gap-1 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full text-sm"
                        >
                          <Icon className="h-3 w-3" />
                          {point.replace('_', ' ')}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Calls</p>
                    <p className="text-2xl">{funnel.stats?.totalCalls || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Qualified</p>
                    <p className="text-2xl">{funnel.stats?.hotLeads || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Booked</p>
                    <p className="text-2xl">{funnel.stats?.booked || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Conversion</p>
                    <p className="text-2xl">{funnel.stats?.conversionRate || 0}%</p>
                  </div>
                </div>

                {/* Conversion Progress */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-600 dark:text-slate-400">Call → Appointment</span>
                    <span className="font-medium">{funnel.stats?.conversionRate || 0}%</span>
                  </div>
                  <Progress value={funnel.stats?.conversionRate || 0} className="h-2" />
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t dark:border-slate-700">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleTestFunnel(funnel.id)}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Test
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => {
                      console.log('🎯 Analytics button clicked for funnel:', funnel.name);
                      const analyticsData = {
                        id: funnel.id,
                        name: funnel.name,
                        totalCalls: funnel.stats.totalCalls,
                        qualified: funnel.stats.hotLeads,
                        booked: funnel.stats.booked,
                        conversion: funnel.stats.conversionRate
                      };
                      console.log('📊 Analytics data:', analyticsData);
                      setSelectedAnalyticsFunnel(analyticsData);
                      setAnalyticsOpen(true);
                      console.log('✅ Dialog state set to open');
                    }}
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Analytics
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleEditFunnel(funnel.id)}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Funnel Wizard */}
      <CreateFunnelWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onFunnelCreated={handleFunnelCreated}
        agents={agents}
        accessToken={accessToken}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Funnel"
        description="Are you sure you want to delete this funnel? This action cannot be undone and all associated data will be permanently removed."
        confirmText="Delete Funnel"
        variant="danger"
      />

      {/* Edit Funnel Wizard */}
      {editingFunnel && (
        <EditFunnelWizard
          isOpen={editWizardOpen}
          onClose={() => {
            setEditWizardOpen(false);
            setEditingFunnel(null);
          }}
          onSave={handleSaveFunnel}
          funnel={editingFunnel}
          agents={agents}
          accessToken={accessToken}
        />
      )}

      {/* Analytics Dialog */}
      <FunnelAnalyticsDialog
        open={analyticsOpen && !!selectedAnalyticsFunnel}
        onClose={() => {
          setAnalyticsOpen(false);
          setSelectedAnalyticsFunnel(null);
        }}
        funnel={selectedAnalyticsFunnel || {
          id: '',
          name: '',
          totalCalls: 0,
          qualified: 0,
          booked: 0,
          conversion: 0
        }}
      />
    </div>
  );
}
