// app/wallet/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import TegoWallet from "@/components/TegoWallet";

export default function WalletPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error) {
          console.error("getUser error", error);
        }
        if (!cancelled) {
          if (data?.user) {
            setUserId(data.user.id);
          } else {
            router.replace("/login?redirect=/wallet");
          }
        }
      } finally {
        if (!cancelled) setChecking(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (checking || !userId) {
    return (
      <div className="flex h-80 items-center justify-center text-white/70 text-sm">
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        Checking your session…
      </div>
    );
  }

  return <TegoWallet userId={userId} />;
}
