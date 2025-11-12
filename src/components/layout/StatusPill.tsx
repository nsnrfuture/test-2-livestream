"use client";
import { Status } from "@/components/ACCENT";

export default function StatusPill({ status }: { status: Status }) {
  const map = {
    idle: { text: "Ready to Connect", dot: "bg-emerald-400", icon: "⚡" },
    pairing: { text: "Finding Match", dot: "bg-amber-400", icon: "✨" },
    waiting: { text: "In Queue", dot: "bg-sky-400", icon: "⏳" },
    paired: { text: "Connecting", dot: "bg-emerald-400", icon: "🎉" },
    error: { text: "Needs Retry", dot: "bg-rose-400", icon: "🔄" },
  } as const;

  const { text, dot, icon } = map[status] ?? map.idle;

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-linear-to-r from-white/5 to-white/10 px-4 py-3 text-sm text-white/80 backdrop-blur-sm">
      <span className="text-lg">{icon}</span>
      <div className="flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${dot} animate-ping`} />
        <span className={`h-2 w-2 rounded-full ${dot}`} />
      </div>
      <span className="font-medium">{text}</span>
    </div>
  );
}
