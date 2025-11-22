// app/profile/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Loader2, Upload, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

type ProfileRow = {
  id: string;
  full_name: string | null;
  email: string | null;
  gender: string | null;
  location: string | null;
  avatar_url: string | null;
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
    <main className="min-h-screen flex items-center justify-center bg-neutral-950 px-4 py-10">
      <div className="w-full max-w-lg bg-neutral-900/70 border border-neutral-800 px-8 py-10 rounded-2xl shadow-xl">
        {/* Back button */}
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-4 inline-flex items-center gap-2 text-xs font-medium text-neutral-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <h1 className="text-white text-2xl font-semibold mb-6">
          Your Profile
        </h1>

        {error && (
          <div className="mb-4 text-sm text-red-400 bg-red-950/40 border border-red-900/60 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        {/* Avatar */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative">
            {/* always plain <img>, no Next/Image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={avatarPreview || "/default-avatar.png"}
              alt="avatar"
              className="h-[120px] w-[120px] rounded-full object-cover border border-neutral-700"
            />

            <label className="absolute bottom-0 right-0 bg-indigo-500 text-white rounded-full p-2 cursor-pointer hover:bg-indigo-600">
              <Upload size={18} />
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setAvatarFile(file);
                  if (file) {
                    // local preview immediately
                    setAvatarPreview(URL.createObjectURL(file));
                  }
                }}
              />
            </label>
          </div>

          <p className="text-xs text-neutral-500 mt-2">
            Upload a new profile picture
          </p>
        </div>

        {/* Full Name */}
        <div className="mb-4">
          <label className="block text-sm text-neutral-300 mb-1">
            Full Name
          </label>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none"
            placeholder="Your full name"
          />
        </div>

        {/* Email (readonly) */}
        <div className="mb-4">
          <label className="block text-sm text-neutral-300 mb-1">Email</label>
          <input
            value={email}
            readOnly
            className="w-full rounded-lg border border-neutral-800 bg-neutral-800 px-3 py-2 text-sm text-neutral-400"
          />
        </div>

        {/* Gender */}
        <div className="mb-4">
          <label className="block text-sm text-neutral-300 mb-1">Gender</label>
          <select
            value={genderSelect}
            onChange={(e) => setGenderSelect(e.target.value)}
            className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white"
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
              className="mt-2 w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white"
            />
          )}
        </div>

        {/* Location */}
        <div className="mb-6">
          <label className="block text-sm text-neutral-300 mb-1">
            Location
          </label>

          <div className="flex gap-2">
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="flex-1 rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white"
              placeholder="City, Country"
            />
            <button
              type="button"
              onClick={handleUseCurrentLocation}
              disabled={locating}
              className="whitespace-nowrap rounded-lg border border-indigo-500/70 bg-indigo-500/10 px-3 py-2 text-xs font-medium text-indigo-300 hover:bg-indigo-500/20 disabled:opacity-60"
            >
              {locating ? "Detecting..." : "Use my location"}
            </button>
          </div>

          {locationError && (
            <p className="text-xs text-red-400 mt-1">{locationError}</p>
          )}

          <p className="text-[11px] text-neutral-500 mt-1">
            We&apos;ll use this just to show your city/country on Tego Live.
          </p>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full rounded-lg bg-indigo-500 hover:bg-indigo-600 py-2.5 text-white font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />} Save Profile
        </button>
      </div>
    </main>
  );
}
