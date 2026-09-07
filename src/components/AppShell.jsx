"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "@/hooks/useLocation";
import { useRequests } from "@/hooks/useSocket";
import * as notificationService from "@/services/notificationService";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import Loading from "@/components/Loading";

export default function AppShell({ children }) {
  const { user, loading, logout } = useAuth();
  const { sosState, sendSos, clearSos } = useLocation();
  const router = useRouter();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  const refreshUnread = async () => {
    if (!user) {
      setUnread(0);
      return;
    }
    try {
      const count = await notificationService.unreadCount(user.id);
      setUnread(count);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    refreshUnread();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  useRequests(() => {
    refreshUnread();
  });

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  useEffect(() => {
    if (!sosState) return;
    const timer = setTimeout(() => clearSos(), 20000);
    return () => clearTimeout(timer);
  }, [sosState, clearSos]);

  if (loading) return <Loading full />;
  if (!user) return null;

  const recipCount = sosState ? sosState.recipients.length : 0;

  return (
    <div className="flex min-h-screen">
      <Sidebar
        user={user}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onLogout={logout}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar user={user} unread={unread} onMenu={() => setSidebarOpen(true)} />

        {sosState && (
          <div className="z-30 flex items-center gap-3 border-b border-red-200 bg-red-50 px-4 py-3 md:px-6">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-600 text-white">
              <AlertTriangle className="h-5 w-5" />
            </span>
            <p className="flex-1 text-sm font-medium text-red-700">
              SOS alert sent to {recipCount} loved {recipCount === 1 ? "one" : "ones"} — your live
              location is being shared with them.
            </p>
            <button
              type="button"
              aria-label="Dismiss"
              onClick={clearSos}
              className="rounded-lg p-1.5 text-red-500 hover:bg-red-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 md:px-6 md:py-8">
          {children}
        </main>

        <footer className="border-t border-zinc-200 px-4 py-4 text-center text-xs text-zinc-400 md:px-6">
          LoveOne Tracker — keeping families connected around the world.
        </footer>
      </div>
    </div>
  );
}