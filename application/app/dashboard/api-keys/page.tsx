'use client'
import { useSession } from 'next-auth/react'

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Copy, Eye, EyeOff, Key, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
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

interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  lastUsed: string | null;
  status: 'active' | 'revoked';
  permissions: string[];
}

interface ApiKeysPageProps {
  // TODO: Remove accessToken prop, use useSession() hook instead
  accessToken: string;
}

export default function ApiKeysPage({ accessToken }: ApiKeysPageProps) {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyPermissions, setNewKeyPermissions] = useState<string[]>([]);
  const [newKeyExpiration, setNewKeyExpiration] = useState("never");
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [showKeyDialog, setShowKeyDialog] = useState(false);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadApiKeys();
  }, []);

  const loadApiKeys = async () => {
    try {
      setIsLoading(true);
      // Mock data
      setApiKeys([
        {
          id: "1",
          name: "Production Server",
          key: "sk_live_********************************",
          createdAt: "2025-10-15T10:30:00Z",
          lastUsed: "2025-10-31T14:22:00Z",
          status: "active",
          permissions: ["read_calls", "create_calls", "manage_agents"]
        },
        {
          id: "2",
          name: "Development",
          key: "sk_test_********************************",
          createdAt: "2025-09-20T09:15:00Z",
          lastUsed: "2025-10-30T16:45:00Z",
          status: "active",
          permissions: ["read_calls"]
        },
        {
          id: "3",
          name: "Old Integration",
          key: "sk_live_********************************",
          createdAt: "2025-08-01T11:00:00Z",
          lastUsed: "2025-09-15T12:30:00Z",
          status: "revoked",
          permissions: ["read_calls", "create_calls"]
        }
      ]);
    } catch (error) {
      console.error('Error loading API keys:', error);
      toast.error("Failed to load API keys");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateKey = () => {
    if (!newKeyName.trim()) {
      toast.error("Please enter a key name");
      return;
    }
    if (newKeyPermissions.length === 0) {
      toast.error("Please select at least one permission");
      return;
    }

    const newKey = `sk_live_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    setGeneratedKey(newKey);
    setIsCreateDialogOpen(false);
    setShowKeyDialog(true);
    setNewKeyName("");
    setNewKeyPermissions([]);
    toast.success("API key created successfully");
  };

  const handleCloseKeyDialog = () => {
    setShowKeyDialog(false);
    setGeneratedKey(null);
    loadApiKeys();
  };

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.success("API key copied to clipboard");
  };

  const maskKey = (key: string) => {
    return `${key.substring(0, 10)}${'•'.repeat(32)}${key.substring(key.length - 4)}`;
  };

  const toggleKeyVisibility = (keyId: string) => {
    setVisibleKeys(prev => {
      const newSet = new Set(prev);
      if (newSet.has(keyId)) {
        newSet.delete(keyId);
      } else {
        newSet.add(keyId);
      }
      return newSet;
    });
  };

  const handleRevokeKey = (keyId: string, keyName: string) => {
    toast.success(`API key "${keyName}" has been revoked`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const permissions = [
    { id: "read_calls", label: "Read Calls", description: "View call history and details" },
    { id: "create_calls", label: "Create Calls", description: "Initiate new calls" },
    { id: "manage_agents", label: "Manage Agents", description: "Create, update, and delete agents" },
    { id: "manage_numbers", label: "Manage Phone Numbers", description: "Buy and manage phone numbers" },
    { id: "manage_campaigns", label: "Manage Campaigns", description: "Create and control campaigns" },
    { id: "admin", label: "Admin Access", description: "Full access to all resources" }
  ];

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
          <h1 className="text-4xl mb-2">API Keys</h1>
          <p className="text-slate-600">Manage your API keys for programmatic access</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create New Key
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create API Key</DialogTitle>
              <DialogDescription>Generate a new API key with specific permissions</DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div>
                <Label>Key Name</Label>
                <Input
                  placeholder="e.g., Production Server, Development, Mobile App"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                />
                <p className="text-sm text-slate-500 mt-1">A descriptive name to identify this key</p>
              </div>

              <div>
                <Label className="mb-3 block">Permissions</Label>
                <div className="space-y-3">
                  {permissions.map((permission) => (
                    <div key={permission.id} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-slate-50">
                      <Checkbox
                        id={permission.id}
                        checked={newKeyPermissions.includes(permission.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setNewKeyPermissions([...newKeyPermissions, permission.id]);
                          } else {
                            setNewKeyPermissions(newKeyPermissions.filter(p => p !== permission.id));
                          }
                        }}
                      />
                      <div className="flex-1">
                        <label htmlFor={permission.id} className="text-sm cursor-pointer">
                          {permission.label}
                        </label>
                        <p className="text-xs text-slate-500">{permission.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>Expiration (Optional)</Label>
                <Select value={newKeyExpiration} onValueChange={setNewKeyExpiration}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="never">Never</SelectItem>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="90">90 days</SelectItem>
                    <SelectItem value="365">1 year</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button className="w-full" onClick={handleCreateKey}>
                Create API Key
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Warning Banner */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Keep your API keys secure. Never share them in publicly accessible areas or commit them to version control.
        </AlertDescription>
      </Alert>

      {/* API Keys Table */}
      <Card>
        <CardHeader>
          <CardTitle>Your API Keys</CardTitle>
          <CardDescription>{apiKeys.length} active and revoked keys</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>API Key</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Last Used</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {apiKeys.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                    No API keys yet. Create one to get started.
                  </TableCell>
                </TableRow>
              ) : (
                apiKeys.map((key) => (
                  <TableRow key={key.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Key className="h-4 w-4 text-slate-400" />
                        <span>{key.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="text-sm bg-slate-100 px-2 py-1 rounded">
                          {visibleKeys.has(key.id) ? key.key : maskKey(key.key)}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleKeyVisibility(key.id)}
                        >
                          {visibleKeys.has(key.id) ? (
                            <EyeOff className="h-3 w-3" />
                          ) : (
                            <Eye className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-slate-500">
                      {formatDate(key.createdAt)}
                    </TableCell>
                    <TableCell className="text-sm text-slate-500">
                      {key.lastUsed ? formatDate(key.lastUsed) : 'Never'}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={key.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}
                      >
                        {key.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyKey(key.key)}
                          disabled={key.status === 'revoked'}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        {key.status === 'active' && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-red-600">
                                Revoke
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Revoke API Key?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will immediately invalidate the API key "{key.name}". 
                                  Applications using this key will no longer be able to access the API.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-red-600 hover:bg-red-700"
                                  onClick={() => handleRevokeKey(key.id, key.name)}
                                >
                                  Revoke Key
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Documentation */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Start</CardTitle>
          <CardDescription>Get started with the Epic.ai API</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="mb-2 block">cURL</Label>
            <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg text-sm overflow-x-auto">
{`curl https://api.epic.ai/v1/agents \\
  -H "Authorization: Bearer YOUR_API_KEY"`}
            </pre>
          </div>

          <div>
            <Label className="mb-2 block">Python</Label>
            <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg text-sm overflow-x-auto">
{`import requests

headers = {"Authorization": "Bearer YOUR_API_KEY"}
response = requests.get("https://api.epic.ai/v1/agents", headers=headers)
print(response.json())`}
            </pre>
          </div>

          <div>
            <Label className="mb-2 block">JavaScript</Label>
            <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg text-sm overflow-x-auto">
{`const response = await fetch('https://api.epic.ai/v1/agents', {
  headers: { 'Authorization': 'Bearer YOUR_API_KEY' }
});
const data = await response.json();`}
            </pre>
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="outline">View Full Documentation</Button>
            <Button variant="outline">Download SDKs</Button>
          </div>
        </CardContent>
      </Card>

      {/* Generated Key Dialog */}
      <Dialog open={showKeyDialog} onOpenChange={handleCloseKeyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              API Key Created
            </DialogTitle>
            <DialogDescription>
              Save this key now. You won't be able to see it again!
            </DialogDescription>
          </DialogHeader>
          <Alert className="bg-yellow-50 border-yellow-200">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              Make sure to copy your API key now. For security reasons, we won't show it again.
            </AlertDescription>
          </Alert>
          <div className="space-y-4">
            <div>
              <Label>Your API Key</Label>
              <div className="flex gap-2 mt-2">
                <Input value={generatedKey || ""} readOnly className="font-mono text-sm" />
                <Button onClick={() => generatedKey && copyKey(generatedKey)}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
              </div>
            </div>
            <Button className="w-full" onClick={handleCloseKeyDialog}>
              I've Saved My Key
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
