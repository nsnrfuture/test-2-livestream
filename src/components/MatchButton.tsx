"use client";
export default function MatchButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className="px-5 py-3 rounded-full bg-black text-white font-medium shadow hover:opacity-90 active:opacity-80"
    />
  );
}
