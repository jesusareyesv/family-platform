"use client";

import { useEffect, useState } from "react";
import { getTokenPayload } from "@/lib/token";

export default function UserInfo() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const payload = getTokenPayload();
    setEmail((payload?.email as string) ?? null);
  }, []);

  if (!email) return null;
  return <p className="text-xs text-gray-400 truncate">{email}</p>;
}
