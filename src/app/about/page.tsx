"use client";

import { Users, Target, Rocket, Sparkles, HeartHandshake, Cpu, Globe2, Linkedin } from "lucide-react";

const COMPANY_NAME = "NSNR23 Future Technology PVT LTD";
const PRODUCT_NAME = "Tego Live";

type TeamMember = {
  name: string;
  role: string;
  tag?: string;
  linkedin?: string;
};

const team: TeamMember[] = [
  {
    name: "Navneet Singh",
    role: "CEO",
    tag: "Vision & Leadership",
    linkedin: "https://www.linkedin.com/in/navneetrajputt/", // TODO: replace with real URL
  },
  {
    name: "Vibhu Pratap",
    role: "CTO",
    tag: "Technology & Architecture",
    linkedin: "https://www.linkedin.com/in/vibhu-pratap-566811278/", // TODO: replace with real URL
  },
  {
    name: "Ankit Sharma",
    role: "Full Stack Engineer / Co-Tech Lead",
    tag: "Product Engineering",
    linkedin: "https://www.linkedin.com/in/ankiittsharma/", // TODO: replace with real URL
  },
  {
    name: "Bhawna Bharti",
    role: "UI / UX Designer",
    tag: "Design & Experience",
    linkedin: "https://www.linkedin.com/in/bhawna-bharti-tego", // TODO: replace with real URL
  },
  {
    name: "Priyanka Goyal",
    role: "Sales Head",
    tag: "Growth & Partnerships",
    linkedin: "https://www.linkedin.com/in/priyanka-goyal-tego", // TODO: replace with real URL
  },
  {
    name: "Soniya",
    role: "Operations Lead",
    tag: "Processes & Support",
    linkedin: "https://www.linkedin.com/in/soniya-tego", // TODO: replace with real URL
  },
  {
    name: "Vikram",
    role: "SEO & Google Ads",
    tag: "Performance Marketing",
    linkedin: "https://www.linkedin.com/in/vikram-seo-tego", // TODO: replace with real URL
  },
  {
    name: "Tamanna Singh",
    role: "Junior Marketing",
    tag: "Brand & Social",
    linkedin: "https://www.linkedin.com/in/tamanna-singh-tego", // TODO: replace with real URL
  },
  {
    name: "Ajay Singh",
    role: "Marketing Manager",
    tag: "Campaign Strategy",
    linkedin: "https://www.linkedin.com/in/ajay-singh-tego", // TODO: replace with real URL
  },
];

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 3);
}

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#050814] text-white overflow-x-hidden">
      {/* Background glows */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-32 -left-32 w-72 h-72 rounded-full bg-[#8B3DFF33] blur-3xl" />
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-[#22C55E33] blur-3xl" />
      </div>

      <div className="relative z-10 px-4 sm:px-6 md:px-10 py-10 sm:py-12 lg:py-16 max-w-6xl mx-auto">
        {/* Eyebrow + Title */}
        <section className="mb-10 sm:mb-12">
          <p className="text-xs sm:text-sm uppercase tracking-[0.22em] text-white/60 mb-3 flex items-center gap-2">
            <span className="inline-block h-1 w-6 rounded-full bg-linear-to-r from-[#8B3DFF] via-[#4F46E5] to-[#22C55E]" />
            About {PRODUCT_NAME}
          </p>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
            Built by{" "}
            <span className="bg-linear-to-r from-[#8B3DFF] via-[#4F46E5] to-[#22C55E] bg-clip-text text-transparent">
              {COMPANY_NAME}
            </span>
          </h1>

          <p className="text-sm sm:text-base text-white/70 max-w-2xl">
            {PRODUCT_NAME} is a new-age social video platform by{" "}
            <span className="font-semibold text-white/90">
              {COMPANY_NAME}
            </span>
            , focused on safe, real-time, one-to-one connections between people
            across the world. We combine solid engineering, thoughtful design,
            and strict safety rules to build a place where strangers can connect
            with confidence.
          </p>
        </section>

        {/* Company cards: Mission / Vision / What we do */}
        <section className="grid gap-4 sm:gap-6 md:grid-cols-3 mb-10 sm:mb-12">
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-3">
              <Target className="h-5 w-5 text-[#22C55E]" />
              <h2 className="text-sm font-semibold tracking-wide uppercase text-white/80">
                Our Mission
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-white/70">
              Make live video conversations{" "}
              <span className="font-semibold text-white">
                safer, smoother, and more human
              </span>{" "}
              for everyone — from the first “hello” to the last goodbye.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-3">
              <Rocket className="h-5 w-5 text-[#8B3DFF]" />
              <h2 className="text-sm font-semibold tracking-wide uppercase text-white/80">
                Our Vision
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-white/70">
              Build a global platform where{" "}
              <span className="font-semibold text-white">
                real people can meet in real time
              </span>{" "}
              without feeling unsafe, judged, or lost in an algorithm.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-5 w-5 text-[#4F46E5]" />
              <h2 className="text-sm font-semibold tracking-wide uppercase text-white/80">
                What We&apos;re Building
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-white/70">
              {PRODUCT_NAME} focuses on{" "}
              <span className="font-semibold text-white">
                low-latency video, smart matching,
              </span>{" "}
              and simple controls, so you spend less time waiting and more time
              actually talking.
            </p>
          </div>
        </section>

        {/* Culture & Values + Tech Stack */}
        <section className="grid gap-4 sm:gap-6 md:grid-cols-2 mb-10 sm:mb-12">
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-3">
              <HeartHandshake className="h-5 w-5 text-[#F97316]" />
              <h2 className="text-sm font-semibold tracking-wide uppercase text-white/80">
                Our Values & Culture
              </h2>
            </div>
            <ul className="space-y-2 text-xs sm:text-sm text-white/70">
              <li>
                • <span className="font-semibold text-white">User safety first</span>{" "}
                — no feature ships if it breaks trust.
              </li>
              <li>
                • <span className="font-semibold text-white">Small team, big ownership</span>{" "}
                — everyone is a builder, not just a title.
              </li>
              <li>
                • <span className="font-semibold text-white">Fast iterations</span> — ship,
                learn, improve, then ship again.
              </li>
              <li>
                • <span className="font-semibold text-white">Clear, honest communication</span> —
                inside the team and with our users.
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-3">
              <Cpu className="h-5 w-5 text-[#22C55E]" />
              <h2 className="text-sm font-semibold tracking-wide uppercase text-white/80">
                Product & Tech Stack
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-white/70 mb-2">
              We use a modern stack that&apos;s tuned for real-time video,
              scalability, and fast development.
            </p>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs sm:text-sm text-white/70">
              <li>• Next.js & React</li>
              <li>• TypeScript</li>
              <li>• Agora for live video</li>
              <li>• Tailwind CSS</li>
              <li>• Supabase / PostgreSQL</li>
              <li>• Edge-friendly APIs</li>
            </ul>
          </div>
        </section>

        {/* Why Tego Live section */}
        <section className="mb-10 sm:mb-12">
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-6 items-start">
            <div className="shrink-0 flex items-center justify-center h-11 w-11 rounded-2xl bg-linear-to-br from-[#8B3DFF] via-[#4F46E5] to-[#22C55E] shadow-lg shadow-black/60">
              <Globe2 className="h-5 w-5 text-white" />
            </div>
            <div className="space-y-2">
              <h2 className="text-lg sm:text-xl font-semibold">
                Why {PRODUCT_NAME} Exists
              </h2>
              <p className="text-xs sm:text-sm text-white/70">
                Most &quot;random video&quot; platforms ignore safety and real conversation
                quality. {PRODUCT_NAME} is built around three simple promises:
              </p>
              <ul className="list-disc ml-4 text-xs sm:text-sm text-white/70 space-y-1.5">
                <li>Real-time matching with minimal lag.</li>
                <li>Clear rules against abuse, spam, and fake users.</li>
                <li>Tools that empower you to control who you talk to.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="mb-8 sm:mb-10">
          <div className="flex items-center justify-between gap-2 mb-4 sm:mb-5">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-5 w-5 text-[#4F46E5]" />
                <h2 className="text-xl sm:text-2xl font-semibold">
                  Our Core Team
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-white/60 max-w-xl">
                A tight-knit team of builders, designers, operators and growth
                specialists working behind {PRODUCT_NAME}.
              </p>
            </div>
          </div>

          {/* Team grid */}
          <div className="grid gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {team.map((member) => (
              <div
                key={member.name}
                className="relative rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors duration-200 p-4 flex flex-col gap-3"
              >
                <div className="flex items-start gap-3">
                  {/* Avatar with initials */}
                  <div className="shrink-0 h-11 w-11 rounded-2xl bg-linear-to-br from-[#8B3DFF] via-[#4F46E5] to-[#22C55E] flex items-center justify-center text-sm font-bold text-white shadow-lg shadow-black/60">
                    {initials(member.name)}
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-white">
                      {member.name}
                    </p>
                    <p className="text-xs text-[#A5B4FC] font-medium">
                      {member.role}
                    </p>
                    {member.tag && (
                      <p className="text-[11px] text-white/60">
                        {member.tag}
                      </p>
                    )}
                  </div>
                </div>

                {/* LinkedIn button */}
                {member.linkedin && (
                  <div className="mt-1">
                    <a
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/30 px-3 py-1.5 text-[11px] font-medium text-white/80 hover:bg-white/10 hover:border-white/40 transition-colors"
                    >
                      <Linkedin className="h-3.5 w-3.5 text-[#A5B4FC]" />
                      <span>View LinkedIn</span>
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Footnote / Location / Legal */}
        <section className="mt-6 border-t border-white/10 pt-4 sm:pt-5 text-xs sm:text-sm text-white/55">
          <p>
            {COMPANY_NAME} is the parent company behind{" "}
            <span className="text-white/85 font-medium">{PRODUCT_NAME}</span>.
            We focus on building modern communication products with privacy and
            safety at the core.
          </p>
          <p className="mt-2 text-white/45">
            For business / partnership enquiries, please contact{" "}
            <span className="text-white/75">support@tego.live</span>.
          </p>
        </section>
      </div>
    </main>
  );
}
