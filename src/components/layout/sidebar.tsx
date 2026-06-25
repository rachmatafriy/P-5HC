"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_GROUPS } from "@/config/navigation";
import { cn } from "@/lib/utils";
import { HeartPulse } from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="glass sticky top-0 hidden h-screen w-64 shrink-0 flex-col overflow-y-auto border-r lg:flex">
      <div className="flex items-center gap-2 px-6 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <HeartPulse className="h-5 w-5" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-bold">PDHRS</p>
          <p className="text-xs text-muted-foreground">Health Recovery</p>
        </div>
      </div>

      <nav className="flex-1 space-y-6 px-3 pb-8">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {group.label}
            </p>
            <ul className="space-y-1">
              {group.items.map((item) => {
                const active = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                        active
                          ? "bg-primary/10 font-medium text-primary"
                          : "text-muted-foreground hover:bg-accent hover:text-foreground",
                      )}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {item.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
