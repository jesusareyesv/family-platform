"use client";

import { useRouter } from "next/navigation";
import { clearToken } from "@/lib/token";

export default function SignOutButton() {
  const router = useRouter();

  function handleSignOut() {
    clearToken();
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleSignOut}
      className="mt-2 text-xs text-gray-400 hover:text-red-500 transition-colors"
    >
      Sign out
    </button>
  );
}
