'use client'
import { useSession } from 'next-auth/react'

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Upload, Download, Search, Phone, Mail, Loader2, Star, TrendingUp, Calendar, User, Trash2, CheckCircle2, XCircle, MessageSquare, MoreVertical, Edit, Eye } from "lucide-react";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/ConfirmDialog";

interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  source: string;
  lastContact: string;
  assignedAgent: string;
  score: number; // 0-100
  company?: string;
  notes?: string;
  tags?: string[];
}

interface LeadsPageProps {
  // TODO: Remove accessToken prop, use useSession() hook instead
  accessToken: string;
}

export default function LeadsPage({ accessToken }: LeadsPageProps) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [scoreFilter, setScoreFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; title: string; message: string; onConfirm: () => void }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {}
  });

  useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = async () => {
    try {
      setIsLoading(true);
      // Mock data
      setLeads([
        {
          id: "1",
          name: "John Smith",
          phone: "+1 (555) 123-4567",
          email: "john@example.com",
          status: "new",
          source: "Website",
          lastContact: "2025-10-30T10:30:00Z",
          assignedAgent: "Sales Bot",
          score: 85,
          company: "Tech Corp",
          notes: "Interested in enterprise plan. Follow up next week.",
          tags: ["hot-lead", "enterprise"]
        },
        {
          id: "2",
          name: "Sarah Johnson",
          phone: "+1 (555) 234-5678",
          email: "sarah@example.com",
          status: "contacted",
          source: "Referral",
          lastContact: "2025-10-29T15:45:00Z",
          assignedAgent: "Support Bot",
          score: 72,
          company: "Marketing Inc",
          notes: "Requested demo. Scheduling for next Monday.",
          tags: ["demo-scheduled"]
        },
        {
          id: "3",
          name: "Michael Brown",
          phone: "+1 (555) 345-6789",
          email: "michael@example.com",
          status: "qualified",
          source: "Campaign",
          lastContact: "2025-10-28T09:20:00Z",
          assignedAgent: "Sales Bot",
          score: 91,
          company: "Sales Solutions",
          notes: "Very interested. Budget approved. Ready to sign.",
          tags: ["high-priority", "budget-approved"]
        },
        {
          id: "4",
          name: "Emily Davis",
          phone: "+1 (555) 456-7890",
          email: "emily@example.com",
          status: "new",
          source: "LinkedIn",
          lastContact: "2025-10-31T14:20:00Z",
          assignedAgent: "Sales Bot",
          score: 45,
          company: "Startup LLC",
          tags: ["warm-lead"]
        },
        {
          id: "5",
          name: "Robert Wilson",
          phone: "+1 (555) 567-8901",
          email: "robert@example.com",
          status: "converted",
          source: "Referral",
          lastContact: "2025-10-27T11:15:00Z",
          assignedAgent: "Sales Bot",
          score: 95,
          company: "Enterprise Co",
          notes: "Signed annual contract. Onboarding in progress.",
          tags: ["customer", "annual-plan"]
        }
      ]);
    } catch (error) {
      console.error('Error loading leads:', error);
      toast.error("Failed to load leads");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         lead.phone.includes(searchQuery) ||
                         lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (lead.company && lead.company.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
    const matchesScore = scoreFilter === "all" || 
                        (scoreFilter === "hot" && lead.score >= 80) ||
                        (scoreFilter === "warm" && lead.score >= 50 && lead.score < 80) ||
                        (scoreFilter === "cold" && lead.score < 50);
    const matchesSource = sourceFilter === "all" || lead.source === sourceFilter;
    return matchesSearch && matchesStatus && matchesScore && matchesSource;
  });

  // Bulk actions
  const toggleSelectLead = (leadId: string) => {
    setSelectedLeads(prev => 
      prev.includes(leadId) 
        ? prev.filter(id => id !== leadId)
        : [...prev, leadId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedLeads.length === filteredLeads.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(filteredLeads.map(l => l.id));
    }
  };

  const handleBulkDelete = () => {
    setConfirmDialog({
      isOpen: true,
      title: "Delete Leads",
      message: `Are you sure you want to delete ${selectedLeads.length} lead(s)? This action cannot be undone.`,
      onConfirm: () => {
        setLeads(leads.filter(l => !selectedLeads.includes(l.id)));
        setSelectedLeads([]);
        toast.success(`${selectedLeads.length} lead(s) deleted`);
        setConfirmDialog({ ...confirmDialog, isOpen: false });
      }
    });
  };

  const handleBulkStatusChange = (newStatus: Lead['status']) => {
    setLeads(leads.map(l => 
      selectedLeads.includes(l.id) ? { ...l, status: newStatus } : l
    ));
    setSelectedLeads([]);
    toast.success(`Updated ${selectedLeads.length} lead(s) to ${newStatus}`);
  };

  const handleBulkAssign = (agentName: string) => {
    setLeads(leads.map(l => 
      selectedLeads.includes(l.id) ? { ...l, assignedAgent: agentName } : l
    ));
    setSelectedLeads([]);
    toast.success(`Assigned ${selectedLeads.length} lead(s) to ${agentName}`);
  };

  // Export to CSV
  const handleExport = () => {
    const csv = [
      ['Name', 'Phone', 'Email', 'Status', 'Source', 'Score', 'Company', 'Agent'].join(','),
      ...filteredLeads.map(l => [
        l.name, l.phone, l.email, l.status, l.source, l.score, l.company || '', l.assignedAgent
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success(`Exported ${filteredLeads.length} leads to CSV`);
  };

  // Import from CSV
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').slice(1); // Skip header
      const newLeads: Lead[] = lines.map((line, idx) => {
        const [name, phone, email, status, source, score, company] = line.split(',');
        return {
          id: `import_${Date.now()}_${idx}`,
          name: name || 'Unknown',
          phone: phone || '',
          email: email || '',
          status: (status as Lead['status']) || 'new',
          source: source || 'Import',
          lastContact: new Date().toISOString(),
          assignedAgent: 'Sales Bot',
          score: parseInt(score) || 50,
          company: company || undefined
        };
      }).filter(l => l.name && l.name !== 'Unknown');

      setLeads([...leads, ...newLeads]);
      setIsImportDialogOpen(false);
      toast.success(`Imported ${newLeads.length} leads successfully`);
    };
    reader.readAsText(file);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 50) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Hot';
    if (score >= 50) return 'Warm';
    return 'Cold';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
      case 'contacted': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300';
      case 'qualified': return 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300';
      case 'converted': return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      case 'lost': return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const stats = {
    total: leads.length,
    new: leads.filter(l => l.status === 'new').length,
    hot: leads.filter(l => l.score >= 80).length,
    avgScore: leads.length > 0 ? Math.round(leads.reduce((sum, l) => sum + l.score, 0) / leads.length) : 0,
    converted: leads.filter(l => l.status === 'converted').length
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full py-20">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl mb-2">Leads</h1>
          <p className="text-slate-600 dark:text-slate-400">Manage your customer leads and contacts</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsImportDialogOpen(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Import CSV
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Lead
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Lead</DialogTitle>
                <DialogDescription>Add a new lead to your database</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Name</Label>
                  <Input placeholder="John Doe" />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input placeholder="+1 (555) 123-4567" />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input type="email" placeholder="john@example.com" />
                </div>
                <div>
                  <Label>Source</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="website">Website</SelectItem>
                      <SelectItem value="referral">Referral</SelectItem>
                      <SelectItem value="campaign">Campaign</SelectItem>
                      <SelectItem value="manual">Manual Entry</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full" onClick={() => {
                  toast.success("Lead created successfully");
                  setIsCreateDialogOpen(false);
                }}>
                  Create Lead
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Total Leads</CardTitle>
              <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl mb-1">{stats.total}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              In database
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">New Leads</CardTitle>
              <Plus className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl mb-1">{stats.new}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              This week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Hot Leads</CardTitle>
              <Star className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl mb-1">{stats.hot}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Score 80+
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Avg Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl mb-1">{stats.avgScore}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Out of 100
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Converted</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl mb-1">{stats.converted}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Customers
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by name, phone, email, or company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="qualified">Qualified</SelectItem>
                <SelectItem value="converted">Converted</SelectItem>
                <SelectItem value="lost">Lost</SelectItem>
              </SelectContent>
            </Select>
            <Select value={scoreFilter} onValueChange={setScoreFilter}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Score" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Scores</SelectItem>
                <SelectItem value="hot">Hot (80+)</SelectItem>
                <SelectItem value="warm">Warm (50-79)</SelectItem>
                <SelectItem value="cold">Cold (&lt;50)</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="Website">Website</SelectItem>
                <SelectItem value="Referral">Referral</SelectItem>
                <SelectItem value="Campaign">Campaign</SelectItem>
                <SelectItem value="LinkedIn">LinkedIn</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedLeads.length > 0 && (
        <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={selectedLeads.length === filteredLeads.length}
                  onCheckedChange={toggleSelectAll}
                />
                <span className="text-sm">
                  {selectedLeads.length} lead(s) selected
                </span>
              </div>
              <div className="flex gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="outline">
                      Change Status
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleBulkStatusChange('contacted')}>
                      Mark as Contacted
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkStatusChange('qualified')}>
                      Mark as Qualified
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkStatusChange('converted')}>
                      Mark as Converted
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkStatusChange('lost')}>
                      Mark as Lost
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="outline">
                      Assign Agent
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleBulkAssign('Sales Bot')}>
                      Sales Bot
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkAssign('Support Bot')}>
                      Support Bot
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkAssign('Lead Generator')}>
                      Lead Generator
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button size="sm" variant="destructive" onClick={handleBulkDelete}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Leads Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Leads</CardTitle>
          <CardDescription>
            {filteredLeads.length} {filteredLeads.length === 1 ? 'lead' : 'leads'} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedLeads.length === filteredLeads.length && filteredLeads.length > 0}
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Last Contact</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLeads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-slate-500">
                    No leads found
                  </TableCell>
                </TableRow>
              ) : (
                filteredLeads.map((lead) => (
                  <TableRow key={lead.id} className="hover:bg-slate-50 dark:hover:bg-slate-800">
                    <TableCell>
                      <Checkbox
                        checked={selectedLeads.includes(lead.id)}
                        onCheckedChange={() => toggleSelectLead(lead.id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{lead.name}</TableCell>
                    <TableCell className="text-slate-600 dark:text-slate-400">
                      {lead.company || '-'}
                    </TableCell>
                    <TableCell>{lead.phone}</TableCell>
                    <TableCell className="text-slate-600 dark:text-slate-400">{lead.email}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Star className={`h-4 w-4 ${getScoreColor(lead.score)}`} />
                        <span className={getScoreColor(lead.score)}>{lead.score}</span>
                        <Badge variant="outline" className={`text-xs ${getScoreColor(lead.score)}`}>
                          {getScoreLabel(lead.score)}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(lead.status)} variant="outline">
                        {lead.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-600 dark:text-slate-400">{lead.source}</TableCell>
                    <TableCell className="text-slate-500">{formatDate(lead.lastContact)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="ghost">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => {
                            setSelectedLead(lead);
                            setIsDetailDialogOpen(true);
                          }}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Phone className="h-4 w-4 mr-2" />
                            Call Lead
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Mail className="h-4 w-4 mr-2" />
                            Send Email
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Lead
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600" onClick={() => {
                            setConfirmDialog({
                              isOpen: true,
                              title: "Delete Lead",
                              message: `Are you sure you want to delete "${lead.name}"?`,
                              onConfirm: () => {
                                setLeads(leads.filter(l => l.id !== lead.id));
                                toast.success("Lead deleted");
                                setConfirmDialog({ ...confirmDialog, isOpen: false });
                              }
                            });
                          }}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Import Dialog */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Leads from CSV</DialogTitle>
            <DialogDescription>
              Upload a CSV file with your leads data
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="border-2 border-dashed dark:border-slate-700 rounded-lg p-8 text-center">
              <Upload className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-sm mb-2">Drop your CSV file here or click to browse</p>
              <Input
                type="file"
                accept=".csv"
                onChange={handleImport}
                className="max-w-xs mx-auto"
              />
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm">
              <p className="font-medium mb-2">CSV Format:</p>
              <p className="text-slate-700 dark:text-slate-300">
                Your CSV should have columns: Name, Phone, Email, Status, Source, Score, Company
              </p>
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                Example: John Doe,+1 555 123 4567,john@example.com,new,Website,75,Tech Corp
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Lead Detail Dialog */}
      {selectedLead && (
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedLead.name}</DialogTitle>
              <DialogDescription>
                Lead details and activity history
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="info" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="info">Information</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
                <TabsTrigger value="notes">Notes</TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-slate-500">Phone</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Phone className="h-4 w-4 text-slate-400" />
                      <span>{selectedLead.phone}</span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm text-slate-500">Email</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Mail className="h-4 w-4 text-slate-400" />
                      <span>{selectedLead.email}</span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm text-slate-500">Company</Label>
                    <div className="mt-1">{selectedLead.company || 'N/A'}</div>
                  </div>
                  <div>
                    <Label className="text-sm text-slate-500">Source</Label>
                    <div className="mt-1">{selectedLead.source}</div>
                  </div>
                  <div>
                    <Label className="text-sm text-slate-500">Status</Label>
                    <div className="mt-1">
                      <Badge className={getStatusColor(selectedLead.status)} variant="outline">
                        {selectedLead.status}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm text-slate-500">Assigned Agent</Label>
                    <div className="mt-1">{selectedLead.assignedAgent}</div>
                  </div>
                </div>

                <div>
                  <Label className="text-sm text-slate-500 mb-2 block">Lead Score</Label>
                  <div className="flex items-center gap-3">
                    <Progress value={selectedLead.score} className="flex-1" />
                    <div className="flex items-center gap-2">
                      <Star className={`h-5 w-5 ${getScoreColor(selectedLead.score)}`} />
                      <span className={`text-xl font-medium ${getScoreColor(selectedLead.score)}`}>
                        {selectedLead.score}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-slate-500 mt-2">
                    Lead quality: {getScoreLabel(selectedLead.score)}
                  </p>
                </div>

                {selectedLead.tags && selectedLead.tags.length > 0 && (
                  <div>
                    <Label className="text-sm text-slate-500 mb-2 block">Tags</Label>
                    <div className="flex flex-wrap gap-2">
                      {selectedLead.tags.map((tag, idx) => (
                        <Badge key={idx} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="activity" className="space-y-3">
                <div className="space-y-4">
                  <div className="flex gap-3 p-3 border dark:border-slate-700 rounded-lg">
                    <Calendar className="h-5 w-5 text-slate-400 mt-0.5" />
                    <div>
                      <p className="font-medium">Last Contact</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {formatDate(selectedLead.lastContact)} - Outbound call
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3 p-3 border dark:border-slate-700 rounded-lg">
                    <MessageSquare className="h-5 w-5 text-slate-400 mt-0.5" />
                    <div>
                      <p className="font-medium">Email Sent</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        3 days ago - Follow-up email
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3 p-3 border dark:border-slate-700 rounded-lg">
                    <User className="h-5 w-5 text-slate-400 mt-0.5" />
                    <div>
                      <p className="font-medium">Lead Created</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        5 days ago - via {selectedLead.source}
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="notes" className="space-y-3">
                <div className="space-y-3">
                  {selectedLead.notes && (
                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <p className="text-sm">{selectedLead.notes}</p>
                      <p className="text-xs text-slate-500 mt-2">2 days ago</p>
                    </div>
                  )}
                  <Textarea placeholder="Add a note about this lead..." rows={4} />
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Note
                  </Button>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex gap-2 justify-end pt-4 border-t dark:border-slate-700">
              <Button variant="outline">
                <Phone className="h-4 w-4 mr-2" />
                Call Lead
              </Button>
              <Button variant="outline">
                <Mail className="h-4 w-4 mr-2" />
                Send Email
              </Button>
              <Button>
                <Edit className="h-4 w-4 mr-2" />
                Edit Lead
              </Button>
            </div>
          </DialogContent>
        </Dialog>
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
