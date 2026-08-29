"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";
import { isAuthenticated, getCurrentUser, toAuthUrl } from "@/services/authService";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [state, setState] = useState<"checking" | "guest" | "authed">("checking");

  useEffect(() => {
    if (!isAuthenticated()) {
      setState("guest");
      router.replace(toAuthUrl(pathname));
      return;
    }
    getCurrentUser()
      .then(() => setState("authed"))
      .catch(() => {
        setState("guest");
        router.replace(toAuthUrl(pathname));
      });
  }, [router, pathname]);

  if (state === "checking") {
    return (
      <main className="cosmic-bg relative flex-1 flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-violet-400 animate-spin" />
        <p className="text-white/50 text-sm mt-3">Checking session...</p>
      </main>
    );
  }

  if (state === "guest") {
    return null;
  }

  return <>{children}</>;
}