import { ReactNode } from "react";
import { Bot, LayoutDashboard, MessageSquare, Phone, BarChart3, TestTube2, Users, Megaphone, Store, Palette, Key, Webhook, Settings, CreditCard, LogOut, Menu, Sun, Moon, Radio, ChevronDown, ChevronRight, Wallet, Shield, TrendingUp, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "@/components/ThemeProvider";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface AppLayoutProps {
  children: ReactNode;
  user: any;
  currentPage: string;
  onNavigate: (page: string) => void;
  onSignOut: () => void;
}

const mainNavigation = [
  { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
  { id: 'funnels', name: 'Sales Funnels', icon: TrendingUp },
  { id: 'social-media', name: 'Social Media', icon: Share2 },
  { id: 'agents', name: 'AI Agents', icon: Bot },
  { id: 'phone-numbers', name: 'Phone Numbers', icon: Phone },
  { id: 'live-calls', name: 'Live Calls', icon: Radio },
  { id: 'calls', name: 'Call History', icon: MessageSquare },
  { id: 'testing', name: 'Testing', icon: TestTube2 },
  { id: 'analytics', name: 'Analytics', icon: BarChart3 },
  { id: 'marketplace', name: 'Marketplace', icon: Store },
  { id: 'campaigns', name: 'Campaigns', icon: Megaphone },
  { id: 'leads', name: 'Leads', icon: Users },
];

const settingsNavigation = [
  { id: 'settings', name: 'General', icon: Settings },
  { id: 'personas', name: 'Personas', icon: Users },
  { id: 'billing', name: 'Billing', icon: CreditCard },
  { id: 'api-keys', name: 'API Keys', icon: Key },
  { id: 'webhooks', name: 'Webhooks', icon: Webhook },
  { id: 'white-label', name: 'White Label', icon: Palette },
];

export function AppLayout({ children, user, currentPage, onNavigate, onSignOut }: AppLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(true);
  const { theme, toggleTheme } = useTheme();
  
  // Mock balance - in production, this would come from props or API
  const balance = 47.52;

  const NavContent = () => (
    <>
      <div className="p-6 border-b dark:border-slate-700">
        <div className="flex items-center gap-2">
          <Bot className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          <span className="text-xl">AI Agent Studio</span>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {/* Main Navigation */}
        {mainNavigation.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                onNavigate(item.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-900 dark:text-blue-300'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{item.name}</span>
            </button>
          );
        })}

        <Separator className="my-4 dark:bg-slate-700" />

        {/* Settings Section - Collapsible */}
        <Collapsible open={settingsOpen} onOpenChange={setSettingsOpen}>
          <CollapsibleTrigger className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800">
            <Settings className="h-5 w-5" />
            <span className="flex-1 text-left">Settings</span>
            {settingsOpen ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-1 space-y-1">
            {settingsNavigation.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 pl-12 pr-4 py-2.5 rounded-lg transition-colors text-sm ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-900 dark:text-blue-300'
                      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </CollapsibleContent>
        </Collapsible>
      </nav>

      <div className="p-4 border-t dark:border-slate-700 space-y-2">
        {/* Balance Display - Click to go to Billing */}
        <button
          onClick={() => {
            onNavigate('billing');
            setMobileMenuOpen(false);
          }}
          className="w-full mb-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <div className="text-left">
                <div className="text-xs text-slate-500 dark:text-slate-400">Account Balance</div>
                <div className="text-lg text-slate-900 dark:text-white">${balance.toFixed(2)}</div>
              </div>
            </div>
            <div className="text-xs text-blue-600 dark:text-blue-400">Top up →</div>
          </div>
        </button>

        <div className="mb-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
          <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Signed in as</div>
          <div className="text-sm truncate">{user?.user_metadata?.name || user?.email}</div>
        </div>
        <Button 
          variant="outline" 
          className="w-full mb-2 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-red-200 dark:border-red-800 hover:border-red-300 dark:hover:border-red-700" 
          onClick={() => {
            onNavigate('admin-dashboard');
            setMobileMenuOpen(false);
          }}
        >
          <Shield className="h-4 w-4 mr-2 text-red-600 dark:text-red-400" />
          <span className="text-red-600 dark:text-red-400">Admin Panel</span>
        </Button>
        <Button 
          variant="outline" 
          className="w-full" 
          onClick={toggleTheme}
        >
          {theme === "light" ? (
            <><Moon className="h-4 w-4 mr-2" /> Dark Mode</>
          ) : (
            <><Sun className="h-4 w-4 mr-2" /> Light Mode</>
          )}
        </Button>
        <Button 
          variant="outline" 
          className="w-full" 
          onClick={onSignOut}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-white dark:bg-slate-800 border-r dark:border-slate-700">
        <NavContent />
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white dark:bg-slate-800 border-b dark:border-slate-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <span>AI Agent Studio</span>
          </div>
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <div className="flex flex-col h-full">
                <NavContent />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 lg:ml-0 mt-14 lg:mt-0">
        {children}
      </main>
    </div>
  );
}
