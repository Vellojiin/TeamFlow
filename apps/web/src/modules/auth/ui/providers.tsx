"use client";

import { AuthProvider } from "../infrastructure/auth-context";

export default function Providers({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
