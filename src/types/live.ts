export type GiftType = "like" | "rose" | "star" | "diamond";

export type GiftEvent = {
  type: GiftType;
  amount: number;
  from?: string | null;
  channel: string;
  at: string; // ISO
};
