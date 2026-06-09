"use client";

import { useState } from "react";
import { Transaction } from "@/lib/types";
import Button from "@/components/ui/Button";

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: string) => Promise<void>;
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

function formatDate(dateStr: string) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const CATEGORY_ICONS: Record<string, string> = {
  Salary: "💼", Freelance: "🖥️", Investment: "📈", Gift: "🎁", "Other Income": "💵",
  Housing: "🏠", Groceries: "🛒", Transport: "🚗", Utilities: "💡", Health: "🏥",
  Entertainment: "🎬", "Dining Out": "🍽️", Cats: "🐱", Clothing: "👕",
  Savings: "🏦", Other: "📦",
};

export default function TransactionList({ transactions, onDelete }: TransactionListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await onDelete(id);
    } finally {
      setDeletingId(null);
    }
  }

  if (transactions.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-10 text-center shadow-sm border border-gray-100">
        <p className="text-4xl mb-3">📭</p>
        <p className="text-gray-500 font-medium">No transactions yet this month.</p>
        <p className="text-gray-400 text-sm mt-1">Add your first one above!</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h2 className="font-semibold text-gray-700">Transactions</h2>
      </div>
      <ul className="divide-y divide-gray-50">
        {transactions.map((tx) => (
          <li key={tx.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
            <div className="text-2xl w-10 text-center">
              {CATEGORY_ICONS[tx.category] ?? "💳"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">
                {tx.category}
              </p>
              {tx.description && (
                <p className="text-xs text-gray-400 truncate">{tx.description}</p>
              )}
              <p className="text-xs text-gray-400 mt-0.5">{formatDate(tx.date)}</p>
            </div>
            <div className="text-right shrink-0">
              <p
                className={`text-sm font-semibold ${
                  tx.type === "income" ? "text-emerald-600" : "text-rose-600"
                }`}
              >
                {tx.type === "income" ? "+" : "-"}
                {formatCurrency(tx.amount)}
              </p>
              <span className={`inline-block mt-0.5 text-xs px-2 py-0.5 rounded-full font-medium ${
                tx.type === "income"
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-rose-50 text-rose-700"
              }`}>
                {tx.type}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              loading={deletingId === tx.id}
              onClick={() => handleDelete(tx.id)}
              className="text-gray-300 hover:text-red-500 ml-1"
              title="Delete transaction"
            >
              🗑️
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
