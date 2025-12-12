import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Mic } from "lucide-react";
import { Agent } from "@/utils/api";

interface AgentCardProps {
  agent: Agent;
  onClick: () => void;
}

export function AgentCard({ agent, onClick }: AgentCardProps) {
  return (
    <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={onClick}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {agent.type === 'voice' ? (
              <div className="p-2 bg-blue-100 rounded-lg">
                <Mic className="h-5 w-5 text-blue-600" />
              </div>
            ) : (
              <div className="p-2 bg-purple-100 rounded-lg">
                <MessageSquare className="h-5 w-5 text-purple-600" />
              </div>
            )}
            <div>
              <CardTitle className="text-lg">{agent.name}</CardTitle>
              <p className="text-sm text-slate-500 capitalize">{agent.type} Agent</p>
            </div>
          </div>
          <Badge variant={agent.status === 'active' ? 'default' : 'secondary'}>
            {agent.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-600">Model:</span>
            <span>{agent.model}</span>
          </div>
          {agent.type === 'voice' && agent.voice && (
            <div className="flex justify-between">
              <span className="text-slate-600">Voice:</span>
              <span className="capitalize">{agent.voice}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-slate-600">Language:</span>
            <span>{agent.language}</span>
          </div>
          <div className="flex justify-between text-xs text-slate-400 pt-2">
            <span>Created:</span>
            <span>{new Date(agent.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
