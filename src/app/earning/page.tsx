"use client";

import {
  Sparkles,
  Users,
  Video,
  ShieldCheck,
  Coins,
  Clock3,
  ArrowLeftRight,
} from "lucide-react";

const ACCENT = "#8B3DFF";

export default function PricingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-linear-to-b from-[#050816] via-[#020617] to-black text-white">
      {/* Decorative glows */}
      <div className="pointer-events-none absolute -top-32 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[rgba(139,61,255,0.45)] blur-3xl opacity-60" />
      <div className="pointer-events-none absolute -bottom-28 -right-16 h-72 w-72 rounded-full bg-[rgba(56,189,248,0.35)] blur-3xl opacity-60" />

      {/* Hero / Heading for Earning Programs */}
      <section className="relative mx-auto max-w-4xl px-4 pt-20 pb-8 text-center">
        <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.22em] text-white/60 backdrop-blur">
          <Sparkles className="h-3 w-3 text-[hsl(265,100%,70%)]" />
          Earn With Tego.live
        </p>

        <h1 className="mt-5 text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight">
          Talk, Stream &amp;{" "}
          <span className="bg-linear-to-r from-[hsl(265,100%,70%)] via-[#a855f7] to-[#38bdf8] bg-clip-text text-transparent">
            Start Earning
          </span>
        </h1>

        <p className="mt-4 text-sm sm:text-base text-white/60 max-w-2xl mx-auto">
          Join as a live creator or a polite stranger. Maintain good behaviour,
          complete the required watch time and talk time, and unlock real earnings on
          Tego.live.
        </p>

        {/* Quick stats row */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-[11px] sm:text-xs text-white/70">
          <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-3 py-1 border border-white/10">
            <Users className="h-3 w-3" />
            2 earning modes – Creator &amp; Stranger
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-3 py-1 border border-white/10">
            <Coins className="h-3 w-3" />
            Coins convert to real money
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-3 py-1 border border-white/10">
            <ShieldCheck className="h-3 w-3" />
            KYC &amp; safety rules mandatory
          </span>
        </div>
      </section>

      {/* Full earning programs content */}
      <EarningProgramsInfo />
    </main>
  );
}

function EarningProgramsInfo() {
  return (
    <section className="relative mt-4 sm:mt-8 max-w-5xl mx-auto px-4 pb-20 text-sm text-white/80">
      {/* Influencer + Global eligibility */}
      <div className="mb-10 grid gap-6 md:grid-cols-2">
        {/* Influencer / Creator requirements */}
        <div className="relative rounded-3xl border border-white/12 bg-white/5 p-5 sm:p-6 backdrop-blur-xl shadow-[0_18px_60px_rgba(0,0,0,0.55)]">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[rgba(139,61,255,0.2)] px-3 py-1 text-[10px] font-semibold text-[hsl(265,100%,80%)]">
            <Video className="h-3 w-3" />
            Creator / Influencer Program
          </div>
          <h3 className="text-base sm:text-lg font-semibold mb-2">
            Influencer / Creator Requirements
          </h3>
          <p className="text-xs sm:text-sm text-white/60 mb-3">
            For users who already have an audience and want to monetise their live streams.
          </p>
          <ul className="space-y-2 text-xs sm:text-sm">
            <li>
              <span className="font-semibold">Minimum 3,000 followers</span> on any one
              social platform (YouTube, Instagram, Facebook, Snapchat, etc.).
            </li>
            <li>
              <span className="font-semibold">3 promotional videos</span> about Tego.live —
              platform introduction, live proof, and features explained.
            </li>
            <li>
              Inside Tego.live:{" "}
              <span className="font-semibold">60 hours</span> live watch time,{" "}
              <span className="font-semibold">5,000 likes</span> and a minimum of{" "}
              <span className="font-semibold">7 days</span> of activity.
            </li>
            <li>
              Gifts → coins. Recommended conversion:{" "}
              <span className="font-semibold">100 coins = ₹5</span> (configurable by Tego).
            </li>
            <li>
              Minimum withdrawal: <span className="font-semibold">₹2000</span>, monthly
              payouts, and KYC is mandatory.
            </li>
          </ul>
        </div>

        {/* Global earning eligibility */}
        <div className="relative rounded-3xl border border-white/12 bg-white/5 p-5 sm:p-6 backdrop-blur-xl shadow-[0_18px_60px_rgba(0,0,0,0.45)]">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-[10px] font-semibold text-white/70">
            <ShieldCheck className="h-3 w-3 text-[hsl(96,100%,70%)]" />
            Eligibility for Earning
          </div>
          <h3 className="text-base sm:text-lg font-semibold mb-2">
            Global Earning Rules
          </h3>
          <p className="text-xs sm:text-sm text-white/60 mb-3">
            These rules apply whether you are a Creator or a Stranger Earner.
          </p>
          <ul className="space-y-2 text-xs sm:text-sm">
            <li>
              <span className="font-semibold">Account age ≥ 30 days</span> on Tego.live.
            </li>
            <li>
              <span className="font-semibold">Total talk time ≥ 100 hours</span> (6,000
              minutes) in stranger calls.
            </li>
            <li>
              <span className="font-semibold">Positive behaviour and manner score:</span>{" "}
              no abuse, no sexual talk, and very few valid reports.
            </li>
            <li>
              Minimum <span className="font-semibold">4.5 / 5 rating</span> required.
            </li>
          </ul>

          {/* Tiny timeline / progress hint */}
          <div className="mt-4 rounded-2xl border border-white/10 bg-black/30 px-3 py-3 text-[11px] text-white/65">
            <div className="flex items-center gap-2 mb-1 font-semibold text-white/80">
              <Clock3 className="h-3 w-3" />
              Journey to Unlock Earnings
            </div>
            <p>
              Days 1–30: normal usage and stranger calls. Once you reach{" "}
              <span className="font-semibold">100+ hours</span> of talk time with a strong
              rating, you become eligible for earnings.
            </p>
          </div>
        </div>
      </div>

      {/* Creator vs Stranger blocks */}
      <div className="mt-4 mb-10 text-center">
        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">
          Two{" "}
          <span className="bg-linear-to-r from-[hsl(265,100%,70%)] to-[#38bdf8] bg-clip-text text-transparent">
            Earning Modes
          </span>
          , One Profile
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-white/60 max-w-2xl mx-auto">
          You can use the same profile to become both a Creator and a Stranger Earner – but
          not at the same time.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Creator earning */}
        <div className="relative rounded-3xl border border-[rgba(139,61,255,0.7)] bg-linear-to-br from-[rgba(139,61,255,0.22)] via-black/70 to-black/80 p-5 sm:p-6 backdrop-blur-xl shadow-[0_18px_60px_rgba(0,0,0,0.65)]">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-[rgba(139,61,255,0.25)] px-3 py-1 text-[10px] font-semibold text-[hsl(265,100%,85%)]">
              <Video className="h-3 w-3" />
              Creator Mode – Live Streamer
            </div>
            <span className="text-[10px] uppercase tracking-[0.18em] text-white/60">
              Live &amp; Entertain
            </span>
          </div>

          <p className="text-xs sm:text-sm text-white/70 mb-3">
            Go live, entertain your audience and earn via coins, gifts and monthly bonuses.
          </p>

          <h4 className="text-xs font-semibold text-white/70 mb-1 flex items-center gap-1.5">
            <ShieldCheck className="h-3 w-3 text-[hsl(96,100%,70%)]" />
            Eligibility:
          </h4>
          <ul className="space-y-1 text-xs sm:text-sm mb-3">
            <li>100+ hours live per month.</li>
            <li>Behaviour rating 4.5+ and low report count.</li>
            <li>Good on-stream manners and a verified profile.</li>
            <li>Optional: 3,000+ followers &amp; 3 promotional videos.</li>
          </ul>

          <h4 className="text-xs font-semibold text-white/70 mb-1 flex items-center gap-1.5">
            <Coins className="h-3 w-3 text-[hsl(48,100%,70%)]" />
            Earning:
          </h4>
          <ul className="space-y-1 text-xs sm:text-sm">
            <li>Coins and gifts from viewers.</li>
            <li>Per-minute or monthly creator bonus (based on campaigns).</li>
            <li>
              All earnings go to your{" "}
              <span className="font-semibold">Creator Wallet</span>.
            </li>
          </ul>
        </div>

        {/* Stranger earning */}
        <div className="relative rounded-3xl border border-white/12 bg-linear-to-br from-white/6 via-black/75 to-black/90 p-5 sm:p-6 backdrop-blur-xl shadow-[0_16px_55px_rgba(0,0,0,0.6)]">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[10px] font-semibold text-white/80">
              <Users className="h-3 w-3" />
              Stranger Mode – Talk &amp; Earn
            </div>
            <span className="text-[10px] uppercase tracking-[0.18em] text-white/60">
              Random Calls
            </span>
          </div>

          <p className="text-xs sm:text-sm text-white/70 mb-3">
            Join polite, respectful random calls and earn per minute based on your talk time.
          </p>

          <h4 className="text-xs font-semibold text-white/70 mb-1 flex items-center gap-1.5">
            <ShieldCheck className="h-3 w-3 text-[hsl(96,100%,70%)]" />
            Eligibility:
          </h4>
          <ul className="space-y-1 text-xs sm:text-sm mb-3">
            <li>Account age ≥ 1 month.</li>
            <li>40+ hours of stranger talk per month.</li>
            <li>No abusive language, no sexual content, no cheating.</li>
            <li>Rating 4.5+ maintained.</li>
          </ul>

          <h4 className="text-xs font-semibold text-white/70 mb-1 flex items-center gap-1.5">
            <Coins className="h-3 w-3 text-[hsl(48,100%,70%)]" />
            Earning:
          </h4>
          <ul className="space-y-1 text-xs sm:text-sm">
            <li>
              Approximately <span className="font-semibold">₹0.10 – ₹0.30</span> per minute
              (configurable by Tego).
            </li>
            <li>Stranger talk milestones and monthly performance rewards.</li>
            <li>
              All earnings go to your{" "}
              <span className="font-semibold">Stranger Wallet</span>.
            </li>
          </ul>
        </div>
      </div>

      {/* Switching & why not both */}
      <div className="mt-12 grid gap-6 md:grid-cols-[1.3fr,0.9fr]">
        {/* Switching logic */}
        <div className="relative rounded-3xl border border-white/12 bg-white/5 p-5 sm:p-6 backdrop-blur-xl shadow-[0_18px_60px_rgba(0,0,0,0.55)]">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[10px] font-semibold text-white/80">
            <ArrowLeftRight className="h-3 w-3" />
            Role Switching
          </div>
          <h3 className="text-base sm:text-lg font-semibold mb-2">
            Role Switching: Creator Mode vs Stranger Mode
          </h3>
          <p className="text-xs sm:text-sm text-white/70 mb-3">
            A single user can apply for both earning roles, but only one mode can be active
            at any given time.
          </p>
          <ul className="space-y-2 text-xs sm:text-sm">
            <li>
              There is a toggle in your profile:{" "}
              <span className="font-semibold">Creator Mode</span> /{" "}
              <span className="font-semibold">Stranger Mode</span>.
            </li>
            <li>
              Whenever you change the mode, the previous one turns off and the new one
              becomes active.
            </li>
            <li>
              For example, you can use Creator Mode in the morning (live earning) and
              Stranger Mode in the evening (talk &amp; earn) – both are allowed, just not at
              the same time.
            </li>
            <li>
              The system will always count only{" "}
              <span className="font-semibold">one active earning role</span>; double earning
              at the same time is not possible.
            </li>
          </ul>

          <div className="mt-4 flex flex-wrap gap-2 text-[11px] text-white/65">
            <span className="rounded-full border border-white/12 bg-black/40 px-3 py-1">
              One account, two roles
            </span>
            <span className="rounded-full border border-white/12 bg-black/40 px-3 py-1">
              Switch modes from your profile
            </span>
          </div>
        </div>

        {/* Why not both at once */}
        <div className="relative rounded-3xl border border-white/12 bg-white/5 p-5 sm:p-6 backdrop-blur-xl shadow-[0_14px_50px_rgba(0,0,0,0.5)]">
          <h3 className="text-base sm:text-lg font-semibold mb-2">
            Why can&apos;t both earnings run together?
          </h3>
          <p className="text-xs sm:text-sm text-white/70 mb-3">
            To keep the system safe, fair and free from cheating, only one earning mode can
            be active for a user at a time.
          </p>
          <ul className="space-y-2 text-xs sm:text-sm">
            <li>Prevents cheating and fake traffic.</li>
            <li>Keeps earnings and data clean and transparent.</li>
            <li>Protects the platform from abuse and automated bots.</li>
            <li>Makes the experience safer and more stable for genuine users.</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
