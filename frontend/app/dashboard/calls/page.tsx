'use client'
import { useSession } from 'next-auth/react'

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { MessageSquare, Phone, Search, Loader2, Download, ArrowDownCircle, ArrowUpCircle, Filter, X, Calendar as CalendarIcon, Clock, DollarSign, TrendingUp } from "lucide-react";
import { CallLog, getCalls, Agent, getAgents } from "@/lib/api";
import { toast } from "sonner";
import { format } from "date-fns";

interface CallsPageProps {
  onViewCallDetail?: (callId: string) => void;
}

export default function CallsPage({ onViewCallDetail }: CallsPageProps = {}) {
  const [calls, setCalls] = useState<CallLog[]>([]);
  const [filteredCalls, setFilteredCalls] = useState<CallLog[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Filter states
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();
  const [directionFilter, setDirectionFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [agentFilter, setAgentFilter] = useState<string>("all");
  const [outcomeFilter, setOutcomeFilter] = useState<string>("all");
  const [durationRange, setDurationRange] = useState<number[]>([0, 600]); // 0-10 minutes

  useEffect(() => {
    loadData();

    // Listen for agent created events to reload data
    const handleAgentCreated = () => {
      // Small delay to ensure backend has generated mock calls
      setTimeout(() => {
        loadData();
      }, 500);
    };

    window.addEventListener('agentCreated', handleAgentCreated);
    return () => window.removeEventListener('agentCreated', handleAgentCreated);
  }, []);

  // Apply all filters
  useEffect(() => {
    let filtered = [...calls];
    
    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(call => 
        call && call.phoneNumber &&
        (call.phoneNumber.includes(searchQuery) ||
        getAgentName(call.agentId)?.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    // Date range filter
    if (dateFrom) {
      filtered = filtered.filter(call => {
        const callDate = new Date(call.createdAt);
        return callDate >= dateFrom;
      });
    }
    if (dateTo) {
      filtered = filtered.filter(call => {
        const callDate = new Date(call.createdAt);
        const endOfDay = new Date(dateTo);
        endOfDay.setHours(23, 59, 59, 999);
        return callDate <= endOfDay;
      });
    }
    
    // Direction filter
    if (directionFilter !== "all") {
      filtered = filtered.filter(call => call.direction === directionFilter);
    }
    
    // Status/Outcome filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(call => call.outcome === statusFilter);
    }
    
    // Agent filter
    if (agentFilter !== "all") {
      filtered = filtered.filter(call => call.agentId === agentFilter);
    }
    
    // Outcome filter (if different from status)
    if (outcomeFilter !== "all") {
      filtered = filtered.filter(call => call.outcome === outcomeFilter);
    }
    
    // Duration filter
    filtered = filtered.filter(call => {
      return call.duration >= durationRange[0] && call.duration <= durationRange[1];
    });
    
    setFilteredCalls(filtered);
  }, [searchQuery, calls, dateFrom, dateTo, directionFilter, statusFilter, agentFilter, outcomeFilter, durationRange]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [callsData, agentsData] = await Promise.all([
        getCalls(100),
        getAgents()
      ]);
      // Filter out null values
      const validCalls = (callsData.calls || []).filter(call => call != null);
      const validAgents = (agentsData || []).filter(agent => agent != null && agent.id);
      setCalls(validCalls);
      setFilteredCalls(validCalls);
      setAgents(validAgents);
    } catch (error) {
      console.error('Error loading calls:', error);
      toast.error("Failed to load calls");
    } finally {
      setIsLoading(false);
    }
  };

  const getAgentName = (agentId: string) => {
    const agent = agents.find(a => a.id === agentId);
    return agent?.name || 'Unknown';
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Export to CSV function
  const exportToCSV = () => {
    if (filteredCalls.length === 0) {
      toast.error("No calls to export");
      return;
    }

    const headers = ["Date/Time", "Agent", "Phone Number", "Direction", "Duration", "Cost", "Outcome"];
    const csvData = filteredCalls.map(call => [
      call.createdAt ? new Date(call.createdAt).toLocaleString() : 'N/A',
      getAgentName(call.agentId),
      call.phoneNumber || 'N/A',
      call.direction || 'unknown',
      formatDuration(call.duration),
      `$${call.cost || '0.00'}`,
      call.outcome || 'unknown'
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `calls_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success(`Exported ${filteredCalls.length} calls to CSV`);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setDateFrom(undefined);
    setDateTo(undefined);
    setDirectionFilter("all");
    setStatusFilter("all");
    setAgentFilter("all");
    setOutcomeFilter("all");
    setDurationRange([0, 600]);
  };

  // Check if any filters are active
  const hasActiveFilters = searchQuery || dateFrom || dateTo || 
    directionFilter !== "all" || statusFilter !== "all" || 
    agentFilter !== "all" || outcomeFilter !== "all" ||
    durationRange[0] !== 0 || durationRange[1] !== 600;

  // Calculate stats
  const totalCalls = filteredCalls.length;
  const successfulCalls = filteredCalls.filter(c => c.outcome === 'success').length;
  const successRate = totalCalls > 0 ? ((successfulCalls / totalCalls) * 100).toFixed(1) : '0';
  const avgDuration = filteredCalls.length > 0 
    ? Math.floor(filteredCalls.reduce((sum, c) => sum + c.duration, 0) / filteredCalls.length)
    : 0;
  const totalCost = filteredCalls.reduce((sum, c) => sum + parseFloat(c.cost), 0).toFixed(2);
  
  // Calculate today's stats
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const callsToday = filteredCalls.filter(c => new Date(c.createdAt) >= today);
  const totalCallsToday = callsToday.length;
  const avgDurationToday = callsToday.length > 0
    ? Math.floor(callsToday.reduce((sum, c) => sum + c.duration, 0) / callsToday.length)
    : 0;
  const successRateToday = callsToday.length > 0 
    ? ((callsToday.filter(c => c.outcome === 'success').length / callsToday.length) * 100).toFixed(1)
    : '0';
  const totalCostToday = callsToday.reduce((sum, c) => sum + parseFloat(c.cost), 0).toFixed(2);

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
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl mb-2">Call History</h1>
          <p className="text-slate-600 dark:text-slate-400">View and analyze all calls</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Summary Cards - Today's Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Total Calls Today</CardTitle>
              <Phone className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl mb-1">{totalCallsToday}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {totalCalls} total filtered
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Avg Duration Today</CardTitle>
              <Clock className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl mb-1">{formatDuration(avgDurationToday)}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Overall: {formatDuration(avgDuration)}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Success Rate Today</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl mb-1">{successRateToday}%</div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Overall: {successRate}%
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Total Cost Today</CardTitle>
              <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl mb-1">${totalCostToday}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Overall: ${totalCost}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              <CardTitle>Filters</CardTitle>
            </div>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Row 1: Search, Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search phone numbers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Date From */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="justify-start text-left">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateFrom ? format(dateFrom, "PPP") : "From date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateFrom}
                  onSelect={setDateFrom}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            
            {/* Date To */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="justify-start text-left">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateTo ? format(dateTo, "PPP") : "To date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateTo}
                  onSelect={setDateTo}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Row 2: Dropdowns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Direction Filter */}
            <Select value={directionFilter} onValueChange={setDirectionFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Directions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Directions</SelectItem>
                <SelectItem value="inbound">Inbound</SelectItem>
                <SelectItem value="outbound">Outbound</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Agent Filter */}
            <Select value={agentFilter} onValueChange={setAgentFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Agents" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Agents</SelectItem>
                {agents.map(agent => (
                  <SelectItem key={agent.id} value={agent.id}>
                    {agent.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {/* Outcome Filter */}
            <Select value={outcomeFilter} onValueChange={setOutcomeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Outcomes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Outcomes</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="voicemail">Voicemail</SelectItem>
                <SelectItem value="busy">Busy</SelectItem>
                <SelectItem value="no_answer">No Answer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Row 3: Duration Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm">Duration Range</label>
              <span className="text-sm text-slate-500 dark:text-slate-400">
                {formatDuration(durationRange[0])} - {formatDuration(durationRange[1])}
              </span>
            </div>
            <Slider
              value={durationRange}
              onValueChange={setDurationRange}
              min={0}
              max={600}
              step={10}
              className="w-full"
            />
          </div>
        </CardContent>
      </Card>

      {/* Calls Table */}
      {filteredCalls.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <MessageSquare className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-2xl mb-2">No Calls Found</h3>
            <p className="text-slate-600">
              {searchQuery ? 'Try adjusting your search query' : 'Make your first call to see activity here'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="text-left p-4 text-sm">Date/Time</th>
                    <th className="text-left p-4 text-sm">Agent</th>
                    <th className="text-left p-4 text-sm">Phone</th>
                    <th className="text-left p-4 text-sm">Direction</th>
                    <th className="text-left p-4 text-sm">Duration</th>
                    <th className="text-left p-4 text-sm">Cost</th>
                    <th className="text-left p-4 text-sm">Outcome</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredCalls.filter(call => call && call.id).map(call => (
                    <tr 
                      key={call.id} 
                      className="hover:bg-slate-50 transition-colors cursor-pointer"
                      onClick={() => onViewCallDetail?.(call.id)}
                    >
                      <td className="p-4">
                        <div className="text-sm">{call.createdAt ? formatDate(call.createdAt) : 'N/A'}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm">{getAgentName(call.agentId)}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm font-mono">{call.phoneNumber || 'N/A'}</div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {call.direction === 'inbound' ? (
                            <ArrowDownCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <ArrowUpCircle className="h-4 w-4 text-blue-600" />
                          )}
                          <span className="text-sm capitalize">{call.direction || 'unknown'}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm">{call.duration ? formatDuration(call.duration) : '0:00'}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm">${call.cost || '0.00'}</div>
                      </td>
                      <td className="p-4">
                        <Badge variant={
                          call.outcome === 'success' ? 'default' :
                          call.outcome === 'failed' ? 'destructive' :
                          'secondary'
                        }>
                          {call.outcome || 'unknown'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
