"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiLogin, apiRegister } from "@/lib/api-client";
import { setToken } from "@/lib/token";
import Button from "@/components/ui/Button";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"sign_in" | "sign_up">("sign_in");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (mode === "sign_in") {
        const token = await apiLogin(email, password);
        setToken(token);
        router.push("/dashboard");
        router.refresh();
      } else {
        const result = await apiRegister(email, password);
        if (result.access_token) {
          setToken(result.access_token);
          router.push("/dashboard");
        } else {
          setMessage({
            type: "success",
            text: result.message ?? "Account created! Check your email to confirm, then sign in.",
          });
        }
      }
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Something went wrong." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-violet-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🏡</div>
          <h1 className="text-3xl font-bold text-gray-800">Family Platform</h1>
          <p className="text-gray-500 mt-1 text-sm">Your household, all in one place</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-6">
            {mode === "sign_in" ? "Welcome back 👋" : "Create your account"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                placeholder="••••••••"
              />
            </div>

            {message && (
              <div
                className={`rounded-lg px-4 py-3 text-sm ${
                  message.type === "error"
                    ? "bg-red-50 text-red-700 border border-red-200"
                    : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                }`}
              >
                {message.text}
              </div>
            )}

            <Button type="submit" loading={loading} size="lg" className="w-full mt-2">
              {mode === "sign_in" ? "Sign In" : "Create Account"}
            </Button>
          </form>

          <div className="mt-5 text-center text-sm text-gray-500">
            {mode === "sign_in" ? (
              <>
                New here?{" "}
                <button
                  onClick={() => { setMode("sign_up"); setMessage(null); }}
                  className="font-medium text-indigo-600 hover:text-indigo-700"
                >
                  Create an account
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  onClick={() => { setMode("sign_in"); setMessage(null); }}
                  className="font-medium text-indigo-600 hover:text-indigo-700"
                >
                  Sign in
                </button>
              </>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">Just for us 🐱🐱🐱🐱</p>
      </div>
    </div>
  );
}
