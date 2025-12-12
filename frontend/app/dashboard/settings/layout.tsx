"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { User, Building2, Users } from "lucide-react";

/**
 * Settings Layout with Tab Navigation
 * Provides consistent navigation across all settings pages
 */

const settingsTabs = [
  {
    name: "Profile",
    href: "/dashboard/settings",
    icon: User,
    description: "Account settings and preferences",
  },
  {
    name: "Brand Profile",
    href: "/dashboard/settings/brand-profile",
    icon: Building2,
    description: "Company brand and voice",
  },
  {
    name: "Personas",
    href: "/dashboard/settings/personas",
    icon: Users,
    description: "AI agent personas",
  },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="h-full">
      {/* Settings Tabs */}
      <div className="border-b border-border bg-card">
        <div className="container max-w-6xl mx-auto px-4">
          <nav className="flex gap-1 -mb-px" aria-label="Settings tabs">
            {settingsTabs.map((tab) => {
              const isActive = pathname === tab.href;
              const Icon = tab.icon;

              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={cn(
                    "flex items-center gap-2 px-4 py-3 border-b-2 text-sm font-medium transition-colors",
                    isActive
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30"
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Page Content */}
      <div className="h-[calc(100%-49px)] overflow-y-auto">{children}</div>
    </div>
  );
}
