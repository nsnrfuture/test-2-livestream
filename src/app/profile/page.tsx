"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  Loader2,
  Upload,
  ArrowLeft,
  Sparkles,
  MessageCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";

type ProfileRow = {
  id: string;
  full_name: string | null;
  email: string | null;
  gender: string | null;
  location: string | null;
  avatar_url: string | null;
  earning_mode?: string | null; // "creator" | "stranger" | null
};

export default function ProfilePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [userId, setUserId] = useState<string | null>(null);

  // Profile fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");

  // Gender: male | female | custom | ""
  const [genderSelect, setGenderSelect] = useState("");
  const [customGender, setCustomGender] = useState("");

  const [location, setLocation] = useState("");

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const [error, setError] = useState<string | null>(null);

  // Location auto-detect
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // New: earning mode state
  const [earningMode, setEarningMode] = useState<"" | "creator" | "stranger">(
    ""
  );

  useEffect(() => {
    loadUser();
  }, []);

  /* ---------------- Load user & profile ---------------- */
  async function loadUser() {
    setLoading(true);
    setError(null);

    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData?.user) {
      console.error("auth.getUser error:", userError);
      setLoading(false);
      setError("You must be logged in to view your profile.");
      return;
    }

    const user = userData.user;
    setUserId(user.id);
    setEmail(user.email || "");

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle<ProfileRow>();

    let finalProfile = profile || null;

    if (profileError) {
      console.error(
        "Error loading profile:",
        JSON.stringify(profileError, null, 2)
      );
    }

    if (!finalProfile) {
      const { data: inserted, error: insertError } = await supabase
        .from("profiles")
        .insert({
          id: user.id,
          full_name: user.user_metadata?.full_name || "",
          email: user.email,
        })
        .select()
        .single<ProfileRow>();

      if (insertError) {
        console.error(
          "Error creating profile:",
          JSON.stringify(insertError, null, 2)
        );
        setError("Could not create your profile record.");
        setLoading(false);
        return;
      }

      finalProfile = inserted;
    }

    console.log("Loaded profile from DB:", finalProfile);

    setFullName(finalProfile.full_name || "");
    setLocation(finalProfile.location || "");
    setAvatarPreview(finalProfile.avatar_url || null);

    const g: string = finalProfile.gender || "";

    if (g === "male" || g === "female") {
      setGenderSelect(g);
      setCustomGender("");
    } else if (g) {
      setGenderSelect("custom");
      setCustomGender(g);
    } else {
      setGenderSelect("");
      setCustomGender("");
    }

    // Load earning mode (creator / stranger / null)
    const mode = (finalProfile.earning_mode || "") as
      | ""
      | "creator"
      | "stranger";
    setEarningMode(mode);

    setLoading(false);
  }

  /* ---------------- Upload avatar to storage ---------------- */
  async function uploadAvatar() {
    if (!avatarFile || !userId) {
      console.log("No avatarFile or userId, skipping upload");
      return avatarPreview;
    }

    const fileExt = avatarFile.name.split(".").pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = fileName;

    console.log("Uploading avatar to:", filePath);

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, avatarFile, {
        upsert: true,
      });

    if (uploadError) {
      console.error("Avatar upload error:", uploadError);
      setError("Could not upload avatar. Try again.");
      return avatarPreview;
    }

    console.log("Upload success:", uploadData);

    const { data: publicData } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    console.log("Public URL data:", publicData);

    const url = publicData.publicUrl;
    console.log("Final avatar URL:", url);

    return url;
  }

  /* ---------------- Save profile ---------------- */
  async function handleSave() {
    if (!userId) return;
    setSaving(true);
    setError(null);

    try {
      let avatarURL = avatarPreview;

      if (avatarFile) {
        avatarURL = await uploadAvatar();
        console.log("Avatar URL returned from uploadAvatar:", avatarURL);
      }

      let finalGender = genderSelect;
      if (genderSelect === "custom") {
        finalGender = customGender.trim();
      }

      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          gender: finalGender || null,
          location,
          avatar_url: avatarURL,
          earning_mode: earningMode || null, // NEW: save earning mode
        })
        .eq("id", userId);

      if (updateError) {
        console.error(
          "Profile update error:",
          JSON.stringify(updateError, null, 2)
        );
        setError(
          updateError.message ||
            "Something went wrong while saving your profile."
        );
      } else {
        console.log("Profile updated OK");

        if (avatarURL) {
          setAvatarPreview(avatarURL);
        }
        setAvatarFile(null);

        await loadUser();

        alert("Profile updated successfully!");
      }
    } catch (err: any) {
      console.error("Unexpected error:", err);
      setError(err?.message || "Unexpected error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  /* ---------------- Use current location ---------------- */
  async function handleUseCurrentLocation() {
    setLocationError(null);

    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setLocationError("Geolocation is not supported in this browser.");
      return;
    }

    setLocating(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;

          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );

          if (!res.ok) {
            throw new Error("Failed to fetch location name");
          }

          const data = await res.json();

          const addr = data.address || {};
          const city =
            addr.city ||
            addr.town ||
            addr.village ||
            addr.hamlet ||
            addr.suburb;
          const state = addr.state;
          const country = addr.country;

          const label = [city, state, country].filter(Boolean).join(", ");

          const finalLocation =
            label || `${latitude.toFixed(3)}, ${longitude.toFixed(3)}`;

          setLocation(finalLocation);
        } catch (e) {
          console.error("Reverse geocoding error:", e);
          setLocationError("Couldn't fetch location name. Try again.");
        } finally {
          setLocating(false);
        }
      },
      (err) => {
        console.error("Geolocation error:", err);
        if (err.code === err.PERMISSION_DENIED) {
          setLocationError("Location permission denied.");
        } else {
          setLocationError("Could not get your location.");
        }
        setLocating(false);
      },
      {
        enableHighAccuracy: false,
        timeout: 15000,
      }
    );
  }

  /* ---------------- Helper: text for current mode ---------------- */
  function renderModeDetails() {
    if (earningMode === "creator") {
      return (
        <div className="mt-3 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3.5 py-3 text-[11px] text-amber-50/90 shadow-[0_0_20px_rgba(251,191,36,0.25)]">
          <div className="font-semibold mb-1.5 flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5" />
            Creator Mode – Live Streamer
          </div>
          <ul className="list-disc list-inside space-y-1">
            <li>Go live on Tego.live and earn via gifts &amp; coins.</li>
            <li>Recommended: 3,000+ followers &amp; 3 promo videos.</li>
            <li>Good behaviour, no abuse, rating 4.5+ required.</li>
            <li>All earnings go to your Creator Wallet.</li>
          </ul>
        </div>
      );
    }

    if (earningMode === "stranger") {
      return (
        <div className="mt-3 rounded-xl border border-sky-500/40 bg-sky-500/10 px-3.5 py-3 text-[11px] text-sky-50/90 shadow-[0_0_20px_rgba(56,189,248,0.25)]">
          <div className="font-semibold mb-1.5 flex items-center gap-2">
            <MessageCircle className="h-3.5 w-3.5" />
            Stranger Mode – Talk &amp; Earn
          </div>
          <ul className="list-disc list-inside space-y-1">
            <li>Join random calls, talk politely &amp; earn per minute.</li>
            <li>No abusive / sexual content, no cheating.</li>
            <li>Account age ≥ 30 days, rating 4.5+ required.</li>
            <li>All earnings go to your Stranger Wallet.</li>
          </ul>
        </div>
      );
    }

    return (
      <p className="mt-2 text-[11px] text-neutral-400">
        Choose how you want to earn on Tego.live –{" "}
        <span className="font-medium text-indigo-300">
          Creator Mode
        </span>{" "}
        (live streamer) ya{" "}
        <span className="font-medium text-indigo-300">
          Stranger Mode
        </span>{" "}
        (talk &amp; earn). Ek time pe sirf ek mode active hoga.
      </p>
    );
  }

  const currentModeLabel =
    earningMode === "creator"
      ? "Creator Mode active"
      : earningMode === "stranger"
      ? "Stranger Mode active"
      : "No earning mode selected";

  /* ---------------- Loading / error UI ---------------- */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-white">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
      </div>
    );
  }

  if (error && !userId) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-neutral-950 px-4">
        <div className="max-w-md text-center">
          <p className="text-white mb-3">{error}</p>
          <button
            onClick={() => router.push("/auth/login")}
            className="mt-2 rounded-full bg-indigo-500 hover:bg-indigo-600 px-4 py-2 text-sm font-medium text-white"
          >
            Go to Login
          </button>
        </div>
      </main>
    );
  }

  /* ---------------- Main UI ---------------- */
  return (
    <main className="min-h-screen flex items-center justify-center bg-neutral-950 px-4 py-10 relative overflow-hidden">
      {/* soft glows background */}
      <div className="pointer-events-none absolute -top-40 -left-24 h-72 w-72 rounded-full bg-violet-600/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-24 h-72 w-72 rounded-full bg-sky-500/25 blur-3xl" />

      <div className="w-full max-w-xl relative">
        <div className="mb-5 flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-xs font-medium text-neutral-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <span className="inline-flex items-center gap-1 rounded-full border border-neutral-700/80 bg-neutral-900/60 px-3 py-1 text-[10px] uppercase tracking-wide text-neutral-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Profile &amp; Earnings
          </span>
        </div>

        <div className="w-full bg-neutral-900/80 border border-neutral-800/80 px-7 py-8 rounded-2xl shadow-[0_18px_45px_rgba(0,0,0,0.65)] backdrop-blur-xl">
          <h1 className="text-white text-2xl font-semibold mb-1.5">
            Your Profile
          </h1>
          <p className="text-[12px] text-neutral-400 mb-6">
            Update your basic details and choose how you want to earn on
            <span className="font-semibold text-indigo-300"> Tego.live</span>.
          </p>

          {error && (
            <div className="mb-4 text-sm text-red-400 bg-red-950/40 border border-red-900/60 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          {/* Avatar + name in one row */}
          <section className="mb-6">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-400 mb-3">
              Basic Info
            </h2>

            <div className="flex items-center gap-4 mb-4">
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={avatarPreview || "/default-avatar.png"}
                  alt="avatar"
                  className="h-24 w-24 rounded-full object-cover border border-neutral-700 shadow-[0_0_0_1px_rgba(15,23,42,0.9)]"
                />

                <label className="absolute bottom-0 right-0 bg-indigo-500 text-white rounded-full p-2 cursor-pointer hover:bg-indigo-600 shadow-lg shadow-indigo-500/40">
                  <Upload size={16} />
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setAvatarFile(file);
                      if (file) {
                        setAvatarPreview(URL.createObjectURL(file));
                      }
                    }}
                  />
                </label>
              </div>

              <div className="flex-1">
                <p className="text-sm text-neutral-300">
                  This avatar will be visible on live streams &amp; stranger
                  calls.
                </p>
                <p className="text-[11px] text-neutral-500 mt-1">
                  Use a clear, friendly picture. No NSFW images allowed.
                </p>
              </div>
            </div>

            {/* Full Name */}
            <div className="mb-3">
              <label className="block text-xs text-neutral-300 mb-1.5">
                Full Name
              </label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-lg border border-neutral-700 bg-neutral-950/60 px-3 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500/70 focus:border-indigo-500 outline-none transition"
                placeholder="Your full name"
              />
            </div>

            {/* Email (readonly) */}
            <div className="mb-3">
              <label className="block text-xs text-neutral-300 mb-1.5">
                Email
              </label>
              <input
                value={email}
                readOnly
                className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-400"
              />
            </div>

            {/* Gender & Location in 2-column on md+ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
              {/* Gender */}
              <div>
                <label className="block text-xs text-neutral-300 mb-1.5">
                  Gender
                </label>
                <select
                  value={genderSelect}
                  onChange={(e) => setGenderSelect(e.target.value)}
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-950/60 px-3 py-2 text-sm text-white"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="custom">Custom</option>
                </select>

                {genderSelect === "custom" && (
                  <input
                    value={customGender}
                    onChange={(e) => setCustomGender(e.target.value)}
                    placeholder="Type your gender"
                    className="mt-2 w-full rounded-lg border border-neutral-700 bg-neutral-950/60 px-3 py-2 text-sm text-white"
                  />
                )}
              </div>

              {/* Location */}
              <div>
                <label className="block text-xs text-neutral-300 mb-1.5">
                  Location
                </label>

                {/* 👇 Input full width, button alag line pe (box ke bahar feel) */}
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-950/60 px-3 py-2 text-sm text-white"
                  placeholder="City, Country"
                />

                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  disabled={locating}
                  className="mt-2 inline-flex items-center justify-center rounded-full border border-indigo-500/70 bg-indigo-500/10 px-3.5 py-1.5 text-[11px] font-medium text-indigo-200 hover:bg-indigo-500/20 disabled:opacity-60"
                >
                  {locating ? "Detecting your location..." : "Use my location"}
                </button>

                {locationError && (
                  <p className="text-[11px] text-red-400 mt-1">
                    {locationError}
                  </p>
                )}

                <p className="text-[10px] text-neutral-500 mt-1">
                  We&apos;ll show only your city &amp; country on Tego Live.
                </p>
              </div>
            </div>
          </section>

          {/* ---------------- Earning Role Section (NEW) ---------------- */}
          <section className="mt-6 mb-7">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div>
                <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-400 mb-1">
                  Earning Setup
                </h2>
                <p className="text-[11px] text-neutral-400">
                  One account, two roles. Ek time pe sirf ek earning mode active
                  ho sakta hai.
                </p>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full border border-indigo-500/40 bg-indigo-500/10 px-2.5 py-1 text-[10px] font-medium text-indigo-200">
                Live &amp; Talk &amp; Earn
              </span>
            </div>

            <div className="mb-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-neutral-900/80 border border-neutral-700/80 px-2 py-1 text-[10px] text-neutral-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                {currentModeLabel}
              </span>
            </div>

            <div className="rounded-2xl border border-neutral-700/80 bg-linear-to-br from-neutral-900/90 via-neutral-950/80 to-neutral-950 px-4 py-4">
              {/* Toggle buttons */}
              <div className="mt-1 grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setEarningMode("creator")}
                  className={`flex flex-col items-start gap-1 rounded-xl border px-3 py-2 text-left transition ${
                    earningMode === "creator"
                      ? "border-amber-400 bg-amber-500/15 text-amber-50 shadow-[0_0_18px_rgba(251,191,36,0.4)]"
                      : "border-neutral-700 bg-neutral-900/90 text-neutral-200 hover:border-amber-300/60 hover:bg-amber-500/5"
                  }`}
                >
                  <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide">
                    <Sparkles className="h-3.5 w-3.5" />
                    Creator Mode
                  </span>
                  <span className="text-[10px] opacity-80">
                    Live stream &amp; earn via gifts.
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setEarningMode("stranger")}
                  className={`flex flex-col items-start gap-1 rounded-xl border px-3 py-2 text-left transition ${
                    earningMode === "stranger"
                      ? "border-sky-400 bg-sky-500/15 text-sky-50 shadow-[0_0_18px_rgba(56,189,248,0.4)]"
                      : "border-neutral-700 bg-neutral-900/90 text-neutral-200 hover:border-sky-300/60 hover:bg-sky-500/5"
                  }`}
                >
                  <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide">
                    <MessageCircle className="h-3.5 w-3.5" />
                    Stranger Mode
                  </span>
                  <span className="text-[10px] opacity-80">
                    Random calls &amp; per-minute earning.
                  </span>
                </button>
              </div>

              {/* Dynamic description */}
              {renderModeDetails()}

              {/* Small note about why both can't be active */}
              <p className="mt-3 text-[10px] text-neutral-500 leading-relaxed">
                Dono earnings ek sath run nahi kar sakte. Ye cheating, fake
                traffic aur bots ko rokne ke liye hai, taaki data clean rahe aur
                genuine users ke liye system safe ho.
              </p>
            </div>
          </section>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full rounded-lg bg-indigo-500 hover:bg-indigo-600 py-2.5 text-white font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed shadow-[0_10px_30px_rgba(79,70,229,0.45)]"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />} Save
            Profile
          </button>
        </div>
      </div>
    </main>
  );
}
