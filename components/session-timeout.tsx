"use client";

import { useEffect, useState } from "react";
import { logoutAction } from "@/src/modules/auth/actions/login.action";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

export function SessionTimeout() {
  const [isTimedOut, setIsTimedOut] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Initialize/reset last activity on component mount
    localStorage.setItem("admin_last_activity", Date.now().toString());

    const updateActivity = () => {
      localStorage.setItem("admin_last_activity", Date.now().toString());
    };

    // Listen to common user activity events
    const activityEvents = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    activityEvents.forEach((event) => {
      window.addEventListener(event, updateActivity, { passive: true });
    });

    // Check inactivity every 10 seconds
    const interval = setInterval(async () => {
      const lastActivityStr = localStorage.getItem("admin_last_activity");
      if (lastActivityStr) {
        const lastActivity = parseInt(lastActivityStr, 10);
        const elapsed = Date.now() - lastActivity;

        if (elapsed >= TIMEOUT_MS) {
          clearInterval(interval);
          localStorage.removeItem("admin_last_activity");

          try {
            await logoutAction();
          } catch (err) {
            console.error("Failed to execute logoutAction:", err);
          }
          // Set state to show the custom alert UI
          setIsTimedOut(true);
        }
      }
    }, 10000);

    return () => {
      activityEvents.forEach((event) => {
        window.removeEventListener(event, updateActivity);
      });
      clearInterval(interval);
    };
  }, []);

  const handleRedirect = () => {
    window.location.href = "/login?reason=timeout";
  };

  if (!isTimedOut) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-background w-full max-w-sm p-6 shadow-2xl rounded-none border border-border/40 text-foreground animate-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3 border-b border-border/20 pb-4 mb-4">
          <div className="bg-amber-100 dark:bg-amber-950/30 p-2 text-amber-600 dark:text-amber-400">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif text-base font-semibold leading-tight text-primary">Sesi Anda Berakhir</h3>
            <p className="font-sans text-[9px] uppercase tracking-widest text-secondary font-bold">Inactivity Timeout</p>
          </div>
        </div>
        <div className="space-y-4">
          <p className="font-sans text-xs text-secondary leading-relaxed">
            Anda telah otomatis keluar dari sistem karena tidak ada aktivitas selama 30 menit. Silakan login kembali untuk melanjutkan.
          </p>
          <Button
            onClick={handleRedirect}
            className="w-full rounded-none font-sans text-xs uppercase tracking-wider py-5"
          >
            Login Kembali
          </Button>
        </div>
      </div>
    </div>
  );
}
