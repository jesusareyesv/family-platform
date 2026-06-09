"use client";

import { Transaction } from "@/lib/types";

interface BalanceSummaryProps {
  transactions: Transaction[];
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

interface StatCardProps {
  label: string;
  amount: number;
  colorClass: string;
  icon: string;
}

function StatCard({ label, amount, colorClass, icon }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
      <div className={`text-3xl p-3 rounded-xl ${colorClass} bg-opacity-10`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className={`text-2xl font-bold mt-0.5 ${colorClass}`}>
          {formatCurrency(amount)}
        </p>
      </div>
    </div>
  );
}

export default function BalanceSummary({ transactions }: BalanceSummaryProps) {
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpenses;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <StatCard
        label="Total Income"
        amount={totalIncome}
        colorClass="text-emerald-600"
        icon="💰"
      />
      <StatCard
        label="Total Expenses"
        amount={totalExpenses}
        colorClass="text-rose-600"
        icon="💸"
      />
      <StatCard
        label="Balance"
        amount={balance}
        colorClass={balance >= 0 ? "text-indigo-600" : "text-amber-600"}
        icon={balance >= 0 ? "✅" : "⚠️"}
      />
    </div>
  );
}
