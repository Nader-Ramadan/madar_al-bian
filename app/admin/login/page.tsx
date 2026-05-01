"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { logDebugClient } from "@/app/components/debug-beacon";
import styles from "@/app/page.module.css";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const payload = await response.json().catch(() => ({ parseError: true }));
      logDebugClient({
        location: "app/admin/login/page.tsx",
        hypothesisId: "H3",
        message: "admin_login_response",
        data: {
          httpStatus: response.status,
          success: (payload as { success?: boolean }).success,
          error: (payload as { error?: string }).error,
          parseError: Boolean((payload as { parseError?: boolean }).parseError),
        },
      });
      if (!(payload as { success?: boolean }).success) {
        setError((payload as { error?: string }).error || "Login failed");
        return;
      }
      router.push("/admin");
    } catch {
      logDebugClient({
        location: "app/admin/login/page.tsx",
        hypothesisId: "H4",
        message: "admin_login_network_error",
        data: {},
      });
      setError("Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <main className={styles.loginPage}>
        <section className={styles.loginCard}>
          <h1 className={styles.loginTitle}>Admin Login</h1>
          <p className={styles.loginSubtitle}>
            Sign in to manage publications, approvals, and site operations.
          </p>
          <form onSubmit={submit} className={styles.loginForm}>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="Email"
              className={styles.loginInput}
            />
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="Password"
              className={styles.loginInput}
            />
            <button type="submit" disabled={loading} className={styles.loginButton}>
              {loading ? "Please wait..." : "Login"}
            </button>
          </form>
          {error ? <p className={styles.adminError}>{error}</p> : null}
        </section>
      </main>
    </div>
  );
}
