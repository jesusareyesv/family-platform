import { redirect } from "next/navigation";

// Middleware handles the auth check — unauthenticated users are redirected to /login
export default function HomePage() {
  redirect("/dashboard");
}
