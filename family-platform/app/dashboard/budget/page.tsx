"use client";

import { useEffect, useState, useCallback } from "react";
import { Transaction, TransactionInsert } from "@/lib/types";
import { getTransactions, createTransaction, deleteTransaction } from "@/lib/api-client";
import BalanceSummary from "@/components/budget/BalanceSummary";
import TransactionForm from "@/components/budget/TransactionForm";
import TransactionList from "@/components/budget/TransactionList";

function getCurrentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function formatMonthLabel(month: string) {
  const [year, m] = month.split("-");
  return new Date(Number(year), Number(m) - 1, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

function getPrevMonth(month: string) {
  const [year, m] = month.split("-").map(Number);
  const d = new Date(year, m - 2, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function getNextMonth(month: string) {
  const [year, m] = month.split("-").map(Number);
  const d = new Date(year, m, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default function BudgetPage() {
  const [month, setMonth] = useState(getCurrentMonth());
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTransactions(month);
      setTransactions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, [month]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  async function handleAdd(tx: TransactionInsert) {
    await createTransaction(tx);
    await fetchTransactions();
  }

  async function handleDelete(id: string) {
    await deleteTransaction(id);
    await fetchTransactions();
  }

  const isCurrentMonth = month === getCurrentMonth();

  return (
    <div className="px-8 py-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Budget & Finance</h1>
          <p className="text-gray-400 text-sm mt-0.5">Track your income and expenses together</p>
        </div>
        <TransactionForm onAdd={handleAdd} />
      </div>

      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => setMonth(getPrevMonth(month))}
          className="p-2 rounded-lg hover:bg-gray-200 text-gray-500 transition-colors"
          title="Previous month"
        >
          ◀
        </button>
        <span className="font-semibold text-gray-700 text-sm min-w-[140px] text-center">
          {formatMonthLabel(month)}
        </span>
        <button
          onClick={() => setMonth(getNextMonth(month))}
          disabled={isCurrentMonth}
          className="p-2 rounded-lg hover:bg-gray-200 text-gray-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          title="Next month"
        >
          ▶
        </button>
        {!isCurrentMonth && (
          <button
            onClick={() => setMonth(getCurrentMonth())}
            className="text-xs text-indigo-600 hover:underline ml-1"
          >
            Back to today
          </button>
        )}
      </div>

      {error && (
        <div className="mb-6 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          <BalanceSummary transactions={transactions} />
          <TransactionList transactions={transactions} onDelete={handleDelete} />
        </div>
      )}
    </div>
  );
}
