import { useState, useEffect } from 'react';
import { ArrowLeft, Phone, Users, TrendingUp, Clock, CheckCircle, XCircle, Calendar, Download, Settings, Play, Pause, Edit, BarChart3, Filter, Search } from 'lucide-react';
import { LeadDetailModal } from '@/components/LeadDetailModal';
import { ABTestingModal } from '@/components/ABTestingModal';
import { EditFunnelWizard } from '@/components/EditFunnelWizard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';

interface FunnelDetailPageProps {
  funnelId: string;
  accessToken: string;
  onBack: () => void;
}

export function FunnelDetailPage({ funnelId, accessToken, onBack }: FunnelDetailPageProps) {
  const [funnel, setFunnel] = useState<any>(null);
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');
  const [leadFilter, setLeadFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [showABTestModal, setShowABTestModal] = useState(false);
  const [showEditWizard, setShowEditWizard] = useState(false);

  useEffect(() => {
    loadFunnelDetails();
  }, [funnelId]);

  const loadFunnelDetails = async () => {
    setLoading(true);
    try {
      // Mock funnel data
      const mockFunnel = {
        id: funnelId,
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
          warmLeads: 28,
          coldLeads: 17,
          booked: 67,
          conversionRate: 50,
          avgCallDuration: 272,
          avgScore: 68,
        },
        qualificationRules: {
          questions: ['budget', 'location', 'bedrooms', 'timeline', 'preapproved'],
          hotThreshold: 70,
          warmThreshold: 40,
        },
        integrations: {
          calendar: 'calendly',
          crm: 'followupboss',
        },
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      };

      // Mock leads data
      const mockLeads = generateMockLeads(50);
      
      setFunnel(mockFunnel);
      setLeads(mockLeads);
    } catch (error) {
      console.error('Error loading funnel details:', error);
      toast.error('Failed to load funnel details');
    } finally {
      setLoading(false);
    }
  };

  const generateMockLeads = (count: number) => {
    const names = ['John Smith', 'Sarah Johnson', 'Mike Davis', 'Emily Brown', 'David Wilson', 'Lisa Anderson', 'Chris Taylor', 'Jennifer Martinez'];
    const scores = ['hot', 'warm', 'cold'];
    const statuses = ['qualified', 'contacted', 'booked', 'nurturing', 'lost'];
    
    return Array.from({ length: count }, (_, i) => ({
      id: `lead_${i}`,
      name: names[i % names.length],
      phone: `+1 (555) ${String(Math.floor(Math.random() * 900 + 100))}-${String(Math.floor(Math.random() * 9000 + 1000))}`,
      email: `${names[i % names.length].toLowerCase().replace(' ', '.')}@email.com`,
      score: Math.floor(Math.random() * 100),
      scoreCategory: scores[Math.floor(Math.random() * scores.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      callDuration: Math.floor(Math.random() * 300 + 60),
      createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      qualificationData: {
        budget: '$300K - $500K',
        location: 'Downtown',
        bedrooms: '3-4',
        timeline: '3-6 months',
        preapproved: Math.random() > 0.5 ? 'Yes' : 'No',
      },
    }));
  };

  // Chart data
  const performanceData = [
    { date: 'Mon', calls: 18, qualified: 12, booked: 9 },
    { date: 'Tue', calls: 24, qualified: 16, booked: 11 },
    { date: 'Wed', calls: 21, qualified: 15, booked: 10 },
    { date: 'Thu', calls: 28, qualified: 19, booked: 14 },
    { date: 'Fri', calls: 32, qualified: 22, booked: 16 },
    { date: 'Sat', calls: 19, qualified: 11, booked: 5 },
    { date: 'Sun', calls: 14, qualified: 4, booked: 2 },
  ];

  const conversionFunnelData = [
    { stage: 'Total Calls', value: 156, color: '#3b82f6' },
    { stage: 'Completed', value: 134, color: '#8b5cf6' },
    { stage: 'Qualified', value: 89, color: '#10b981' },
    { stage: 'Booked', value: 67, color: '#f59e0b' },
  ];

  const scoreDistributionData = [
    { name: 'Hot Leads', value: 89, color: '#10b981' },
    { name: 'Warm Leads', value: 28, color: '#f59e0b' },
    { name: 'Cold Leads', value: 17, color: '#ef4444' },
  ];

  const filteredLeads = leads.filter(lead => {
    const matchesFilter = leadFilter === 'all' || lead.scoreCategory === leadFilter;
    const matchesSearch = lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.phone.includes(searchQuery);
    return matchesFilter && matchesSearch;
  });

  const handleViewLeadDetail = (lead: any) => {
    setSelectedLead(lead);
    setShowLeadModal(true);
  };

  const handleUpdateLead = (leadId: string, updates: any) => {
    setLeads(leads.map(lead => 
      lead.id === leadId ? { ...lead, ...updates } : lead
    ));
  };

  const handleSaveFunnel = (updatedFunnel: any) => {
    setFunnel(updatedFunnel);
    toast.success('Funnel updated successfully!');
  };

  const getScoreBadgeColor = (category: string) => {
    switch (category) {
      case 'hot': return 'bg-green-500';
      case 'warm': return 'bg-yellow-500';
      case 'cold': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusBadgeVariant = (status: string): "default" | "secondary" | "outline" => {
    switch (status) {
      case 'booked': return 'default';
      case 'qualified': return 'default';
      case 'contacted': return 'secondary';
      default: return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="mt-4 text-slate-600 dark:text-slate-400">Loading funnel details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!funnel) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <XCircle className="h-16 w-16 text-red-500 mb-4" />
            <h3 className="text-xl mb-2">Funnel Not Found</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              The funnel you're looking for doesn't exist.
            </p>
            <Button onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Funnels
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Funnels
        </Button>
        
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl tracking-tight">{funnel.name}</h1>
              <Badge variant={funnel.status === 'active' ? 'default' : 'secondary'}>
                {funnel.status === 'active' ? '● Live' : 'Paused'}
              </Badge>
            </div>
            <p className="text-slate-600 dark:text-slate-400">{funnel.description}</p>
            <div className="flex items-center gap-4 mt-3 text-sm text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-1">
                <Phone className="h-4 w-4" />
                {funnel.phoneNumber}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Created {new Date(funnel.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowABTestModal(true)}>
              <BarChart3 className="h-4 w-4 mr-2" />
              A/B Tests
            </Button>
            <Button variant="outline" onClick={() => toast.info('Exporting report...')}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" onClick={() => setShowEditWizard(true)}>
              <Settings className="h-4 w-4 mr-2" />
              Edit Funnel
            </Button>
            {funnel.status === 'active' ? (
              <Button variant="outline" onClick={() => toast.success('Funnel paused')}>
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </Button>
            ) : (
              <Button onClick={() => toast.success('Funnel activated')}>
                <Play className="h-4 w-4 mr-2" />
                Activate
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Calls</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl">{funnel.stats?.totalCalls || 0}</div>
            <p className="text-sm text-green-600 dark:text-green-400 mt-1">
              +12% this week
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Hot Leads</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl text-green-600 dark:text-green-400">
              {funnel.stats?.hotLeads || 0}
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              ≥{funnel.qualificationRules?.hotThreshold || 70} points
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Warm Leads</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl text-yellow-600 dark:text-yellow-400">
              {funnel.stats?.warmLeads || 0}
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              {funnel.qualificationRules?.warmThreshold || 40}-{funnel.qualificationRules?.hotThreshold || 70} points
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Appointments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl">{funnel.stats?.booked || 0}</div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              {funnel.stats?.conversionRate || 0}% conversion
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Avg Call Time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl">
              {Math.floor((funnel.stats?.avgCallDuration || 0) / 60)}:{String((funnel.stats?.avgCallDuration || 0) % 60).padStart(2, '0')}
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              minutes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="analytics" className="space-y-6">
        <TabsList>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="leads">Leads ({leads.length})</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg">Performance Analytics</h3>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="90d">Last 90 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Over Time */}
            <Card>
              <CardHeader>
                <CardTitle>Call Volume & Conversions</CardTitle>
                <CardDescription>Daily performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="calls" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} name="Total Calls" />
                    <Area type="monotone" dataKey="qualified" stackId="2" stroke="#10b981" fill="#10b981" fillOpacity={0.6} name="Qualified" />
                    <Area type="monotone" dataKey="booked" stackId="3" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} name="Booked" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Score Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Lead Score Distribution</CardTitle>
                <CardDescription>Qualification breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={scoreDistributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {scoreDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Conversion Funnel */}
          <Card>
            <CardHeader>
              <CardTitle>Conversion Funnel</CardTitle>
              <CardDescription>Lead journey through qualification stages</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={conversionFunnelData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="stage" type="category" width={100} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6">
                    {conversionFunnelData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 grid grid-cols-4 gap-4 text-center">
                {conversionFunnelData.map((stage, index) => (
                  <div key={stage.stage}>
                    <div className="text-2xl font-bold" style={{ color: stage.color }}>
                      {stage.value}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">{stage.stage}</div>
                    {index > 0 && (
                      <div className="text-xs text-slate-500 mt-1">
                        {((stage.value / conversionFunnelData[index - 1].value) * 100).toFixed(0)}% conversion
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Leads Tab */}
        <TabsContent value="leads" className="space-y-6">
          {/* Filters */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                placeholder="Search leads..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={leadFilter} onValueChange={setLeadFilter}>
              <SelectTrigger className="w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Leads</SelectItem>
                <SelectItem value="hot">Hot Leads</SelectItem>
                <SelectItem value="warm">Warm Leads</SelectItem>
                <SelectItem value="cold">Cold Leads</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Leads Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b dark:border-slate-700">
                    <tr className="text-left">
                      <th className="p-4">Lead</th>
                      <th className="p-4">Score</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Contact</th>
                      <th className="p-4">Call Duration</th>
                      <th className="p-4">Date</th>
                      <th className="p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeads.map((lead) => (
                      <tr key={lead.id} className="border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
                        <td className="p-4">
                          <div>
                            <div className="font-medium">{lead.name}</div>
                            <div className="text-sm text-slate-600 dark:text-slate-400">{lead.email}</div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Badge className={getScoreBadgeColor(lead.scoreCategory)}>
                              {lead.score}
                            </Badge>
                            <span className="text-sm capitalize">{lead.scoreCategory}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge variant={getStatusBadgeVariant(lead.status)}>
                            {lead.status}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="text-sm">{lead.phone}</div>
                        </td>
                        <td className="p-4">
                          <div className="text-sm">
                            {Math.floor(lead.callDuration / 60)}:{String(lead.callDuration % 60).padStart(2, '0')}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-sm">
                            {new Date(lead.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="p-4">
                          <Button variant="ghost" size="sm" onClick={() => handleViewLeadDetail(lead)}>
                            View Details
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {filteredLeads.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl mb-2">No leads found</h3>
              <p className="text-slate-600 dark:text-slate-400">
                {searchQuery || leadFilter !== 'all' ? 'Try adjusting your filters' : 'Leads will appear here as they come in'}
              </p>
            </div>
          )}
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Funnel Configuration</CardTitle>
              <CardDescription>Manage funnel settings and integrations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-medium mb-3">Entry Points</h4>
                <div className="flex gap-2">
                  {funnel.entryPoints?.map((point: string) => (
                    <Badge key={point} variant="outline">
                      {point.replace('_', ' ')}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Qualification Rules</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Hot Lead Threshold</span>
                    <span className="font-medium">≥{funnel.qualificationRules?.hotThreshold || 70} points</span>
                  </div>
                  <Progress value={funnel.qualificationRules?.hotThreshold || 70} className="h-2" />
                  
                  <div className="flex justify-between text-sm mt-4">
                    <span>Warm Lead Threshold</span>
                    <span className="font-medium">≥{funnel.qualificationRules?.warmThreshold || 40} points</span>
                  </div>
                  <Progress value={funnel.qualificationRules?.warmThreshold || 40} className="h-2" />
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Integrations</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 border rounded-lg dark:border-slate-700">
                    <div>
                      <div className="font-medium">Calendar</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        {funnel.integrations?.calendar || 'Not connected'}
                      </div>
                    </div>
                    <Badge variant="default" className="bg-green-500">Connected</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg dark:border-slate-700">
                    <div>
                      <div className="font-medium">CRM</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        {funnel.integrations?.crm || 'Not connected'}
                      </div>
                    </div>
                    <Badge variant="default" className="bg-green-500">Connected</Badge>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t dark:border-slate-700 flex gap-3">
                <Button onClick={() => toast.info('Opening edit dialog...')}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Funnel
                </Button>
                <Button variant="outline" onClick={() => toast.info('Managing integrations...')}>
                  <Settings className="h-4 w-4 mr-2" />
                  Manage Integrations
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Lead Detail Modal */}
      <LeadDetailModal
        lead={selectedLead}
        open={showLeadModal}
        onClose={() => setShowLeadModal(false)}
        onUpdate={handleUpdateLead}
      />

      {/* A/B Testing Modal */}
      <ABTestingModal
        open={showABTestModal}
        onClose={() => setShowABTestModal(false)}
        funnelId={funnelId}
        funnelName={funnel?.name}
      />

      {/* Edit Funnel Wizard */}
      <EditFunnelWizard
        open={showEditWizard}
        onClose={() => setShowEditWizard(false)}
        onSave={handleSaveFunnel}
        funnel={funnel}
      />
    </div>
  );
}
