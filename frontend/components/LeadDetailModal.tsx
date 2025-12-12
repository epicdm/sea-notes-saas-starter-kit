import { useState } from 'react';
import { X, Phone, Mail, MapPin, Calendar, TrendingUp, MessageSquare, FileText, Edit, Archive, Trash2, Tag, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface LeadDetailModalProps {
  lead: any;
  open: boolean;
  onClose: () => void;
  onUpdate?: (leadId: string, updates: any) => void;
}

export function LeadDetailModal({ lead, open, onClose, onUpdate }: LeadDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedLead, setEditedLead] = useState(lead);
  const [newNote, setNewNote] = useState('');

  if (!lead) return null;

  const getScoreBadgeColor = (category: string) => {
    switch (category) {
      case 'hot': return 'bg-green-500';
      case 'warm': return 'bg-yellow-500';
      case 'cold': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusBadgeVariant = (status: string): "default" | "secondary" | "outline" | "destructive" => {
    switch (status) {
      case 'booked': return 'default';
      case 'qualified': return 'default';
      case 'contacted': return 'secondary';
      case 'lost': return 'destructive';
      default: return 'outline';
    }
  };

  // Mock call history
  const callHistory = [
    {
      id: 1,
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      duration: 245,
      outcome: 'Qualified',
      notes: 'Discussed budget and timeline. Very interested in 3-bed properties downtown.',
    },
    {
      id: 2,
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      duration: 180,
      outcome: 'Follow-up needed',
      notes: 'Initial contact. Gathering requirements.',
    },
  ];

  // Mock notes
  const notes = [
    {
      id: 1,
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      author: 'AI Agent',
      content: 'Lead expressed strong interest in properties near schools. Has pre-approval for $400K.',
    },
    {
      id: 2,
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      author: 'System',
      content: 'Lead scored 85/100. Automatically categorized as HOT lead.',
    },
  ];

  // Mock engagement timeline
  const engagementData = [
    { date: 'Day 1', score: 30 },
    { date: 'Day 2', score: 45 },
    { date: 'Day 3', score: 65 },
    { date: 'Day 4', score: lead.score },
  ];

  const handleSave = () => {
    if (onUpdate) {
      onUpdate(lead.id, editedLead);
    }
    setIsEditing(false);
    toast.success('Lead updated successfully');
  };

  const handleAddNote = () => {
    if (newNote.trim()) {
      toast.success('Note added');
      setNewNote('');
    }
  };

  const handleStatusChange = (newStatus: string) => {
    setEditedLead({ ...editedLead, status: newStatus });
    if (onUpdate) {
      onUpdate(lead.id, { ...editedLead, status: newStatus });
    }
    toast.success(`Lead status changed to ${newStatus}`);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-2xl mb-2">{lead.name}</DialogTitle>
              <DialogDescription className="flex items-center gap-3 text-base">
                <div className="flex items-center gap-2">
                  <Badge className={getScoreBadgeColor(lead.scoreCategory)}>
                    Score: {lead.score}
                  </Badge>
                  <Badge variant={getStatusBadgeVariant(lead.status)}>
                    {lead.status}
                  </Badge>
                </div>
                <span className="text-slate-600 dark:text-slate-400">
                  Added {new Date(lead.createdAt).toLocaleDateString()}
                </span>
              </DialogDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="absolute right-4 top-4"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Quick Actions */}
        <div className="flex gap-2 mb-4">
          <Select value={editedLead.status} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="qualified">Qualified</SelectItem>
              <SelectItem value="contacted">Contacted</SelectItem>
              <SelectItem value="booked">Booked</SelectItem>
              <SelectItem value="nurturing">Nurturing</SelectItem>
              <SelectItem value="lost">Lost</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => toast.info('Calling lead...')}>
            <Phone className="h-4 w-4 mr-2" />
            Call
          </Button>
          <Button variant="outline" onClick={() => toast.info('Sending email...')}>
            <Mail className="h-4 w-4 mr-2" />
            Email
          </Button>
          <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
            <Edit className="h-4 w-4 mr-2" />
            {isEditing ? 'Cancel' : 'Edit'}
          </Button>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="calls">Call History</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-slate-500" />
                      <div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">Phone</div>
                        {isEditing ? (
                          <Input
                            value={editedLead.phone}
                            onChange={(e) => setEditedLead({ ...editedLead, phone: e.target.value })}
                          />
                        ) : (
                          <div className="font-medium">{lead.phone}</div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-slate-500" />
                      <div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">Email</div>
                        {isEditing ? (
                          <Input
                            value={editedLead.email}
                            onChange={(e) => setEditedLead({ ...editedLead, email: e.target.value })}
                          />
                        ) : (
                          <div className="font-medium">{lead.email}</div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Clock className="h-4 w-4 text-slate-500" />
                      <div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">Last Contact</div>
                        <div className="font-medium">
                          {new Date(lead.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  {isEditing && (
                    <div className="pt-4 border-t dark:border-slate-700">
                      <Button onClick={handleSave} className="w-full">
                        Save Changes
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Qualification Data */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Qualification Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {lead.qualificationData && Object.entries(lead.qualificationData).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-start">
                        <span className="text-sm text-slate-600 dark:text-slate-400 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}:
                        </span>
                        <span className="font-medium text-right">{value as string}</span>
                      </div>
                    ))}
                  </div>

                  <Separator className="my-4" />

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">Lead Score</span>
                      <span className="font-medium">{lead.score}/100</span>
                    </div>
                    <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${getScoreBadgeColor(lead.scoreCategory)}`}
                        style={{ width: `${lead.score}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>Cold (0-40)</span>
                      <span>Warm (40-70)</span>
                      <span>Hot (70+)</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Engagement Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Engagement Overview</CardTitle>
                <CardDescription>Lead interaction metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{callHistory.length}</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Total Calls</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {formatDuration(callHistory.reduce((sum, call) => sum + call.duration, 0))}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Total Time</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{notes.length}</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Notes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {Math.floor((Date.now() - new Date(lead.createdAt).getTime()) / (1000 * 60 * 60 * 24))}d
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Lead Age</div>
                  </div>
                </div>

                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={engagementData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="score" stroke="#10b981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Call History Tab */}
          <TabsContent value="calls" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg">Call History ({callHistory.length})</h3>
              <Button onClick={() => toast.info('Initiating call...')}>
                <Phone className="h-4 w-4 mr-2" />
                New Call
              </Button>
            </div>

            {callHistory.map((call) => (
              <Card key={call.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <div className="font-medium">
                          {call.date.toLocaleDateString()} at {call.date.toLocaleTimeString()}
                        </div>
                        <Badge variant="outline">{formatDuration(call.duration)}</Badge>
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        Outcome: {call.outcome}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <FileText className="h-4 w-4 mr-2" />
                      Transcript
                    </Button>
                  </div>
                  {call.notes && (
                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg text-sm">
                      {call.notes}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {callHistory.length === 0 && (
              <div className="text-center py-12">
                <Phone className="h-16 w-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl mb-2">No Call History</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  No calls have been made to this lead yet.
                </p>
                <Button>
                  <Phone className="h-4 w-4 mr-2" />
                  Make First Call
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Notes Tab */}
          <TabsContent value="notes" className="space-y-4">
            {/* Add Note */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Add Note</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Textarea
                  placeholder="Add a note about this lead..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  rows={3}
                />
                <Button onClick={handleAddNote} disabled={!newNote.trim()}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Add Note
                </Button>
              </CardContent>
            </Card>

            {/* Notes List */}
            <div className="space-y-3">
              {notes.map((note) => (
                <Card key={note.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="font-medium">{note.author}</div>
                        <Badge variant="outline" className="text-xs">
                          {note.date.toLocaleDateString()}
                        </Badge>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      {note.content}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Timeline Tab */}
          <TabsContent value="timeline" className="space-y-4">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-700"></div>

              {/* Timeline events */}
              <div className="space-y-6">
                <div className="relative flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0 z-10">
                    <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1 pt-2">
                    <div className="font-medium">Lead Qualified</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      {new Date(lead.createdAt).toLocaleString()}
                    </div>
                    <p className="text-sm mt-1">
                      Lead scored {lead.score}/100 and was automatically categorized as {lead.scoreCategory} lead.
                    </p>
                  </div>
                </div>

                {callHistory.map((call, index) => (
                  <div key={call.id} className="relative flex gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0 z-10">
                      <Phone className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 pt-2">
                      <div className="font-medium">Call {callHistory.length - index}</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        {call.date.toLocaleString()} • {formatDuration(call.duration)}
                      </div>
                      <p className="text-sm mt-1">{call.notes}</p>
                    </div>
                  </div>
                ))}

                <div className="relative flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 z-10">
                    <Tag className="h-6 w-6 text-slate-600 dark:text-slate-400" />
                  </div>
                  <div className="flex-1 pt-2">
                    <div className="font-medium">Lead Created</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      {new Date(lead.createdAt).toLocaleString()}
                    </div>
                    <p className="text-sm mt-1">
                      Lead entered the funnel via {lead.source || 'phone call'}.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t dark:border-slate-700">
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => toast.info('Archiving lead...')}>
              <Archive className="h-4 w-4 mr-2" />
              Archive
            </Button>
            <Button variant="outline" className="text-red-600" onClick={() => toast.error('Lead deleted')}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
