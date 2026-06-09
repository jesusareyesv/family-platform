"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import { TransactionInsert, TransactionType, INCOME_CATEGORIES, EXPENSE_CATEGORIES } from "@/lib/types";

interface TransactionFormProps {
  onAdd: (tx: TransactionInsert) => Promise<void>;
}

export default function TransactionForm({ onAdd }: TransactionFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<TransactionType>("expense");
  const [form, setForm] = useState<TransactionInsert>({
    type: "expense",
    amount: 0,
    category: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
  });

  const categories = type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  function handleTypeChange(t: TransactionType) {
    setType(t);
    setForm((prev) => ({ ...prev, type: t, category: "" }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.category || !form.amount || !form.date) return;
    setLoading(true);
    try {
      await onAdd({ ...form, type });
      setForm({
        type,
        amount: 0,
        category: "",
        description: "",
        date: new Date().toISOString().split("T")[0],
      });
      setOpen(false);
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} size="md">
        + Add Transaction
      </Button>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold text-gray-800">New Transaction</h2>
        <button
          onClick={() => setOpen(false)}
          className="text-gray-400 hover:text-gray-600 text-xl leading-none"
        >
          ×
        </button>
      </div>

      {/* Type toggle */}
      <div className="flex rounded-xl overflow-hidden border border-gray-200 mb-5 w-fit">
        {(["expense", "income"] as TransactionType[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => handleTypeChange(t)}
            className={`px-5 py-2 text-sm font-medium transition-colors capitalize ${
              type === t
                ? t === "income"
                  ? "bg-emerald-600 text-white"
                  : "bg-rose-600 text-white"
                : "bg-white text-gray-500 hover:bg-gray-50"
            }`}
          >
            {t === "income" ? "💰 Income" : "💸 Expense"}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount (USD)
            </label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              required
              value={form.amount || ""}
              onChange={(e) => setForm((prev) => ({ ...prev, amount: parseFloat(e.target.value) }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              required
              value={form.date}
              onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select
            required
            value={form.category}
            onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
          >
            <option value="">Select a category...</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description <span className="text-gray-400">(optional)</span>
          </label>
          <input
            type="text"
            value={form.description ?? ""}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
            placeholder="e.g. Monthly grocery run"
          />
        </div>

        <div className="flex gap-3 pt-1">
          <Button type="submit" loading={loading} size="md">
            Save Transaction
          </Button>
          <Button type="button" variant="secondary" onClick={() => setOpen(false)} size="md">
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
