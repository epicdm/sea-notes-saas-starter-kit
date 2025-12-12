'use client'
import { useSession } from 'next-auth/react'

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Building, Bell, Key, CreditCard, AlertTriangle, Users, Plus, Trash2, Shield, Mail } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
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

interface SettingsPageProps {
  // TODO: Remove accessToken prop, use useSession() hook instead
  accessToken: string;
  user: any;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'member' | 'viewer';
  status: 'active' | 'pending';
  joinedDate: string;
}

export default function SettingsPage({ accessToken, user }: SettingsPageProps) {
  const [activeTab, setActiveTab] = useState("profile");
  const [isInviteMemberOpen, setIsInviteMemberOpen] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    { id: '1', name: 'John Doe', email: 'john@example.com', role: 'admin', status: 'active', joinedDate: '2025-01-15' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'member', status: 'active', joinedDate: '2025-02-20' },
    { id: '3', name: 'Bob Wilson', email: 'bob@example.com', role: 'viewer', status: 'pending', joinedDate: '2025-10-30' }
  ]);

  const handleSave = () => {
    toast.success("Settings saved successfully");
  };

  const handleInviteMember = () => {
    setIsInviteMemberOpen(false);
    toast.success("Invitation sent successfully");
  };

  const handleRemoveMember = (id: string) => {
    setTeamMembers(teamMembers.filter(m => m.id !== id));
    toast.success("Team member removed");
  };

  const handleChangeRole = (id: string, newRole: TeamMember['role']) => {
    setTeamMembers(teamMembers.map(m => m.id === id ? { ...m, role: newRole } : m));
    toast.success("Role updated");
  };

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-4xl mb-2">Settings</h1>
          <p className="text-slate-600">Manage your account preferences and settings</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="profile">
              <User className="h-4 w-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="account">
              <Building className="h-4 w-4 mr-2" />
              Account
            </TabsTrigger>
            <TabsTrigger value="team">
              <Users className="h-4 w-4 mr-2" />
              Team
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="api">
              <Key className="h-4 w-4 mr-2" />
              API
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src="" />
                    <AvatarFallback className="text-2xl">
                      {user?.user_metadata?.name?.charAt(0) || user?.email?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Button variant="outline" size="sm">Upload Photo</Button>
                    <p className="text-sm text-slate-500 mt-1">JPG, PNG or GIF. Max 2MB.</p>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Full Name</Label>
                    <Input defaultValue={user?.user_metadata?.name || ""} placeholder="John Doe" />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input type="email" defaultValue={user?.email || ""} />
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input type="tel" placeholder="+1 (555) 123-4567" />
                  </div>
                  <div>
                    <Label>Timezone</Label>
                    <Select defaultValue="america-new_york">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="america-new_york">America/New York (EST)</SelectItem>
                        <SelectItem value="america-los_angeles">America/Los Angeles (PST)</SelectItem>
                        <SelectItem value="america-chicago">America/Chicago (CST)</SelectItem>
                        <SelectItem value="europe-london">Europe/London (GMT)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button onClick={handleSave}>Save Changes</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Account Tab */}
          <TabsContent value="account" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Company Information</CardTitle>
                <CardDescription>Manage your company details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Company Name</Label>
                  <Input placeholder="Acme Inc." />
                </div>
                <div>
                  <Label>Industry</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="retail">Retail</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Company Size</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-10">1-10 employees</SelectItem>
                      <SelectItem value="11-50">11-50 employees</SelectItem>
                      <SelectItem value="51-200">51-200 employees</SelectItem>
                      <SelectItem value="201+">201+ employees</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleSave}>Save Changes</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Security</CardTitle>
                <CardDescription>Manage your password and security settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Current Password</Label>
                  <Input type="password" />
                </div>
                <div>
                  <Label>New Password</Label>
                  <Input type="password" />
                </div>
                <div>
                  <Label>Confirm New Password</Label>
                  <Input type="password" />
                </div>
                <Button onClick={handleSave}>Update Password</Button>

                <Separator className="my-6" />

                <div className="flex items-center justify-between">
                  <div>
                    <div>Two-Factor Authentication</div>
                    <div className="text-sm text-slate-500">Add an extra layer of security</div>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>

            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-red-600">Danger Zone</CardTitle>
                <CardDescription>Irreversible account actions</CardDescription>
              </CardHeader>
              <CardContent>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Delete Account
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your account
                        and remove your data from our servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction className="bg-red-600 hover:bg-red-700">
                        Delete Account
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Team Tab */}
          <TabsContent value="team" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Team Members</CardTitle>
                    <CardDescription>Manage your team and permissions</CardDescription>
                  </div>
                  <Button onClick={() => setIsInviteMemberOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Invite Member
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teamMembers.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell className="font-medium">{member.name}</TableCell>
                        <TableCell className="text-slate-600 dark:text-slate-400">{member.email}</TableCell>
                        <TableCell>
                          <Select 
                            value={member.role}
                            onValueChange={(value) => handleChangeRole(member.id, value as TeamMember['role'])}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="member">Member</SelectItem>
                              <SelectItem value="viewer">Viewer</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={member.status === 'active' ? 'default' : 'outline'}
                            className={member.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : ''}
                          >
                            {member.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-500">
                          {new Date(member.joinedDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleRemoveMember(member.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Role Permissions</CardTitle>
                <CardDescription>Understanding team roles</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex gap-3 p-3 border dark:border-slate-700 rounded-lg">
                    <Shield className="h-5 w-5 text-purple-600 mt-0.5" />
                    <div className="flex-1">
                      <div className="font-medium">Admin</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        Full access to all features, including billing and team management
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3 p-3 border dark:border-slate-700 rounded-lg">
                    <User className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <div className="font-medium">Member</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        Can create and manage agents, campaigns, and view analytics
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3 p-3 border dark:border-slate-700 rounded-lg">
                    <Bell className="h-5 w-5 text-green-600 mt-0.5" />
                    <div className="flex-1">
                      <div className="font-medium">Viewer</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        Read-only access to view agents, campaigns, and analytics
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Email Notifications</CardTitle>
                <CardDescription>Manage what emails you receive</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div>Call Completed</div>
                    <div className="text-sm text-slate-500">Get notified when a call ends</div>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <div>Agent Errors</div>
                    <div className="text-sm text-slate-500">Get alerted about agent failures</div>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <div>Daily Summary</div>
                    <div className="text-sm text-slate-500">Receive daily activity report</div>
                  </div>
                  <Switch />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <div>Weekly Report</div>
                    <div className="text-sm text-slate-500">Weekly analytics and insights</div>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>SMS Notifications</CardTitle>
                <CardDescription>Manage text message alerts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div>Critical Alerts Only</div>
                    <div className="text-sm text-slate-500">Only urgent issues via SMS</div>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Webhook Notifications</CardTitle>
                <CardDescription>Configure real-time webhook events</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Webhook URL</Label>
                  <Input placeholder="https://api.example.com/webhook" />
                </div>
                <div className="text-sm text-slate-500">
                  We'll send POST requests to this URL for configured events
                </div>
                <Button variant="outline">Configure Events</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* API Tab */}
          <TabsContent value="api" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>API Configuration</CardTitle>
                <CardDescription>Access your API settings and documentation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>API Endpoint</Label>
                  <div className="flex gap-2">
                    <Input value="https://api.epic.ai/v1" readOnly className="flex-1" />
                    <Button variant="outline" onClick={() => {
                      navigator.clipboard.writeText("https://api.epic.ai/v1");
                      toast.success("Copied to clipboard");
                    }}>
                      Copy
                    </Button>
                  </div>
                </div>

                <Separator />

                <div>
                  <div className="mb-2">Rate Limits</div>
                  <div className="space-y-2 text-sm text-slate-600">
                    <div className="flex justify-between">
                      <span>Requests per minute:</span>
                      <span>100</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Requests per hour:</span>
                      <span>5,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Requests per day:</span>
                      <span>100,000</span>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="flex gap-2">
                  <Button variant="outline">
                    View Documentation
                  </Button>
                  <Button variant="outline">
                    Manage API Keys
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Invite Member Dialog */}
      <Dialog open={isInviteMemberOpen} onOpenChange={setIsInviteMemberOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
            <DialogDescription>
              Send an invitation to join your team
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="invite-email">Email Address</Label>
              <Input id="invite-email" type="email" placeholder="teammate@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="invite-role">Role</Label>
              <Select defaultValue="member">
                <SelectTrigger id="invite-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm">
              <div className="flex gap-2">
                <Mail className="h-4 w-4 text-blue-600 mt-0.5" />
                <div>
                  <div className="font-medium text-blue-900 dark:text-blue-100">Email Invitation</div>
                  <div className="text-blue-700 dark:text-blue-300">
                    An invitation link will be sent to the email address
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsInviteMemberOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleInviteMember}>
              Send Invitation
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
