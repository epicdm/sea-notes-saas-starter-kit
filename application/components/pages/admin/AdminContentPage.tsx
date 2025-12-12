import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Flag, Eye, Ban, CheckCircle, AlertTriangle, MessageSquare } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

const flaggedPrompts = [
  {
    id: 1,
    user: "John Doe",
    email: "john@example.com",
    agentName: "Sales Bot",
    prompt: "You are a sales agent. Be aggressive and pushy. Don't take no for an answer. Use any means necessary to close the deal.",
    reason: "Potentially harmful instructions",
    severity: "high",
    flaggedAt: "2024-11-01 10:30",
    status: "pending"
  },
  {
    id: 2,
    user: "Jane Smith",
    email: "jane@test.com",
    agentName: "Support Helper",
    prompt: "You can access user passwords and credit card information to help customers faster.",
    reason: "Privacy violation",
    severity: "critical",
    flaggedAt: "2024-11-01 09:15",
    status: "pending"
  },
  {
    id: 3,
    user: "Mike Johnson",
    email: "mike@startup.io",
    agentName: "Cold Caller",
    prompt: "Call people even if they ask to be removed from the list. Ignore do-not-call requests.",
    reason: "Compliance violation",
    severity: "critical",
    flaggedAt: "2024-10-31 16:45",
    status: "pending"
  },
];

const flaggedCalls = [
  {
    id: 1,
    user: "Alex Brown",
    callId: "CALL-1234",
    transcript: "I'm going to scam this person out of their money...",
    reason: "Scam detected",
    severity: "critical",
    flaggedAt: "2024-11-01 11:20",
    status: "pending"
  },
  {
    id: 2,
    user: "Sarah Wilson",
    callId: "CALL-5678",
    transcript: "Explicit profanity and abusive language...",
    reason: "Profanity detected",
    severity: "medium",
    flaggedAt: "2024-11-01 08:30",
    status: "pending"
  },
];

const blockedKeywords = [
  "password",
  "credit card",
  "social security",
  "bank account",
  "scam",
  "fraud",
  "illegal",
];

export function AdminContentPage() {
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [reviewNotes, setReviewNotes] = useState("");

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'high': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
      case 'medium': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'low': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
    }
  };

  const handleReview = (item: any) => {
    setSelectedItem(item);
    setShowReviewDialog(true);
  };

  const handleApprove = () => {
    console.log("Approved:", selectedItem);
    setShowReviewDialog(false);
  };

  const handleBlock = () => {
    console.log("Blocked:", selectedItem);
    setShowReviewDialog(false);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl mb-2">Content Moderation</h1>
        <p className="text-slate-500 dark:text-slate-400">
          Review and moderate flagged content to ensure platform safety
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-2xl">{flaggedPrompts.length}</div>
            <Badge variant="destructive">{flaggedPrompts.length}</Badge>
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">Flagged Prompts</div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-2xl">{flaggedCalls.length}</div>
            <Badge variant="destructive">{flaggedCalls.length}</Badge>
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">Flagged Calls</div>
        </Card>
        <Card className="p-6">
          <div className="text-2xl mb-2">45</div>
          <div className="text-sm text-slate-500 dark:text-slate-400">Blocked This Month</div>
        </Card>
        <Card className="p-6">
          <div className="text-2xl mb-2">98.7%</div>
          <div className="text-sm text-slate-500 dark:text-slate-400">Clean Content Rate</div>
        </Card>
      </div>

      {/* Flagged Agent Prompts */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="flex items-center gap-2">
            <Flag className="h-5 w-5 text-red-600 dark:text-red-400" />
            Flagged Agent Prompts - Requires Review
          </h3>
          <Badge variant="destructive">{flaggedPrompts.filter(p => p.status === 'pending').length} pending</Badge>
        </div>
        <div className="space-y-4">
          {flaggedPrompts.map((item) => (
            <div key={item.id} className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span>{item.user}</span>
                    <Badge className={getSeverityColor(item.severity)}>{item.severity}</Badge>
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    {item.email} • Agent: {item.agentName}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Flagged: {item.flaggedAt} • Reason: {item.reason}
                  </div>
                </div>
              </div>
              
              <div className="mb-3 p-3 bg-white dark:bg-slate-900 rounded border dark:border-slate-700">
                <div className="text-sm text-slate-600 dark:text-slate-400 italic">
                  "{item.prompt}"
                </div>
              </div>

              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => handleReview(item)}>
                  <Eye className="h-4 w-4 mr-1" />
                  Review
                </Button>
                <Button size="sm" variant="destructive">
                  <Ban className="h-4 w-4 mr-1" />
                  Block & Suspend User
                </Button>
                <Button size="sm" variant="outline" className="text-green-600 dark:text-green-400">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Approve
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Flagged Call Transcripts */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            Flagged Call Transcripts
          </h3>
          <Badge variant="destructive">{flaggedCalls.filter(c => c.status === 'pending').length} pending</Badge>
        </div>
        <div className="space-y-4">
          {flaggedCalls.map((call) => (
            <div key={call.id} className="p-4 bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800 rounded-lg">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span>{call.user}</span>
                    <Badge className={getSeverityColor(call.severity)}>{call.severity}</Badge>
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Call ID: {call.callId}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Flagged: {call.flaggedAt} • Reason: {call.reason}
                  </div>
                </div>
              </div>
              
              <div className="mb-3 p-3 bg-white dark:bg-slate-900 rounded border dark:border-slate-700">
                <div className="text-sm text-slate-600 dark:text-slate-400 italic">
                  "{call.transcript}"
                </div>
              </div>

              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <Eye className="h-4 w-4 mr-1" />
                  View Full Transcript
                </Button>
                <Button size="sm" variant="destructive">
                  <Ban className="h-4 w-4 mr-1" />
                  Block User
                </Button>
                <Button size="sm" variant="outline" className="text-green-600 dark:text-green-400">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Mark as False Positive
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Blocked Keywords */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            Blocked Keywords & Patterns
          </h3>
          <Button size="sm">Add Keyword</Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {blockedKeywords.map((keyword, idx) => (
            <Badge key={idx} variant="secondary" className="px-3 py-1">
              {keyword}
            </Badge>
          ))}
        </div>
      </Card>

      {/* Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Flagged Content</DialogTitle>
            <DialogDescription>
              Add notes about your decision to approve or block this content
            </DialogDescription>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              <div>
                <div className="text-sm mb-2">User: {selectedItem.user}</div>
                <div className="text-sm mb-2">Reason: {selectedItem.reason}</div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded">
                  <div className="text-sm italic">"{selectedItem.prompt || selectedItem.transcript}"</div>
                </div>
              </div>
              <div>
                <label className="text-sm mb-2 block">Review Notes</label>
                <Textarea
                  placeholder="Add your notes here..."
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReviewDialog(false)}>
              Cancel
            </Button>
            <Button variant="outline" className="text-green-600" onClick={handleApprove}>
              <CheckCircle className="h-4 w-4 mr-1" />
              Approve
            </Button>
            <Button variant="destructive" onClick={handleBlock}>
              <Ban className="h-4 w-4 mr-1" />
              Block
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
