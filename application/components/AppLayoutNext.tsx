'use client'

import { ReactNode } from "react"
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { Bot, LayoutDashboard, MessageSquare, Phone, BarChart3, TestTube2, Users, Megaphone, Store, Palette, Key, Webhook, Settings, CreditCard, LogOut, Menu, Sun, Moon, Radio, ChevronDown, ChevronRight, Wallet, Shield, TrendingUp, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useState } from "react"
import { Separator } from "@/components/ui/separator"
import { useTheme } from "@/components/ThemeProvider"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface AppLayoutProps {
  children: ReactNode
}

const mainNavigation = [
  { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { id: 'funnels', name: 'Sales Funnels', icon: TrendingUp, href: '/dashboard/funnels' },
  { id: 'social-media', name: 'Social Media', icon: Share2, href: '/dashboard/social-media' },
  { id: 'agents', name: 'AI Agents', icon: Bot, href: '/dashboard/agents' },
  { id: 'phone-numbers', name: 'Phone Numbers', icon: Phone, href: '/dashboard/phone-numbers' },
  { id: 'live-calls', name: 'Live Calls', icon: Radio, href: '/dashboard/live-listen' },
  { id: 'calls', name: 'Call History', icon: MessageSquare, href: '/dashboard/calls' },
  { id: 'testing', name: 'Testing', icon: TestTube2, href: '/dashboard/testing' },
  { id: 'analytics', name: 'Analytics', icon: BarChart3, href: '/dashboard/analytics' },
  { id: 'marketplace', name: 'Marketplace', icon: Store, href: '/dashboard/marketplace' },
  { id: 'campaigns', name: 'Campaigns', icon: Megaphone, href: '/dashboard/campaigns' },
  { id: 'leads', name: 'Leads', icon: Users, href: '/dashboard/leads' },
]

const settingsNavigation = [
  { id: 'settings', name: 'General', icon: Settings, href: '/dashboard/settings' },
  { id: 'personas', name: 'Personas', icon: Users, href: '/dashboard/personas' },
  { id: 'billing', name: 'Billing', icon: CreditCard, href: '/dashboard/billing' },
  { id: 'api-keys', name: 'API Keys', icon: Key, href: '/dashboard/api-keys' },
  { id: 'webhooks', name: 'Webhooks', icon: Webhook, href: '/dashboard/integrations/webhooks' },
  { id: 'white-label', name: 'White Label', icon: Palette, href: '/dashboard/white-label' },
]

export function AppLayoutNext({ children }: AppLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(true)
  const { theme, toggleTheme } = useTheme()
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()

  // Mock balance - in production, fetch from API
  const balance = 47.52

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/auth/signin' })
  }

  const NavContent = () => (
    <>
      <div className="p-6 border-b dark:border-slate-700">
        <div className="flex items-center gap-2">
          <Bot className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          <span className="text-xl font-semibold text-slate-900 dark:text-white">AI Agent Studio</span>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {/* Main Navigation */}
        {mainNavigation.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.id}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-900 dark:text-blue-300'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{item.name}</span>
            </Link>
          )
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
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`w-full flex items-center gap-3 pl-12 pr-4 py-2.5 rounded-lg transition-colors text-sm ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-900 dark:text-blue-300'
                      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </CollapsibleContent>
        </Collapsible>
      </nav>

      <div className="p-4 border-t dark:border-slate-700 space-y-2">
        {/* Balance Display - Click to go to Billing */}
        <button
          onClick={() => {
            router.push('/dashboard/billing')
            setMobileMenuOpen(false)
          }}
          className="w-full mb-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <div className="text-left">
                <div className="text-xs text-slate-500 dark:text-slate-400">Account Balance</div>
                <div className="text-lg font-semibold text-slate-900 dark:text-white">${balance.toFixed(2)}</div>
              </div>
            </div>
            <div className="text-xs font-medium text-blue-600 dark:text-blue-400">Top up →</div>
          </div>
        </button>

        <div className="mb-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
          <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Signed in as</div>
          <div className="text-sm font-medium text-slate-900 dark:text-white truncate">
            {session?.user?.name || session?.user?.email || 'User'}
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full mb-2 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-red-200 dark:border-red-800 hover:border-red-300 dark:hover:border-red-700"
          onClick={() => {
            router.push('/admin')
            setMobileMenuOpen(false)
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
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </>
  )

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
            <span className="font-semibold text-slate-900 dark:text-white">AI Agent Studio</span>
          </div>
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <div className="flex flex-col h-full bg-white dark:bg-slate-800">
                <NavContent />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-auto lg:ml-0 pt-16 lg:pt-0">
        {children}
      </main>
    </div>
  )
}
