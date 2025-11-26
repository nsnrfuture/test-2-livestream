import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const userId = body?.userId as string | undefined;
  const amountInRupees = Number(body?.amountInRupees ?? 0);

  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }
  if (!amountInRupees || amountInRupees <= 0) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }

  const { error: txError } = await supabaseAdmin
    .from("wallet_transactions")
    .insert({
      user_id: userId,
      amount: amountInRupees,
      direction: "credit",
      tx_type: "buy_coins",
      meta: { source: "wallet_buy_api" },
    });

  if (txError) {
    console.error(txError);
    return NextResponse.json({ error: txError.message }, { status: 500 });
  }

  const url = new URL(req.url);
  url.pathname = "/api/wallet";
  url.searchParams.set("userId", userId);

  const forwarded = await fetch(url.toString(), { method: "GET" });
  const json = await forwarded.json();

  return NextResponse.json(json);
}
