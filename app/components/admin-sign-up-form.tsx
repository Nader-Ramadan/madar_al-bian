"use client";

import { FormEvent, useState } from "react";
import styles from "@/app/page.module.css";

type AdminSignUpFormProps = {
  onRegistered?: (email: string) => void;
};

export default function AdminSignUpForm({ onRegistered }: AdminSignUpFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("كلمتا المرور غير متطابقتين");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });
      const payload = await response.json().catch(() => ({ parseError: true }));
      if (!(payload as { success?: boolean }).success) {
        setError((payload as { error?: string }).error || "تعذر إنشاء الحساب");
        return;
      }
      const data = (payload as { data?: { email?: string } }).data;
      onRegistered?.(data?.email ?? email);
    } catch {
      setError("تعذر إنشاء الحساب");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className={styles.loginForm}>
      <label className={styles.loginLabel} htmlFor="signup-name">
        الاسم الكامل
      </label>
      <input
        id="signup-name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        type="text"
        autoComplete="name"
        required
        minLength={2}
        className={styles.loginInput}
      />
      <label className={styles.loginLabel} htmlFor="signup-email">
        البريد الإلكتروني
      </label>
      <input
        id="signup-email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        type="email"
        autoComplete="email"
        required
        className={styles.loginInput}
      />
      <label className={styles.loginLabel} htmlFor="signup-password">
        كلمة المرور
      </label>
      <div className={styles.loginPasswordRow}>
        <input
          id="signup-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          required
          minLength={8}
          className={styles.loginInput}
        />
        <button
          type="button"
          className={styles.loginShowPassword}
          aria-pressed={showPassword}
          aria-controls="signup-password"
          onClick={() => setShowPassword((v) => !v)}
        >
          {showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
        </button>
      </div>
      <label className={styles.loginLabel} htmlFor="signup-confirm">
        تأكيد كلمة المرور
      </label>
      <div className={styles.loginPasswordRow}>
        <input
          id="signup-confirm"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          type={showConfirmPassword ? "text" : "password"}
          autoComplete="new-password"
          required
          minLength={8}
          className={styles.loginInput}
        />
        <button
          type="button"
          className={styles.loginShowPassword}
          aria-pressed={showConfirmPassword}
          aria-controls="signup-confirm"
          onClick={() => setShowConfirmPassword((v) => !v)}
        >
          {showConfirmPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
        </button>
      </div>
      <button type="submit" disabled={loading} className={styles.loginButton}>
        {loading ? "يرجى الانتظار…" : "إنشاء حساب"}
      </button>
      {error ? <p className={styles.loginError}>{error}</p> : null}
    </form>
  );
}
