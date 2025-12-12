import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Play, Pause, Edit, BarChart3, Loader2, Target, Calendar, TrendingUp, Users, PhoneCall, CheckCircle, Trash2, Copy, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { ConfirmDialog } from "@/components/ConfirmDialog";

interface Campaign {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  progress: number;
  totalLeads: number;
  called: number;
  successful: number;
  remaining: number;
  agentName: string;
  schedule: string;
}

interface CampaignsPageProps {
  accessToken: string;
  onViewDetail?: (campaignId: string) => void;
}

export function CampaignsPage({ accessToken, onViewDetail }: CampaignsPageProps) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; title: string; message: string; onConfirm: () => void }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {}
  });
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      setIsLoading(true);
      // Mock data
      setCampaigns([
        {
          id: "1",
          name: "Q4 Sales Outreach",
          description: "End of year sales campaign",
          status: "active",
          progress: 45,
          totalLeads: 500,
          called: 225,
          successful: 167,
          remaining: 275,
          agentName: "Sales Bot",
          schedule: "Mon-Fri, 9AM-5PM"
        },
        {
          id: "2",
          name: "Customer Feedback Survey",
          description: "Quarterly satisfaction survey",
          status: "paused",
          progress: 23,
          totalLeads: 300,
          called: 69,
          successful: 54,
          remaining: 231,
          agentName: "Survey Bot",
          schedule: "Daily, 10AM-8PM"
        },
        {
          id: "3",
          name: "Product Launch Announcements",
          description: "New feature announcement calls",
          status: "draft",
          progress: 0,
          totalLeads: 1000,
          called: 0,
          successful: 0,
          remaining: 1000,
          agentName: "Marketing Bot",
          schedule: "Not scheduled"
        }
      ]);
    } catch (error) {
      console.error('Error loading campaigns:', error);
      toast.error("Failed to load campaigns");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-slate-100 text-slate-700';
      case 'active': return 'bg-green-100 text-green-700';
      case 'paused': return 'bg-yellow-100 text-yellow-700';
      case 'completed': return 'bg-blue-100 text-blue-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const handleToggleCampaign = (campaignId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';
    toast.success(`Campaign ${newStatus === 'active' ? 'started' : 'paused'}`);
  };

  const handleCreateCampaign = () => {
    toast.success("Campaign created successfully");
    setIsCreateDialogOpen(false);
    setCurrentStep(1);
  };

  const handleDuplicateCampaign = (campaign: Campaign) => {
    const newCampaign = {
      ...campaign,
      id: `${campaign.id}_copy`,
      name: `${campaign.name} (Copy)`,
      status: 'draft' as const,
      progress: 0,
      called: 0,
      successful: 0,
      remaining: campaign.totalLeads
    };
    setCampaigns([...campaigns, newCampaign]);
    toast.success("Campaign duplicated successfully");
  };

  const handleDeleteCampaign = (campaignId: string, campaignName: string) => {
    setConfirmDialog({
      isOpen: true,
      title: "Delete Campaign",
      message: `Are you sure you want to delete "${campaignName}"? This action cannot be undone.`,
      onConfirm: () => {
        setCampaigns(campaigns.filter(c => c.id !== campaignId));
        toast.success("Campaign deleted");
        setConfirmDialog({ isOpen: false, title: "", message: "", onConfirm: () => {} });
      }
    });
  };

  const handleEditCampaign = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setEditDialogOpen(true);
    toast.info(`Editing campaign: ${campaign.name}`);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      toast.success(`File "${file.name}" uploaded successfully!`);
    }
  };

  // Calculate stats
  const filteredCampaigns = statusFilter === "all" 
    ? campaigns 
    : campaigns.filter(c => c.status === statusFilter);

  const stats = {
    total: campaigns.length,
    active: campaigns.filter(c => c.status === 'active').length,
    totalCalled: campaigns.reduce((sum, c) => sum + c.called, 0),
    totalSuccessful: campaigns.reduce((sum, c) => sum + c.successful, 0),
    successRate: campaigns.length > 0 
      ? Math.round((campaigns.reduce((sum, c) => sum + c.successful, 0) / campaigns.reduce((sum, c) => sum + c.called, 0)) * 100) || 0
      : 0
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full py-20">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl mb-2">Campaigns</h1>
          <p className="text-slate-600 dark:text-slate-400">Launch and manage automated calling campaigns</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
          setIsCreateDialogOpen(open);
          if (!open) setCurrentStep(1);
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Campaign
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Campaign</DialogTitle>
              <DialogDescription>
                Step {currentStep} of 4 - {
                  currentStep === 1 ? "Campaign Details" :
                  currentStep === 2 ? "Upload Leads" :
                  currentStep === 3 ? "Schedule & Settings" :
                  "Review & Launch"
                }
              </DialogDescription>
            </DialogHeader>
            
            {currentStep === 1 && (
              <div className="space-y-4">
                <div>
                  <Label>Campaign Name</Label>
                  <Input placeholder="Q4 Sales Outreach" />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea placeholder="Campaign description..." rows={3} />
                </div>
                <div>
                  <Label>Select Agent</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose an agent" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sales">Sales Bot</SelectItem>
                      <SelectItem value="support">Support Bot</SelectItem>
                      <SelectItem value="survey">Survey Bot</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full" onClick={() => setCurrentStep(2)}>
                  Next: Upload Leads
                </Button>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
                  <div className="text-slate-600 mb-2">Drop CSV file here or click to browse</div>
                  <Button variant="outline">Choose File</Button>
                </div>
                <div className="text-sm text-slate-500">
                  CSV should include: Name, Phone, Email columns
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => setCurrentStep(1)}>
                    Back
                  </Button>
                  <Button className="flex-1" onClick={() => setCurrentStep(3)}>
                    Next: Schedule
                  </Button>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4">
                <div>
                  <Label>Start Date & Time</Label>
                  <Input type="datetime-local" />
                </div>
                <div>
                  <Label>End Date (Optional)</Label>
                  <Input type="datetime-local" />
                </div>
                <div>
                  <Label>Max Calls Per Day</Label>
                  <Input type="number" placeholder="100" />
                </div>
                <div>
                  <Label>Call Window</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input type="time" defaultValue="09:00" />
                    <Input type="time" defaultValue="17:00" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => setCurrentStep(2)}>
                    Back
                  </Button>
                  <Button className="flex-1" onClick={() => setCurrentStep(4)}>
                    Next: Review
                  </Button>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-4">
                <Card>
                  <CardContent className="p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Campaign Name:</span>
                      <span>Q4 Sales Outreach</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Agent:</span>
                      <span>Sales Bot</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Total Leads:</span>
                      <span>500</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Schedule:</span>
                      <span>Mon-Fri, 9AM-5PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Estimated Cost:</span>
                      <span>$150-200</span>
                    </div>
                  </CardContent>
                </Card>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => setCurrentStep(3)}>
                    Back
                  </Button>
                  <Button className="flex-1" onClick={handleCreateCampaign}>
                    Launch Campaign
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Total Campaigns</CardTitle>
              <Target className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl mb-1">{stats.total}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Created
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Active</CardTitle>
              <Play className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl mb-1">{stats.active}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Running now
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Total Calls</CardTitle>
              <PhoneCall className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl mb-1">{stats.totalCalled.toLocaleString()}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              All campaigns
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Successful</CardTitle>
              <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl mb-1">{stats.totalSuccessful.toLocaleString()}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Connections
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Success Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl mb-1">{stats.successRate}%</div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Average
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      {campaigns.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-600 dark:text-slate-400">Filter:</span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={statusFilter === "all" ? "default" : "outline"}
                  onClick={() => setStatusFilter("all")}
                >
                  All
                </Button>
                <Button
                  size="sm"
                  variant={statusFilter === "active" ? "default" : "outline"}
                  onClick={() => setStatusFilter("active")}
                >
                  Active
                </Button>
                <Button
                  size="sm"
                  variant={statusFilter === "paused" ? "default" : "outline"}
                  onClick={() => setStatusFilter("paused")}
                >
                  Paused
                </Button>
                <Button
                  size="sm"
                  variant={statusFilter === "draft" ? "default" : "outline"}
                  onClick={() => setStatusFilter("draft")}
                >
                  Draft
                </Button>
                <Button
                  size="sm"
                  variant={statusFilter === "completed" ? "default" : "outline"}
                  onClick={() => setStatusFilter("completed")}
                >
                  Completed
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Campaigns Grid */}
      {campaigns.length === 0 ? (
        <Card>
          <CardContent className="py-20 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
              <BarChart3 className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl mb-2">No campaigns yet</h3>
            <p className="text-slate-600 mb-4">Launch automated calling campaigns to reach your leads</p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Campaign
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredCampaigns.map((campaign) => (
            <Card key={campaign.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="mb-2">{campaign.name}</CardTitle>
                    <CardDescription>{campaign.description}</CardDescription>
                  </div>
                  <Badge className={getStatusColor(campaign.status)} variant="outline">
                    {campaign.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Progress */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-600">Progress</span>
                    <span>{campaign.progress}%</span>
                  </div>
                  <Progress value={campaign.progress} />
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-2xl">{campaign.totalLeads}</div>
                    <div className="text-sm text-slate-600">Total Leads</div>
                  </div>
                  <div>
                    <div className="text-2xl">{campaign.called}</div>
                    <div className="text-sm text-slate-600">Called ({Math.round((campaign.called / campaign.totalLeads) * 100)}%)</div>
                  </div>
                  <div>
                    <div className="text-2xl text-green-600">{campaign.successful}</div>
                    <div className="text-sm text-slate-600">Successful</div>
                  </div>
                  <div>
                    <div className="text-2xl text-slate-500">{campaign.remaining}</div>
                    <div className="text-sm text-slate-600">Remaining</div>
                  </div>
                </div>

                {/* Agent & Schedule */}
                <div className="pt-4 border-t space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Agent:</span>
                    <span>{campaign.agentName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Schedule:</span>
                    <span>{campaign.schedule}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2 pt-4">
                  <div className="flex gap-2">
                    {campaign.status === 'draft' ? (
                      <Button className="flex-1" onClick={() => handleToggleCampaign(campaign.id, 'draft')}>
                        <Play className="h-4 w-4 mr-2" />
                        Start
                      </Button>
                    ) : campaign.status === 'active' ? (
                      <Button variant="outline" className="flex-1" onClick={() => handleToggleCampaign(campaign.id, campaign.status)}>
                        <Pause className="h-4 w-4 mr-2" />
                        Pause
                      </Button>
                    ) : (
                      <Button className="flex-1" onClick={() => handleToggleCampaign(campaign.id, campaign.status)}>
                        <Play className="h-4 w-4 mr-2" />
                        Resume
                      </Button>
                    )}
                    <Button variant="outline" onClick={() => onViewDetail?.(campaign.id)}>
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Details
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" size="sm">
                      <Edit className="h-3 w-3 mr-2" />
                      Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDuplicateCampaign(campaign)}
                    >
                      <Copy className="h-3 w-3 mr-2" />
                      Duplicate
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDeleteCampaign(campaign.id, campaign.name)}
                    >
                      <Trash2 className="h-3 w-3 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
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
