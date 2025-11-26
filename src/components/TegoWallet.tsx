"use client";

import { useEffect, useState } from "react";
import {
  Wallet,
  ArrowUpFromLine,
  ArrowDownToLine,
  Loader2,
  Coins,
  Sparkles,
  CheckCircle2,
  CalendarDays,
  Plus,
} from "lucide-react";

const ACCENT = "#8B3DFF";

type WalletSummary = {
  coinBalance: number;
  totalEarning: number;
  withdrawable: number;
  locked: number;
  taskEarning: number;
  todayEarning: number;
  loginStreak: number;
};

type TaskItem = {
  id: string;
  title: string;
  description: string;
  reward: number;
  status: "pending" | "completed" | "claimed";
};

type Props = {
  userId: string;
};

export default function TegoWallet({ userId }: Props) {
  const [wallet, setWallet] = useState<WalletSummary | null>(null);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [buyAmount, setBuyAmount] = useState<number>(99);
  const [withdrawAmount, setWithdrawAmount] = useState<number>(200);

  async function fetchWallet() {
    const res = await fetch(`/api/wallet?userId=${userId}`);
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(body.error || "Failed to load wallet");
    }
    setWallet(body.wallet);
    setTasks(body.tasks || []);
  }

  // Load wallet & tasks
  useEffect(() => {
    if (!userId) return;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        await fetchWallet();
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to load wallet. Please try again.");
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  // Buy coins
  async function handleBuyCoins() {
    if (!wallet) return;
    if (buyAmount <= 0) return;

    try {
      setActionLoading("buy");
      setError(null);

      const res = await fetch("/api/wallet/buy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, amountInRupees: buyAmount }),
      });

      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body.error || "Failed to buy coins");
      }

      setWallet(body.wallet);
      setTasks(body.tasks || tasks);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to buy coins. Please try again.");
    } finally {
      setActionLoading(null);
    }
  }

  // Withdraw
  async function handleWithdraw() {
    if (!wallet) return;

    if (withdrawAmount <= 0) {
      setError("Enter valid withdraw amount.");
      return;
    }

    if (withdrawAmount > wallet.withdrawable) {
      setError("You cannot withdraw more than withdrawable balance.");
      return;
    }

    const MIN_WITHDRAW = 200;
    if (withdrawAmount < MIN_WITHDRAW) {
      setError(`Minimum withdraw is ${MIN_WITHDRAW} ₹.`);
      return;
    }

    try {
      setActionLoading("withdraw");
      setError(null);

      const res = await fetch("/api/wallet/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          amount: withdrawAmount,
          method: "UPI",
          accountDetails: null,
        }),
      });

      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body.error || "Failed to create withdraw request");
      }

      setWallet(body.wallet);
      setTasks(body.tasks || tasks);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to create withdraw request.");
    } finally {
      setActionLoading(null);
    }
  }

  // Claim Task
  async function handleClaimTask(task: TaskItem) {
    if (!wallet) return;
    if (task.status === "claimed") return;

    try {
      setActionLoading(`task-${task.id}`);
      setError(null);

      const res = await fetch("/api/wallet/tasks/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, taskId: task.id }),
      });

      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body.error || "Failed to claim task reward");
      }

      setWallet(body.wallet);
      setTasks(body.tasks || tasks);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to claim task reward.");
    } finally {
      setActionLoading(null);
    }
  }

  if (loading || !wallet) {
    return (
      <div className="flex h-80 items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-zinc-300">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading wallet…
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6 text-white">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[rgba(139,61,255,0.15)] ring-1 ring-[rgba(139,61,255,0.5)]">
            <Wallet className="h-5 w-5" style={{ color: ACCENT }} />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Tego Wallet</h1>
            <p className="text-xs text-zinc-400">
              1 ₹ = 1 Tego Coin · Instant balance update
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-1 rounded-full bg-zinc-900/60 px-3 py-1 text-xs text-zinc-300 ring-1 ring-zinc-800">
          <CalendarDays className="h-3 w-3" />
          <span>Login streak: </span>
          <span className="font-semibold text-emerald-400">
            {wallet.loginStreak} days
          </span>
        </div>
      </div>

      {/* Main stats cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Balance */}
        <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-[#050816] via-[#020617] to-black p-4 ring-1 ring-white/10">
          <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-[rgba(139,61,255,0.35)] blur-2xl" />
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400">Current Balance</span>
            <Sparkles className="h-4 w-4 text-yellow-300" />
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <Coins className="h-4 w-4 text-yellow-300" />
            <span className="text-2xl font-semibold">
              {wallet.coinBalance.toLocaleString("en-IN")}
            </span>
            <span className="text-xs text-zinc-400">coins</span>
          </div>
          <p className="mt-1 text-[11px] text-zinc-500">
            ≈ ₹{wallet.coinBalance.toLocaleString("en-IN")}
          </p>
        </div>

        {/* Earning */}
        <div className="rounded-2xl bg-zinc-950/80 p-4 ring-1 ring-zinc-800">
          <span className="text-xs text-zinc-400">Total Earning</span>
          <div className="mt-2 text-xl font-semibold">
            ₹{wallet.totalEarning.toLocaleString("en-IN")}
          </div>
          <p className="mt-1 text-[11px] text-zinc-500">
            Today:{" "}
            <span className="font-medium text-emerald-400">
              +{wallet.todayEarning} coins
            </span>{" "}
            · Task Earning:{" "}
            <span className="font-medium text-sky-400">
              {wallet.taskEarning} coins
            </span>
          </p>
        </div>

        {/* Withdrawable */}
        <div className="rounded-2xl bg-zinc-950/80 p-4 ring-1 ring-zinc-800">
          <span className="text-xs text-zinc-400">Withdrawable Balance</span>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-xl font-semibold">
              ₹{wallet.withdrawable.toLocaleString("en-IN")}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-zinc-500">
            Locked / bonus coins:{" "}
            <span className="font-medium text-amber-300">
              {wallet.locked} coins
            </span>
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-300">
          {error}
        </div>
      )}

      {/* Buy + Withdraw */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Buy Coins */}
        <div className="rounded-2xl bg-zinc-950/80 p-4 ring-1 ring-zinc-800">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-900">
                <ArrowUpFromLine className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium">Buy Tego Coins</p>
                <p className="text-[11px] text-zinc-500">
                  Recharge wallet · 1 ₹ = 1 coin
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 rounded-full bg-zinc-900 px-2 py-1 text-[10px] text-zinc-300">
              <Plus className="h-3 w-3" />
              Popular: 99 / 199 / 499
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <label className="mb-1 block text-[11px] text-zinc-400">
                  Amount in ₹
                </label>
                <input
                  type="number"
                  min={1}
                  value={buyAmount}
                  onChange={(e) =>
                    setBuyAmount(parseInt(e.target.value || "0"))
                  }
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950/90 px-3 py-2 text-sm outline-none ring-offset-0 focus:border-[rgba(139,61,255,0.8)]"
                />
              </div>
              <div className="flex-1">
                <label className="mb-1 block text-[11px] text-zinc-400">
                  You will get
                </label>
                <div className="flex items-center gap-1 rounded-xl border border-zinc-800 bg-zinc-950/90 px-3 py-2 text-sm">
                  <Coins className="h-4 w-4 text-yellow-300" />
                  <span className="font-medium">
                    {Number.isNaN(buyAmount) ? 0 : buyAmount} coins
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 text-[11px]">
              {[99, 199, 499, 999].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setBuyAmount(preset)}
                  className={`rounded-full px-3 py-1 ${
                    buyAmount === preset
                      ? "bg-[rgba(139,61,255,0.18)] text-[rgba(139,61,255,1)] ring-1 ring-[rgba(139,61,255,0.7)]"
                      : "bg-zinc-900 text-zinc-300 ring-1 ring-zinc-800"
                  }`}
                >
                  ₹{preset}
                </button>
              ))}
            </div>

            <button
              type="button"
              disabled={!!actionLoading}
              onClick={handleBuyCoins}
              className="mt-1 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[rgba(139,61,255,1)] px-4 py-2 text-sm font-medium text-white shadow-[0_0_25px_rgba(139,61,255,0.45)] transition hover:bg-[rgba(139,61,255,0.9)] disabled:opacity-60"
            >
              {actionLoading === "buy" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing…
                </>
              ) : (
                <>
                  <ArrowUpFromLine className="h-4 w-4" />
                  Recharge & Get Coins
                </>
              )}
            </button>
          </div>
        </div>

        {/* Withdraw */}
        <div className="rounded-2xl bg-zinc-950/80 p-4 ring-1 ring-zinc-800">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-900">
              <ArrowDownToLine className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-medium">Withdraw to Bank / UPI</p>
              <p className="text-[11px] text-zinc-500">
                Convert withdrawable coins to real cash.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-[11px] text-zinc-400">
                Amount to Withdraw (₹)
              </label>
              <input
                type="number"
                min={1}
                value={withdrawAmount}
                onChange={(e) =>
                  setWithdrawAmount(parseInt(e.target.value || "0"))
                }
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950/90 px-3 py-2 text-sm outline-none ring-offset-0 focus:border-[rgba(139,61,255,0.8)]"
              />
              <p className="mt-1 text-[10px] text-zinc-500">
                Available withdrawable:{" "}
                <span className="font-medium text-emerald-400">
                  ₹{wallet.withdrawable.toLocaleString("en-IN")}
                </span>
              </p>
            </div>

            <button
              type="button"
              disabled={!!actionLoading}
              onClick={handleWithdraw}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-100 ring-1 ring-zinc-700 transition hover:bg-zinc-800 disabled:opacity-60"
            >
              {actionLoading === "withdraw" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating withdraw request…
                </>
              ) : (
                <>
                  <ArrowDownToLine className="h-4 w-4" />
                  Withdraw Now
                </>
              )}
            </button>

            <p className="text-[10px] text-zinc-500">
              Minimum withdraw:{" "}
              <span className="font-medium text-zinc-300">₹200</span> ·
              Payment mode: UPI / Bank transfer (set in profile).
            </p>
          </div>
        </div>
      </div>

      {/* Task earning */}
      <div className="rounded-2xl bg-zinc-950/80 p-4 ring-1 ring-zinc-800">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-900">
              <Sparkles className="h-4 w-4 text-yellow-300" />
            </div>
            <div>
              <p className="text-sm font-medium">Task Earning</p>
              <p className="text-[11px] text-zinc-500">
                Complete tasks to earn extra Tego Coins.
              </p>
            </div>
          </div>
          <div className="text-[11px] text-zinc-400">
            Total from tasks:{" "}
            <span className="font-semibold text-sky-400">
              {wallet.taskEarning} coins
            </span>
          </div>
        </div>

        <div className="space-y-2">
          {tasks.map((task) => {
            const isClaimable = task.status === "pending";
            const isClaimed = task.status === "claimed";

            return (
              <div
                key={task.id}
                className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/60 px-3 py-2.5 text-xs"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-[13px] font-medium text-zinc-100">
                      {task.title}
                    </p>
                    {isClaimed && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-300">
                        <CheckCircle2 className="h-3 w-3" />
                        Claimed
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-[11px] text-zinc-400">
                    {task.description}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <div className="inline-flex items-center gap-1 rounded-full bg-zinc-950 px-2 py-[3px] text-[10px] text-yellow-300">
                    <Coins className="h-3 w-3" />
                    +{task.reward}
                  </div>

                  <button
                    type="button"
                    disabled={!!actionLoading || !isClaimable}
                    onClick={() => handleClaimTask(task)}
                    className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] ${
                      isClaimable
                        ? "bg-[rgba(139,61,255,1)] text-white hover:bg-[rgba(139,61,255,0.9)]"
                        : "bg-zinc-800 text-zinc-400"
                    } disabled:opacity-50`}
                  >
                    {actionLoading === `task-${task.id}` ? (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Claiming…
                      </>
                    ) : isClaimable ? (
                      <>
                        <Sparkles className="h-3 w-3" />
                        Claim
                      </>
                    ) : (
                      "Completed"
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <p className="mt-2 text-[10px] text-zinc-500">
          Example: Complete 7 days login streak & get{" "}
          <span className="font-medium text-emerald-300">
            50 ₹ (= 50 coins)
          </span>{" "}
          bonus on 7th day. You can extend this logic in backend.
        </p>
      </div>
    </div>
  );
}
