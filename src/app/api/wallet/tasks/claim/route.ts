import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const userId = body?.userId as string | undefined;
  const taskId = body?.taskId as string | undefined;

  if (!userId || !taskId) {
    return NextResponse.json(
      { error: "userId and taskId are required" },
      { status: 400 }
    );
  }

  const { data: task, error: taskError } = await supabaseAdmin
    .from("wallet_tasks")
    .select("id, reward")
    .eq("id", taskId)
    .single();

  if (taskError || !task) {
    console.error(taskError);
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  // add log
  const { error: logError } = await supabaseAdmin
    .from("wallet_task_logs")
    .insert({
      user_id: userId,
      task_id: taskId,
    });

  if (logError) {
    if (logError.code === "23505") {
      return NextResponse.json(
        { error: "Task already claimed" },
        { status: 400 }
      );
    }
    console.error(logError);
    return NextResponse.json({ error: logError.message }, { status: 500 });
  }

  // credit coins
  const { error: txError } = await supabaseAdmin
    .from("wallet_transactions")
    .insert({
      user_id: userId,
      amount: task.reward,
      direction: "credit",
      tx_type: "task_reward",
      meta: { task_id: taskId },
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
