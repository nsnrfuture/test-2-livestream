// app/api/wallet/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function todayStr() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    /* --------------------------------------------------
     * 1) Transactions (wallet_transactions)
     * -------------------------------------------------- */
    let txs: any[] = [];

    const { data: txData, error: txError } = await supabaseAdmin
      .from("wallet_transactions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (txError) {
      console.error("wallet_transactions error:", txError);

      // 42P01 = table does not exist
      const code = (txError as any).code;
      if (code !== "42P01") {
        return NextResponse.json(
          { error: txError.message ?? "Failed to load transactions" },
          { status: 500 }
        );
      } else {
        // table missing → treat as no transactions
        txs = [];
      }
    } else {
      txs = txData || [];
    }

    const today = todayStr();
    let coinBalance = 0;
    let totalEarning = 0;
    let taskEarning = 0;
    let todayEarning = 0;
    let locked = 0;

    for (const t of txs) {
      const amount = t.amount || 0;
      const isCredit = t.direction === "credit";

      coinBalance += isCredit ? amount : -amount;

      if (isCredit && t.tx_type !== "buy_coins") {
        totalEarning += amount;
      }

      if (isCredit && t.tx_type === "task_reward") {
        taskEarning += amount;
      }

      const created = t.created_at ? new Date(t.created_at) : null;
      if (created) {
        const d = created.toISOString().slice(0, 10);
        if (d === today && isCredit && t.tx_type !== "buy_coins") {
          todayEarning += amount;
        }
      }
    }

    const withdrawable = coinBalance - locked;
    const loginStreak = 3; // TODO: real logic later

    const wallet = {
      coinBalance,
      totalEarning,
      withdrawable,
      locked,
      taskEarning,
      todayEarning,
      loginStreak,
    };

    /* --------------------------------------------------
     * 2) Tasks + claimed status
     * -------------------------------------------------- */
    let taskRows: any[] = [];
    let logs: any[] = [];

    const { data: tData, error: tasksError } = await supabaseAdmin
      .from("wallet_tasks")
      .select("*");

    if (tasksError) {
      console.error("wallet_tasks error:", tasksError);
      const code = (tasksError as any).code;
      if (code !== "42P01") {
        return NextResponse.json(
          { error: tasksError.message ?? "Failed to load tasks" },
          { status: 500 }
        );
      } else {
        taskRows = [];
      }
    } else {
      taskRows = tData || [];
    }

    const { data: logsData, error: logsError } = await supabaseAdmin
      .from("wallet_task_logs")
      .select("task_id")
      .eq("user_id", userId);

    if (logsError) {
      console.error("wallet_task_logs error:", logsError);
      const code = (logsError as any).code;
      if (code !== "42P01") {
        return NextResponse.json(
          { error: logsError.message ?? "Failed to load task logs" },
          { status: 500 }
        );
      } else {
        logs = [];
      }
    } else {
      logs = logsData || [];
    }

    const claimedIds = new Set((logs || []).map((l: any) => l.task_id));

    const tasks = (taskRows || []).map((t: any) => ({
      id: t.id as string,
      title: t.title as string,
      description: (t.description as string) ?? "",
      reward: (t.reward as number) ?? 0,
      status: claimedIds.has(t.id)
        ? ("claimed" as const)
        : ("pending" as const),
    }));

    return NextResponse.json({ wallet, tasks });
  } catch (err: any) {
    console.error("Unexpected /api/wallet error:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
