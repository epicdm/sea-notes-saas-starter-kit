'use client'
import { useSession } from 'next-auth/react'

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, Star, CheckCircle2, ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Integration {
  id: string;
  name: string;
  category: string;
  description: string;
  fullDescription: string;
  icon: string;
  rating: number;
  reviews: number;
  installed: boolean;
  featured: boolean;
  features: string[];
}

interface MarketplacePageProps {
  // TODO: Remove accessToken prop, use useSession() hook instead
  accessToken: string;
}

export default function MarketplacePage({ accessToken }: MarketplacePageProps) {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);

  useEffect(() => {
    loadIntegrations();
  }, []);

  const loadIntegrations = async () => {
    try {
      setIsLoading(true);
      // Mock data
      setIntegrations([
        {
          id: "1",
          name: "Salesforce CRM",
          category: "CRM",
          description: "Sync leads and call data with Salesforce",
          fullDescription: "Automatically sync your call data, leads, and contacts with Salesforce CRM. Create new leads from inbound calls and update existing records with call outcomes.",
          icon: "🔷",
          rating: 4.8,
          reviews: 124,
          installed: true,
          featured: true,
          features: [
            "Two-way contact sync",
            "Automatic lead creation",
            "Call logging to records",
            "Custom field mapping",
            "Real-time updates"
          ]
        },
        {
          id: "2",
          name: "HubSpot",
          category: "CRM",
          description: "Marketing automation integration",
          fullDescription: "Connect Epic.ai with HubSpot to create a seamless workflow between your voice AI and marketing automation platform.",
          icon: "🟠",
          rating: 4.7,
          reviews: 98,
          installed: false,
          featured: true,
          features: [
            "Contact synchronization",
            "Deal stage updates",
            "Email campaign triggers",
            "Call transcripts to timeline",
            "Automated workflows"
          ]
        },
        {
          id: "3",
          name: "Twilio",
          category: "Telephony",
          description: "Custom telephony provider",
          fullDescription: "Use your existing Twilio account for telephony services. Bring your own numbers and leverage Twilio's global infrastructure.",
          icon: "📞",
          rating: 4.9,
          reviews: 156,
          installed: false,
          featured: true,
          features: [
            "BYO phone numbers",
            "Global coverage",
            "SMS integration",
            "Advanced call routing",
            "Cost optimization"
          ]
        },
        {
          id: "4",
          name: "Slack",
          category: "Messaging",
          description: "Team notifications and alerts",
          fullDescription: "Get real-time notifications in Slack for important events. Keep your team informed about calls, agent issues, and campaign updates.",
          icon: "💬",
          rating: 4.6,
          reviews: 203,
          installed: true,
          featured: false,
          features: [
            "Real-time notifications",
            "Custom channel routing",
            "Call transcripts",
            "Alert customization",
            "Team collaboration"
          ]
        },
        {
          id: "5",
          name: "Google Sheets",
          category: "Analytics",
          description: "Export data automatically",
          fullDescription: "Automatically export call logs, analytics, and reports to Google Sheets. Create custom dashboards and share data with your team.",
          icon: "📊",
          rating: 4.5,
          reviews: 87,
          installed: false,
          featured: false,
          features: [
            "Scheduled exports",
            "Custom templates",
            "Real-time sync",
            "Multiple sheet support",
            "Data transformation"
          ]
        },
        {
          id: "6",
          name: "Zapier",
          category: "Other",
          description: "Connect to 1000+ apps",
          fullDescription: "Use Zapier to connect Epic.ai with thousands of other applications. Create custom workflows without writing code.",
          icon: "⚡",
          rating: 4.7,
          reviews: 145,
          installed: false,
          featured: true,
          features: [
            "5000+ app integrations",
            "Multi-step workflows",
            "Custom triggers",
            "Conditional logic",
            "No code required"
          ]
        },
        {
          id: "7",
          name: "Microsoft Teams",
          category: "Messaging",
          description: "Collaboration integration",
          fullDescription: "Bring Epic.ai notifications and insights into Microsoft Teams. Enable your team to collaborate on calls and campaigns.",
          icon: "🔷",
          rating: 4.4,
          reviews: 67,
          installed: false,
          featured: false,
          features: [
            "Teams notifications",
            "Call summaries",
            "Shared dashboards",
            "Action approvals",
            "Meeting integration"
          ]
        },
        {
          id: "8",
          name: "Odoo",
          category: "CRM",
          description: "ERP integration",
          fullDescription: "Connect Epic.ai with your Odoo ERP system. Sync customer data, sales orders, and automate business processes.",
          icon: "🟣",
          rating: 4.6,
          reviews: 42,
          installed: false,
          featured: false,
          features: [
            "Customer sync",
            "Order management",
            "Invoice generation",
            "Custom workflows",
            "Multi-module support"
          ]
        }
      ]);
    } catch (error) {
      console.error('Error loading integrations:', error);
      toast.error("Failed to load integrations");
    } finally {
      setIsLoading(false);
    }
  };

  const categories = ["all", "CRM", "Analytics", "Messaging", "Telephony", "Other"];

  const filteredIntegrations = integrations.filter(integration => {
    const matchesSearch = integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         integration.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || integration.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const featuredIntegrations = filteredIntegrations.filter(i => i.featured);
  const otherIntegrations = filteredIntegrations.filter(i => !i.featured);

  const handleInstall = (integration: Integration) => {
    if (integration.installed) {
      toast.success(`${integration.name} is already installed`);
    } else {
      toast.success(`${integration.name} installed successfully`);
      // Reload integrations to update installed status
      loadIntegrations();
    }
    setSelectedIntegration(null);
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
      <div>
        <h1 className="text-4xl mb-2">Marketplace</h1>
        <p className="text-slate-600">Extend Epic.ai with integrations and apps</p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search integrations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={categoryFilter === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCategoryFilter(category)}
                >
                  {category === "all" ? "All" : category}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Featured Integrations */}
      {featuredIntegrations.length > 0 && (
        <div>
          <h2 className="text-2xl mb-4">Featured Integrations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredIntegrations.map((integration) => (
              <IntegrationCard
                key={integration.id}
                integration={integration}
                onSelect={setSelectedIntegration}
              />
            ))}
          </div>
        </div>
      )}

      {/* All Integrations */}
      {otherIntegrations.length > 0 && (
        <div>
          <h2 className="text-2xl mb-4">All Integrations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {otherIntegrations.map((integration) => (
              <IntegrationCard
                key={integration.id}
                integration={integration}
                onSelect={setSelectedIntegration}
              />
            ))}
          </div>
        </div>
      )}

      {filteredIntegrations.length === 0 && (
        <Card>
          <CardContent className="py-20 text-center">
            <p className="text-slate-600">No integrations found matching your criteria</p>
          </CardContent>
        </Card>
      )}

      {/* Integration Detail Dialog */}
      <Dialog open={!!selectedIntegration} onOpenChange={(open) => !open && setSelectedIntegration(null)}>
        <DialogContent className="max-w-2xl">
          {selectedIntegration && (
            <>
              <DialogHeader>
                <div className="flex items-start gap-4">
                  <div className="text-5xl">{selectedIntegration.icon}</div>
                  <div className="flex-1">
                    <DialogTitle className="text-2xl mb-2">{selectedIntegration.name}</DialogTitle>
                    <DialogDescription className="text-base">{selectedIntegration.description}</DialogDescription>
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm">{selectedIntegration.rating}</span>
                      </div>
                      <span className="text-sm text-slate-500">{selectedIntegration.reviews} reviews</span>
                      <Badge>{selectedIntegration.category}</Badge>
                    </div>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-6">
                <div>
                  <h3 className="mb-2">About</h3>
                  <p className="text-slate-600">{selectedIntegration.fullDescription}</p>
                </div>

                <div>
                  <h3 className="mb-3">Features</h3>
                  <ul className="space-y-2">
                    {selectedIntegration.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  {selectedIntegration.installed ? (
                    <>
                      <Button className="flex-1" variant="outline">
                        Configure
                      </Button>
                      <Button variant="outline" className="text-red-600">
                        Uninstall
                      </Button>
                    </>
                  ) : (
                    <Button className="flex-1" onClick={() => handleInstall(selectedIntegration)}>
                      Install Integration
                    </Button>
                  )}
                  <Button variant="outline">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Learn More
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface IntegrationCardProps {
  // TODO: Remove accessToken prop, use useSession() hook instead
  integration: Integration;
  onSelect: (integration: Integration) => void;
}

function IntegrationCard({ integration, onSelect }: IntegrationCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onSelect(integration)}>
      <CardHeader>
        <div className="flex items-start justify-between mb-2">
          <div className="text-4xl">{integration.icon}</div>
          {integration.installed && (
            <Badge className="bg-green-100 text-green-700">Installed</Badge>
          )}
        </div>
        <CardTitle className="text-lg">{integration.name}</CardTitle>
        <CardDescription>{integration.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm">{integration.rating}</span>
            </div>
            <span className="text-sm text-slate-500">({integration.reviews})</span>
          </div>
          <Badge variant="outline">{integration.category}</Badge>
        </div>
      </CardContent>
    </Card>
  );
}
