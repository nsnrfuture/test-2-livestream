import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const userId = body?.userId as string | undefined;
  const amount = Number(body?.amount ?? 0);
  const method = (body?.method as string | undefined) ?? "UPI";
  const accountDetails = body?.accountDetails ?? null;

  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }
  if (!amount || amount <= 0) {
    return NextResponse.json({ error: "Invalid withdraw amount" }, { status: 400 });
  }

  // check balance
  const { data: txs, error: txError } = await supabaseAdmin
    .from("wallet_transactions")
    .select("amount,direction")
    .eq("user_id", userId);

  if (txError) {
    console.error(txError);
    return NextResponse.json({ error: txError.message }, { status: 500 });
  }

  let balance = 0;
  for (const t of txs || []) {
    balance += t.direction === "credit" ? t.amount : -t.amount;
  }

  if (amount > balance) {
    return NextResponse.json(
      { error: "Insufficient balance" },
      { status: 400 }
    );
  }

  // 1) create withdraw request
  const { data: wr, error: wError } = await supabaseAdmin
    .from("withdraw_requests")
    .insert({
      user_id: userId,
      amount,
      status: "pending",
      method,
      account_details: accountDetails,
    })
    .select("id")
    .single();

  if (wError) {
    console.error(wError);
    return NextResponse.json({ error: wError.message }, { status: 500 });
  }

  // 2) debit coins (hold)
  const { error: txError2 } = await supabaseAdmin
    .from("wallet_transactions")
    .insert({
      user_id: userId,
      amount,
      direction: "debit",
      tx_type: "withdraw_request",
      meta: { withdraw_request_id: wr.id },
    });

  if (txError2) {
    console.error(txError2);
    return NextResponse.json({ error: txError2.message }, { status: 500 });
  }

  const url = new URL(req.url);
  url.pathname = "/api/wallet";
  url.searchParams.set("userId", userId);

  const forwarded = await fetch(url.toString(), { method: "GET" });
  const json = await forwarded.json();

  return NextResponse.json(json);
}
