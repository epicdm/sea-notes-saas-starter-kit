'use client'
import { useSession } from 'next-auth/react'

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Play, Pause, Edit, Download, Loader2, BarChart3, Users, Phone, TrendingUp, Clock } from "lucide-react";
import { toast } from "sonner";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface CampaignDetailPageProps {
  // TODO: Remove accessToken prop, use useSession() hook instead
  campaignId: string;
  accessToken: string;
  onBack: () => void;
}

export default function CampaignDetailPage({ campaignId, accessToken, onBack }: CampaignDetailPageProps) {
  const [campaign, setCampaign] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState<any>({});

  useEffect(() => {
    loadCampaignDetail();
  }, [campaignId]);

  const loadCampaignDetail = async () => {
    try {
      setIsLoading(true);
      // Mock comprehensive campaign data
      const mockCampaign = {
        id: campaignId,
        name: "Q4 Sales Outreach",
        description: "End of year sales campaign",
        status: "active",
        progress: 45,
        totalLeads: 500,
        called: 225,
        successful: 167,
        failed: 38,
        pending: 20,
        remaining: 275,
        agentId: "agent1",
        agentName: "Sales Bot",
        schedule: {
          startDate: "2025-11-01",
          endDate: "2025-11-30",
          days: ["monday", "tuesday", "wednesday", "thursday", "friday"],
          startTime: "09:00",
          endTime: "17:00",
          timezone: "America/New_York",
          maxCallsPerDay: 100
        },
        retryLogic: {
          maxAttempts: 3,
          delayMinutes: 60
        },
        metrics: {
          avgCallDuration: 182,
          avgCost: 0.89,
          totalCost: 200.25,
          conversionRate: 33.4,
          answerRate: 74.2
        },
        callsByDay: [
          { date: "Nov 1", calls: 45, successful: 32 },
          { date: "Nov 2", calls: 52, successful: 38 },
          { date: "Nov 3", calls: 38, successful: 28 },
          { date: "Nov 4", calls: 48, successful: 35 },
          { date: "Nov 5", calls: 42, successful: 34 },
        ],
        leads: [
          { id: "1", name: "John Smith", phone: "+15551234567", status: "success", attempts: 1, lastCalled: "2025-11-05T10:30:00Z" },
          { id: "2", name: "Sarah Johnson", phone: "+15559876543", status: "pending", attempts: 0, lastCalled: null },
          { id: "3", name: "Michael Brown", phone: "+15553456789", status: "failed", attempts: 3, lastCalled: "2025-11-04T14:22:00Z" },
          { id: "4", name: "Emily Davis", phone: "+15557890123", status: "success", attempts: 2, lastCalled: "2025-11-05T11:15:00Z" },
          { id: "5", name: "David Wilson", phone: "+15552345678", status: "pending", attempts: 1, lastCalled: "2025-11-03T09:45:00Z" },
        ]
      };
      
      setCampaign(mockCampaign);
      setEditForm(mockCampaign);
    } catch (error) {
      console.error('Error loading campaign:', error);
      toast.error("Failed to load campaign details");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleCampaign = () => {
    const newStatus = campaign.status === 'active' ? 'paused' : 'active';
    setCampaign({ ...campaign, status: newStatus });
    toast.success(`Campaign ${newStatus === 'active' ? 'resumed' : 'paused'}`);
  };

  const handleSaveEdit = () => {
    setCampaign(editForm);
    setIsEditDialogOpen(false);
    toast.success("Campaign updated successfully");
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-700';
      case 'failed': return 'bg-red-100 text-red-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full py-20">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="p-8">
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Campaigns
        </Button>
        <p className="text-slate-600">Campaign not found</p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Campaigns
        </Button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl mb-2">{campaign.name}</h1>
            <p className="text-slate-600">{campaign.description}</p>
          </div>
          <div className="flex gap-2">
            <Badge className={
              campaign.status === 'active' ? 'bg-green-100 text-green-700' :
              campaign.status === 'paused' ? 'bg-yellow-100 text-yellow-700' :
              'bg-slate-100 text-slate-700'
            } variant="outline">
              {campaign.status}
            </Badge>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button onClick={handleToggleCampaign}>
              {campaign.status === 'active' ? (
                <><Pause className="h-4 w-4 mr-2" /> Pause</>
              ) : (
                <><Play className="h-4 w-4 mr-2" /> Resume</>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between text-sm mb-2">
            <span>Campaign Progress</span>
            <span>{campaign.progress}% Complete</span>
          </div>
          <Progress value={campaign.progress} className="mb-4" />
          <div className="grid grid-cols-5 gap-4">
            <div>
              <div className="text-2xl">{campaign.totalLeads}</div>
              <div className="text-sm text-slate-600">Total Leads</div>
            </div>
            <div>
              <div className="text-2xl text-blue-600">{campaign.called}</div>
              <div className="text-sm text-slate-600">Called</div>
            </div>
            <div>
              <div className="text-2xl text-green-600">{campaign.successful}</div>
              <div className="text-sm text-slate-600">Successful</div>
            </div>
            <div>
              <div className="text-2xl text-red-600">{campaign.failed}</div>
              <div className="text-sm text-slate-600">Failed</div>
            </div>
            <div>
              <div className="text-2xl text-slate-600">{campaign.remaining}</div>
              <div className="text-sm text-slate-600">Remaining</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-slate-600 mb-1">
              <Clock className="h-4 w-4" />
              <span className="text-sm">Avg Duration</span>
            </div>
            <div className="text-2xl">{Math.floor(campaign.metrics.avgCallDuration / 60)}m {campaign.metrics.avgCallDuration % 60}s</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-slate-600 mb-1">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm">Conversion Rate</span>
            </div>
            <div className="text-2xl">{campaign.metrics.conversionRate}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-slate-600 mb-1">
              <Phone className="h-4 w-4" />
              <span className="text-sm">Answer Rate</span>
            </div>
            <div className="text-2xl">{campaign.metrics.answerRate}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-slate-600 mb-1">Avg Cost</div>
            <div className="text-2xl">${campaign.metrics.avgCost.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-slate-600 mb-1">Total Cost</div>
            <div className="text-2xl">${campaign.metrics.totalCost.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="leads">Leads</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* OVERVIEW TAB */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Calls Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={campaign.callsByDay}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="calls" stroke="#3B82F6" strokeWidth={2} name="Total Calls" />
                  <Line type="monotone" dataKey="successful" stroke="#10B981" strokeWidth={2} name="Successful" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Campaign Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-600">Agent:</span>
                  <span>{campaign.agentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Start Date:</span>
                  <span>{campaign.schedule.startDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">End Date:</span>
                  <span>{campaign.schedule.endDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Max Calls/Day:</span>
                  <span>{campaign.schedule.maxCallsPerDay}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Retry Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-600">Max Attempts:</span>
                  <span>{campaign.retryLogic.maxAttempts}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Retry Delay:</span>
                  <span>{campaign.retryLogic.delayMinutes} minutes</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* LEADS TAB */}
        <TabsContent value="leads">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Campaign Leads</CardTitle>
                  <CardDescription>{campaign.totalLeads} total leads</CardDescription>
                </div>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export Results
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Attempts</TableHead>
                    <TableHead>Last Called</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaign.leads.map((lead: any) => (
                    <TableRow key={lead.id}>
                      <TableCell>{lead.name}</TableCell>
                      <TableCell className="font-mono text-sm">{lead.phone}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(lead.status)} variant="outline">
                          {lead.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{lead.attempts}</TableCell>
                      <TableCell className="text-sm text-slate-600">
                        {formatDate(lead.lastCalled)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SCHEDULE TAB */}
        <TabsContent value="schedule">
          <Card>
            <CardHeader>
              <CardTitle>Calling Schedule</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Date</Label>
                  <div className="text-lg">{campaign.schedule.startDate}</div>
                </div>
                <div>
                  <Label>End Date</Label>
                  <div className="text-lg">{campaign.schedule.endDate}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Time</Label>
                  <div className="text-lg">{campaign.schedule.startTime}</div>
                </div>
                <div>
                  <Label>End Time</Label>
                  <div className="text-lg">{campaign.schedule.endTime}</div>
                </div>
              </div>

              <div>
                <Label>Active Days</Label>
                <div className="flex gap-2 mt-2">
                  {campaign.schedule.days.map((day: string) => (
                    <Badge key={day} variant="outline" className="capitalize">
                      {day}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label>Timezone</Label>
                <div className="text-lg">{campaign.schedule.timezone}</div>
              </div>

              <div>
                <Label>Max Calls Per Day</Label>
                <div className="text-lg">{campaign.schedule.maxCallsPerDay}</div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SETTINGS TAB */}
        <TabsContent value="settings">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Campaign Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Campaign Name</Label>
                  <div className="text-lg">{campaign.name}</div>
                </div>
                <div>
                  <Label>Description</Label>
                  <div className="text-lg">{campaign.description}</div>
                </div>
                <div>
                  <Label>Agent</Label>
                  <div className="text-lg">{campaign.agentName}</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Retry Logic</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Maximum Retry Attempts</Label>
                  <div className="text-lg">{campaign.retryLogic.maxAttempts}</div>
                </div>
                <div>
                  <Label>Delay Between Retries</Label>
                  <div className="text-lg">{campaign.retryLogic.delayMinutes} minutes</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Campaign</DialogTitle>
            <DialogDescription>Update campaign settings and configuration</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Campaign Name</Label>
              <Input
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Max Calls Per Day</Label>
                <Input
                  type="number"
                  value={editForm.schedule?.maxCallsPerDay}
                  onChange={(e) => setEditForm({
                    ...editForm,
                    schedule: { ...editForm.schedule, maxCallsPerDay: parseInt(e.target.value) }
                  })}
                />
              </div>
              <div>
                <Label>Max Retry Attempts</Label>
                <Input
                  type="number"
                  value={editForm.retryLogic?.maxAttempts}
                  onChange={(e) => setEditForm({
                    ...editForm,
                    retryLogic: { ...editForm.retryLogic, maxAttempts: parseInt(e.target.value) }
                  })}
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveEdit}>
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
