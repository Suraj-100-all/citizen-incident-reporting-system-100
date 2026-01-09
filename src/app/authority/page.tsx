"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function AuthorityPage() {
  const router = useRouter();

  useEffect(() => {
    const savedAuth = localStorage.getItem("authority_auth");
    if (savedAuth) {
      const auth = JSON.parse(savedAuth);
      if (auth.isLoggedIn) {
        router.push("/authority/dashboard");
        return;
      }
    }
    router.push("/authority/login");
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
    </div>
  );
}
