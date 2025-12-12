import { ReactNode, useState } from "react";
import { Shield, LayoutDashboard, Users, DollarSign, BarChart3, FileText, Headphones, Flag, Server, LogOut, Menu, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "@/components/ThemeProvider";
import { Badge } from "@/components/ui/badge";

interface AdminLayoutProps {
  children: ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
  onBackToApp: () => void;
}

const adminNavigation = [
  { id: 'admin-dashboard', name: 'Dashboard', icon: LayoutDashboard, badge: null },
  { id: 'admin-users', name: 'User Management', icon: Users, badge: '247' },
  { id: 'admin-billing', name: 'Billing & Revenue', icon: DollarSign, badge: null },
  { id: 'admin-analytics', name: 'Usage Analytics', icon: BarChart3, badge: null },
  { id: 'admin-audit', name: 'Audit Logs', icon: FileText, badge: null },
  { id: 'admin-support', name: 'Support Tools', icon: Headphones, badge: '3' },
  { id: 'admin-content', name: 'Content Moderation', icon: Flag, badge: '12' },
  { id: 'admin-system', name: 'System & Resources', icon: Server, badge: null },
];

export function AdminLayout({ children, currentPage, onNavigate, onBackToApp }: AdminLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const NavContent = () => (
    <>
      <div className="p-6 border-b dark:border-slate-700 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20">
        <div className="flex items-center gap-2">
          <Shield className="h-8 w-8 text-red-600 dark:text-red-400" />
          <div>
            <div className="text-xl">Admin Panel</div>
            <div className="text-xs text-red-600 dark:text-red-400">Super Admin Access</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {adminNavigation.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                onNavigate(item.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors relative ${
                isActive
                  ? 'bg-red-50 text-red-600 dark:bg-red-900 dark:text-red-300'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="flex-1 text-left">{item.name}</span>
              {item.badge && (
                <Badge variant="secondary" className="ml-auto">
                  {item.badge}
                </Badge>
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t dark:border-slate-700 space-y-2">
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
          onClick={onBackToApp}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Back to User App
        </Button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-72 bg-white dark:bg-slate-800 border-r dark:border-slate-700">
        <NavContent />
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white dark:bg-slate-800 border-b dark:border-slate-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-red-600 dark:text-red-400" />
            <span>Admin Panel</span>
          </div>
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
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
