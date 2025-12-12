'use client'
import { useSession } from 'next-auth/react'

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Plus, Webhook, ChevronDown, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface WebhookEvent {
  id: string;
  type: string;
  timestamp: string;
  statusCode: number;
  responseTime: number;
}

interface Webhook {
  id: string;
  url: string;
  description: string;
  events: string[];
  active: boolean;
  secretKey: string;
  lastDelivery: WebhookEvent | null;
  deliveryHistory: WebhookEvent[];
}

interface WebhooksPageProps {
  // TODO: Remove accessToken prop, use useSession() hook instead
  accessToken: string;
}

export default function WebhooksPage({ accessToken }: WebhooksPageProps) {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newWebhookUrl, setNewWebhookUrl] = useState("");
  const [newWebhookDescription, setNewWebhookDescription] = useState("");
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);

  useEffect(() => {
    loadWebhooks();
  }, []);

  const loadWebhooks = async () => {
    try {
      setIsLoading(true);
      // Mock data
      setWebhooks([
        {
          id: "1",
          url: "https://api.example.com/webhooks/epic",
          description: "Production webhook",
          events: ["call.started", "call.completed", "call.failed"],
          active: true,
          secretKey: "whsec_abc123def456",
          lastDelivery: {
            id: "evt_1",
            type: "call.completed",
            timestamp: "2025-10-31T14:22:00Z",
            statusCode: 200,
            responseTime: 145
          },
          deliveryHistory: [
            {
              id: "evt_1",
              type: "call.completed",
              timestamp: "2025-10-31T14:22:00Z",
              statusCode: 200,
              responseTime: 145
            },
            {
              id: "evt_2",
              type: "call.started",
              timestamp: "2025-10-31T14:15:00Z",
              statusCode: 200,
              responseTime: 132
            },
            {
              id: "evt_3",
              type: "call.failed",
              timestamp: "2025-10-31T13:45:00Z",
              statusCode: 500,
              responseTime: 0
            }
          ]
        },
        {
          id: "2",
          url: "https://staging.example.com/webhook",
          description: "Staging environment",
          events: ["agent.created", "agent.updated"],
          active: false,
          secretKey: "whsec_xyz789ghi012",
          lastDelivery: null,
          deliveryHistory: []
        }
      ]);
    } catch (error) {
      console.error('Error loading webhooks:', error);
      toast.error("Failed to load webhooks");
    } finally {
      setIsLoading(false);
    }
  };

  const availableEvents = [
    { id: "call.started", label: "Call Started", description: "Triggered when a call begins" },
    { id: "call.completed", label: "Call Completed", description: "Triggered when a call ends successfully" },
    { id: "call.failed", label: "Call Failed", description: "Triggered when a call fails" },
    { id: "agent.created", label: "Agent Created", description: "Triggered when a new agent is created" },
    { id: "agent.updated", label: "Agent Updated", description: "Triggered when an agent is modified" },
    { id: "campaign.started", label: "Campaign Started", description: "Triggered when a campaign begins" },
    { id: "campaign.completed", label: "Campaign Completed", description: "Triggered when a campaign finishes" },
    { id: "number.assigned", label: "Number Assigned", description: "Triggered when a number is assigned to an agent" }
  ];

  const handleCreateWebhook = () => {
    if (!newWebhookUrl.trim()) {
      toast.error("Please enter a webhook URL");
      return;
    }
    if (selectedEvents.length === 0) {
      toast.error("Please select at least one event");
      return;
    }

    toast.success("Webhook created successfully");
    setIsCreateDialogOpen(false);
    setNewWebhookUrl("");
    setNewWebhookDescription("");
    setSelectedEvents([]);
    loadWebhooks();
  };

  const handleTestWebhook = (webhookId: string) => {
    toast.success("Test payload sent successfully");
  };

  const handleToggleWebhook = (webhookId: string) => {
    toast.success("Webhook status updated");
  };

  const handleDeleteWebhook = (webhookId: string, url: string) => {
    toast.success(`Webhook ${url} deleted`);
    loadWebhooks();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
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
          <h1 className="text-4xl mb-2">Webhooks</h1>
          <p className="text-slate-600">Receive real-time notifications for events</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Webhook
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Webhook</DialogTitle>
              <DialogDescription>Configure a new webhook endpoint to receive events</DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div>
                <Label>Webhook URL</Label>
                <Input
                  placeholder="https://api.example.com/webhooks"
                  value={newWebhookUrl}
                  onChange={(e) => setNewWebhookUrl(e.target.value)}
                />
                <p className="text-sm text-slate-500 mt-1">The endpoint where events will be sent</p>
              </div>

              <div>
                <Label>Description (Optional)</Label>
                <Input
                  placeholder="Production webhook for customer calls"
                  value={newWebhookDescription}
                  onChange={(e) => setNewWebhookDescription(e.target.value)}
                />
              </div>

              <div>
                <Label className="mb-3 block">Events to Subscribe</Label>
                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                  {availableEvents.map((event) => (
                    <div key={event.id} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-slate-50">
                      <Checkbox
                        id={event.id}
                        checked={selectedEvents.includes(event.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedEvents([...selectedEvents, event.id]);
                          } else {
                            setSelectedEvents(selectedEvents.filter(e => e !== event.id));
                          }
                        }}
                      />
                      <div className="flex-1">
                        <label htmlFor={event.id} className="text-sm cursor-pointer">
                          {event.label}
                        </label>
                        <p className="text-xs text-slate-500">{event.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Button className="w-full" onClick={handleCreateWebhook}>
                Create Webhook
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Webhooks List */}
      {webhooks.length === 0 ? (
        <Card>
          <CardContent className="py-20 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
              <Webhook className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl mb-2">No webhooks configured</h3>
            <p className="text-slate-600 mb-4">Set up webhooks to receive real-time event notifications</p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Webhook
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {webhooks.map((webhook) => (
            <Card key={webhook.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-lg">{webhook.url}</CardTitle>
                      <Badge variant="outline" className={webhook.active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}>
                        {webhook.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    {webhook.description && (
                      <CardDescription>{webhook.description}</CardDescription>
                    )}
                  </div>
                  <Switch
                    checked={webhook.active}
                    onCheckedChange={() => handleToggleWebhook(webhook.id)}
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Events */}
                <div>
                  <Label className="text-sm text-slate-500 mb-2 block">Subscribed Events</Label>
                  <div className="flex flex-wrap gap-2">
                    {webhook.events.map((event) => (
                      <Badge key={event} variant="outline" className="bg-blue-50 text-blue-700">
                        {event}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Last Delivery */}
                {webhook.lastDelivery && (
                  <div>
                    <Label className="text-sm text-slate-500 mb-2 block">Last Delivery</Label>
                    <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg">
                      {webhook.lastDelivery.statusCode >= 200 && webhook.lastDelivery.statusCode < 300 ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                      <div className="flex-1 grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <div className="text-slate-500">Event</div>
                          <div>{webhook.lastDelivery.type}</div>
                        </div>
                        <div>
                          <div className="text-slate-500">Time</div>
                          <div>{formatDate(webhook.lastDelivery.timestamp)}</div>
                        </div>
                        <div>
                          <div className="text-slate-500">Status</div>
                          <div>{webhook.lastDelivery.statusCode}</div>
                        </div>
                        <div>
                          <div className="text-slate-500">Response Time</div>
                          <div>{webhook.lastDelivery.responseTime}ms</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Delivery History */}
                {webhook.deliveryHistory.length > 0 && (
                  <Collapsible>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm" className="w-full justify-between">
                        <span>Delivery History ({webhook.deliveryHistory.length})</span>
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Event</TableHead>
                            <TableHead>Timestamp</TableHead>
                            <TableHead>Status Code</TableHead>
                            <TableHead>Response Time</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {webhook.deliveryHistory.map((event) => (
                            <TableRow key={event.id}>
                              <TableCell>{event.type}</TableCell>
                              <TableCell>{formatDate(event.timestamp)}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className={
                                  event.statusCode >= 200 && event.statusCode < 300
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-red-100 text-red-700'
                                }>
                                  {event.statusCode}
                                </Badge>
                              </TableCell>
                              <TableCell>{event.responseTime}ms</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CollapsibleContent>
                  </Collapsible>
                )}

                {/* Secret Key */}
                <div>
                  <Label className="text-sm text-slate-500 mb-2 block">Secret Key (for HMAC verification)</Label>
                  <div className="flex gap-2">
                    <Input value={webhook.secretKey} readOnly className="font-mono text-sm flex-1" />
                    <Button variant="outline" size="sm" onClick={() => {
                      navigator.clipboard.writeText(webhook.secretKey);
                      toast.success("Secret key copied");
                    }}>
                      Copy
                    </Button>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t">
                  <Button variant="outline" onClick={() => handleTestWebhook(webhook.id)}>
                    Test Webhook
                  </Button>
                  <Button variant="outline">Edit</Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" className="text-red-600">Delete</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Webhook?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete the webhook endpoint. You will no longer receive events at {webhook.url}.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-red-600 hover:bg-red-700"
                          onClick={() => handleDeleteWebhook(webhook.id, webhook.url)}
                        >
                          Delete Webhook
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Documentation */}
      <Card>
        <CardHeader>
          <CardTitle>Webhook Documentation</CardTitle>
          <CardDescription>How to integrate webhooks with your application</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="mb-2 block">Example Payload</Label>
            <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg text-sm overflow-x-auto">
{`{
  "id": "evt_abc123",
  "type": "call.completed",
  "timestamp": "2025-10-31T14:22:00Z",
  "data": {
    "call_id": "call_xyz789",
    "from": "+15551234567",
    "to": "+15559876543",
    "duration": 247,
    "outcome": "success",
    "cost": 1.09
  }
}`}
            </pre>
          </div>

          <div>
            <Label className="mb-2 block">Verifying Signatures (Node.js)</Label>
            <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg text-sm overflow-x-auto">
{`const crypto = require('crypto');

function verifySignature(payload, signature, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  const digest = hmac.update(payload).digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(digest)
  );
}`}
            </pre>
          </div>

          <Button variant="outline">View Full Documentation</Button>
        </CardContent>
      </Card>
    </div>
  );
}
