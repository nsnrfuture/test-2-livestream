export const ACCENT = {
  primary: "#6C5CE7",
  primaryDark: "#5b4ed2",
  secondary: "#00CEC9",
  glow: "rgba(108,92,231,0.35)",
  glowSecondary: "rgba(0,206,201,0.25)",
  textOnPrimary: "#ffffff",
  gradient: "linear-gradient(135deg, #6C5CE7 0%, #00CEC9 100%)",
} as const;

export type Status = "idle" | "pairing" | "waiting" | "paired" | "error";
