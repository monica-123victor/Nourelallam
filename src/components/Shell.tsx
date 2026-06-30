"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type Notification = {
  id: number;
  scout_id: number;
  scout_name: string;
  message: string;
  is_read: number;
  created_at: string;
};

const NAV = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/scouts", label: "Scouts" },
  { href: "/attendance", label: "Sessions" },
];

export default function Shell({
  leaderName,
  children,
}: {
  leaderName: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [bellOpen, setBellOpen] = useState(false);

  useEffect(() => {
    fetch("/api/notifications")
      .then((r) => r.json())
      .then(setNotifications)
      .catch(() => {});
  }, [pathname]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  async function markRead(id: number) {
    await fetch(`/api/notifications/${id}`, { method: "PUT" });
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: 1 } : n)));
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-line bg-cream/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-forest text-cream text-sm">
                ⛺
              </span>
              <span className="font-display text-xl text-forest-dark">NourALallam Scouts</span>
            </Link>
            <nav className="hidden gap-1 sm:flex">
              {NAV.map((item) => {
                const active = pathname?.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                      active ? "bg-forest text-cream" : "text-charcoal/70 hover:bg-khaki/30"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                onClick={() => setBellOpen((v) => !v)}
                className="relative flex h-9 w-9 items-center justify-center rounded-full border border-line bg-white text-base"
                aria-label="Notifications"
              >
                🔔
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-ember text-[10px] font-bold text-white">
                    {unreadCount}
                  </span>
                )}
              </button>
              {bellOpen && (
                <div className="absolute right-0 mt-2 w-80 rounded-xl border border-line bg-white shadow-lg">
                  <div className="border-b border-line px-4 py-2 text-sm font-semibold text-charcoal/80">
                    Notifications
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 && (
                      <p className="px-4 py-6 text-center text-sm text-charcoal/50">
                        Nothing here yet.
                      </p>
                    )}
                    {notifications.map((n) => (
                      <button
                        key={n.id}
                        onClick={() => markRead(n.id)}
                        className={`block w-full border-b border-line/60 px-4 py-3 text-left text-sm transition hover:bg-cream ${
                          n.is_read ? "text-charcoal/50" : "text-charcoal"
                        }`}
                      >
                        <span className="block">{n.message}</span>
                        <span className="mt-0.5 block text-xs text-charcoal/40">
                          {new Date(n.created_at).toLocaleString()}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-charcoal">{leaderName}</p>
            </div>
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-4 pb-2 sm:hidden">
          {NAV.map((item) => {
            const active = pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-3 py-1.5 text-sm font-medium whitespace-nowrap transition ${
                  active ? "bg-forest text-cream" : "text-charcoal/70 hover:bg-khaki/30"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">{children}</main>
    </div>
  );
}
