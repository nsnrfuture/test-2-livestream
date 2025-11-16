// export const AGORA_APP_ID = process.env.NEXT_PUBLIC_AGORA_APP_ID!;
export const AGORA_APP_ID = process.env.NEXT_PUBLIC_AGORA_APP_ID || "";
export const AGORA_TOKEN_TTL =
  Number(process.env.AGORA_TOKEN_TTL_SECONDS || 300);
if (!AGORA_APP_ID) {
  throw new Error("Missing NEXT_PUBLIC_AGORA_APP_ID");
}


export type LiveRole = "host" | "audience";

export function randomUid() {
  // Keep it simple & unique enough for a live session
  return Math.floor(Math.random() * 1_000_000);
}
