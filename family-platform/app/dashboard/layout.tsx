import Link from "next/link";
import UserInfo from "@/components/dashboard/UserInfo";
import SignOutButton from "@/components/ui/SignOutButton";

// Auth is enforced by middleware.ts — this layout only renders for authenticated users.

const NAV_ITEMS = [
  { href: "/dashboard", label: "Home", icon: "🏠" },
  { href: "/dashboard/budget", label: "Budget", icon: "💰" },
  // { href: "/dashboard/chores", label: "Chores", icon: "🧹" },
  // { href: "/dashboard/us", label: "Us", icon: "💑" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-56 bg-white border-r border-gray-100 flex flex-col shadow-sm shrink-0">
        <div className="px-5 py-6 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏡</span>
            <span className="font-bold text-gray-800 text-base">Family Platform</span>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-gray-100">
          <UserInfo />
          <SignOutButton />
        </div>
      </aside>

      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
