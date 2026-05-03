"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { logDebugClient } from "@/app/components/debug-beacon";
import AdminSignUpForm from "@/app/components/admin-sign-up-form";
import styles from "@/app/page.module.css";

type AuthTab = "signin" | "signup";

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<AuthTab>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const q = params.get("error");
    if (q) {
      setError(decodeURIComponent(q));
      window.history.replaceState({}, "", "/login");
    }
  }, []);

  useEffect(() => {
    setError("");
    if (tab === "signin") setSignupSuccess(null);
  }, [tab]);

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
        location: "app/login/page.tsx",
        hypothesisId: "H3",
        message: "login_response",
        data: {
          httpStatus: response.status,
          success: (payload as { success?: boolean }).success,
          error: (payload as { error?: string }).error,
          parseError: Boolean((payload as { parseError?: boolean }).parseError),
        },
      });
      if (!(payload as { success?: boolean }).success) {
        setError((payload as { error?: string }).error || "تعذر تسجيل الدخول");
        return;
      }
      router.push("/admin");
    } catch {
      logDebugClient({
        location: "app/login/page.tsx",
        hypothesisId: "H4",
        message: "login_network_error",
        data: {},
      });
      setError("تعذر تسجيل الدخول");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginPageShell}>
      <main className={styles.loginPage}>
        <section className={styles.loginCard}>
          <div className={styles.loginBrandStripe} aria-hidden />
          <div className={styles.loginTabList} role="tablist" aria-label="خيارات الدخول والتسجيل">
            <button
              type="button"
              role="tab"
              id="tab-signin"
              aria-selected={tab === "signin"}
              aria-controls="panel-signin"
              className={tab === "signin" ? styles.loginTabActive : styles.loginTab}
              onClick={() => setTab("signin")}
            >
              تسجيل الدخول
            </button>
            <button
              type="button"
              role="tab"
              id="tab-signup"
              aria-selected={tab === "signup"}
              aria-controls="panel-signup"
              className={tab === "signup" ? styles.loginTabActive : styles.loginTab}
              onClick={() => setTab("signup")}
            >
              إنشاء حساب
            </button>
          </div>

          {tab === "signin" ? (
            <div
              id="panel-signin"
              role="tabpanel"
              aria-labelledby="tab-signin"
              className={styles.loginTabPanel}
            >
              <h1 className={styles.loginTitle}>تسجيل الدخول إلى حسابك</h1>
              <p className={styles.loginSubtitle}>
                سجّل الدخول للوصول إلى خدماتك والمحتوى المخصص لك على الموقع.
              </p>

              <a className={styles.loginGoogleButton} href="/api/auth/google">
                <span className={styles.loginGoogleIcon} aria-hidden>
                  G
                </span>
                المتابعة مع Google
              </a>

              <div className={styles.loginDivider}>
                <span>أو</span>
              </div>

              <form onSubmit={submit} className={styles.loginForm}>
                <label className={styles.loginLabel} htmlFor="signin-email">
                  البريد الإلكتروني
                </label>
                <input
                  id="signin-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  autoComplete="email"
                  className={styles.loginInput}
                />
                <label className={styles.loginLabel} htmlFor="signin-password">
                  كلمة المرور
                </label>
                <div className={styles.loginPasswordRow}>
                  <input
                    id="signin-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    className={styles.loginInput}
                  />
                  <button
                    type="button"
                    className={styles.loginShowPassword}
                    aria-pressed={showPassword}
                    aria-controls="signin-password"
                    onClick={() => setShowPassword((v) => !v)}
                  >
                    {showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                  </button>
                </div>
                <button type="submit" disabled={loading} className={styles.loginButton}>
                  {loading ? "يرجى الانتظار…" : "تسجيل الدخول"}
                </button>
              </form>
              {error ? <p className={styles.loginError}>{error}</p> : null}
            </div>
          ) : (
            <div
              id="panel-signup"
              role="tabpanel"
              aria-labelledby="tab-signup"
              className={styles.loginTabPanel}
            >
              <h1 className={styles.loginTitle}>إنشاء حساب</h1>
              <p className={styles.loginSubtitle}>
                أنشئ حسابًا جديدًا للمشاركة في خدمات الموقع. بعد التسجيل يمكنك تسجيل الدخول
                عندما يكون حسابك جاهزًا.
              </p>
              {signupSuccess ? (
                <p className={styles.loginSuccess} role="status">
                  تم إنشاء الحساب بنجاح. يمكنك التبديل إلى «تسجيل الدخول» لاحقًا باستخدام
                  البريد <strong>{signupSuccess}</strong> عند تفعيل حسابك.
                </p>
              ) : (
                <AdminSignUpForm
                  onRegistered={(registeredEmail) => {
                    setSignupSuccess(registeredEmail);
                  }}
                />
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
