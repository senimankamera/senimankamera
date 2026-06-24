"use client";

import { useActionState, useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginAction } from "@/src/modules/auth/actions/login.action";
import { requestOtpAction } from "@/src/modules/auth/actions/request-otp.action";
import { verifyOtpAction } from "@/src/modules/auth/actions/verify-otp.action";
import { Eye, EyeOff, KeyRound, Mail, Lock, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  // Login States
  const [state, formAction, isLoginPending] = useActionState(
    loginAction,
    { error: null as string | null }
  );
  const [showPassword, setShowPassword] = useState(false);

  // OTP Flow States
  const [view, setView] = useState<"login" | "request-otp" | "verify-otp">("login");
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [localSuccess, setLocalSuccess] = useState<string | null>(null);
  const [isResetPending, startResetTransition] = useTransition();
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Handle Request OTP
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setLocalSuccess(null);

    if (!identifier.trim()) {
      setLocalError("Email atau username wajib diisi.");
      return;
    }

    startResetTransition(async () => {
      const res = await requestOtpAction(identifier.trim());
      if ("success" in res && res.success) {
        setLocalSuccess(res.message);
        toast.success("OTP telah dikirim ke Telegram!");
        setView("verify-otp");
      } else {
        setLocalError("error" in res ? res.error : "Gagal mengirim OTP.");
      }
    });
  };

  // Handle Verify OTP and Reset Password
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setLocalSuccess(null);

    if (!otp || !newPassword || !confirmPassword) {
      setLocalError("Semua field wajib diisi.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setLocalError("Konfirmasi kata sandi tidak cocok.");
      return;
    }

    if (newPassword.length < 8) {
      setLocalError("Kata sandi baru minimal 8 karakter.");
      return;
    }

    startResetTransition(async () => {
      const res = await verifyOtpAction({
        identifier: identifier.trim(),
        otp,
        newPassword,
      });

      if ("success" in res && res.success) {
        toast.success("Sandi berhasil direset!");
        setLocalSuccess("Kata sandi berhasil diperbarui. Silakan masuk.");
        setView("login");
        setOtp("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setLocalError("error" in res ? res.error : "Gagal mereset kata sandi.");
      }
    });
  };

  if (view === "request-otp") {
    return (
      <form onSubmit={handleRequestOtp} className={cn("flex flex-col gap-6", className)}>
        <div className="flex flex-col items-center gap-2 text-center mb-4">
          <KeyRound className="w-10 h-10 text-primary mb-2" />
          <h1 className="font-serif text-3xl font-medium tracking-tight">Reset Kata Sandi</h1>
          <p className="font-sans text-xs text-secondary tracking-wide uppercase">
            OTP akan dikirim ke Grup Telegram terdaftar
          </p>
        </div>

        <div className="space-y-4">
          {localError && (
            <div className="p-3 text-xs text-red-500 bg-red-50 border border-red-200">
              {localError}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="reset-identifier" className="font-sans text-xs uppercase tracking-widest text-secondary font-bold">
              Email atau Username Anda
            </Label>
            <div className="relative">
              <Input
                key="reset-identifier"
                id="reset-identifier"
                type="text"
                placeholder="senimankamera / email@domain.com"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                className="rounded-none border-border focus:border-primary focus-visible:ring-0 pl-10"
              />
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary/60" />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isResetPending}
            className="w-full font-sans text-xs uppercase tracking-widest py-6 rounded-none mt-2 cursor-pointer"
          >
            {isResetPending ? "Mengirim OTP..." : "Kirim OTP via Telegram"}
          </Button>

          <button
            type="button"
            onClick={() => {
              setView("login");
              setLocalError(null);
            }}
            className="w-full font-sans text-[10px] uppercase tracking-widest text-secondary hover:text-primary transition-colors text-center mt-2 cursor-pointer"
          >
            Kembali ke Login
          </button>
        </div>
      </form>
    );
  }

  if (view === "verify-otp") {
    return (
      <form onSubmit={handleVerifyOtp} className={cn("flex flex-col gap-6", className)}>
        <div className="flex flex-col items-center gap-2 text-center mb-4">
          <ShieldCheck className="w-10 h-10 text-primary mb-2" />
          <h1 className="font-serif text-3xl font-medium tracking-tight">Verifikasi OTP</h1>
          <p className="font-sans text-xs text-secondary tracking-wide uppercase">
            Masukkan OTP dan buat kata sandi baru
          </p>
        </div>

        <div className="space-y-4">
          {localError && (
            <div className="p-3 text-xs text-red-500 bg-red-50 border border-red-200">
              {localError}
            </div>
          )}
          {localSuccess && (
            <div className="p-3 text-xs text-emerald-600 bg-emerald-50 border border-emerald-200">
              {localSuccess}
            </div>
          )}

          {/* OTP Code */}
          <div className="space-y-2">
            <Label htmlFor="otp" className="font-sans text-xs uppercase tracking-widest text-secondary font-bold">
              Kode OTP (6-digit)
            </Label>
            <Input
              key="verify-otp-code"
              id="otp"
              type="text"
              maxLength={6}
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              required
              className="rounded-none border-border focus:border-primary focus-visible:ring-0 text-center tracking-widest font-bold text-lg"
            />
          </div>

          {/* New Password */}
          <div className="space-y-2">
            <Label htmlFor="new-password" className="font-sans text-xs uppercase tracking-widest text-secondary font-bold">
              Kata Sandi Baru
            </Label>
            <div className="relative">
              <Input
                key="verify-new-password"
                id="new-password"
                type={showNewPassword ? "text" : "password"}
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="rounded-none border-border focus:border-primary focus-visible:ring-0 pl-10 pr-10"
              />
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary/60" />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary/60 hover:text-primary focus:outline-none transition-colors cursor-pointer"
              >
                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Confirm New Password */}
          <div className="space-y-2">
            <Label htmlFor="confirm-password" className="font-sans text-xs uppercase tracking-widest text-secondary font-bold">
              Konfirmasi Kata Sandi Baru
            </Label>
            <div className="relative">
              <Input
                key="verify-confirm-password"
                id="confirm-password"
                type={showNewPassword ? "text" : "password"}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="rounded-none border-border focus:border-primary focus-visible:ring-0 pl-10 pr-10"
              />
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary/60" />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isResetPending}
            className="w-full font-sans text-xs uppercase tracking-widest py-6 rounded-none mt-2 cursor-pointer"
          >
            {isResetPending ? "Memproses..." : "Reset Kata Sandi"}
          </Button>

          <button
            type="button"
            onClick={() => {
              setView("request-otp");
              setLocalError(null);
              setLocalSuccess(null);
            }}
            className="w-full font-sans text-[10px] uppercase tracking-widest text-secondary hover:text-primary transition-colors text-center mt-2 cursor-pointer"
          >
            Batal
          </button>
        </div>
      </form>
    );
  }

  // LOGIN VIEW (Default)
  return (
    <form action={formAction} className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex flex-col items-center gap-2 text-center mb-4">
        <h1 className="font-serif text-3xl font-medium tracking-tight">Masuk Admin Studio</h1>
        <p className="font-sans text-xs text-secondary tracking-wide uppercase">
          Masukkan kredensial untuk mengelola studio
        </p>
      </div>

      <div className="space-y-4">
        {state?.error && (
          <div className="p-3 text-xs text-red-500 bg-red-50 border border-red-200">
            {state.error}
          </div>
        )}
        {localSuccess && (
          <div className="p-3 text-xs text-emerald-600 bg-emerald-50 border border-emerald-200">
            {localSuccess}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="email" className="font-sans text-xs uppercase tracking-widest text-secondary font-bold">
            Email atau Username
          </Label>
          <div className="relative">
            <Input
              key="login-email"
              id="email"
              name="email"
              type="text"
              placeholder="kameraseniman / email@domain.com"
              required
              className="rounded-none border-border focus:border-primary focus-visible:ring-0 pl-10"
            />
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary/60" />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="password" className="font-sans text-xs uppercase tracking-widest text-secondary font-bold">
              Kata Sandi
            </Label>
            <button
              type="button"
              onClick={() => {
                setView("request-otp");
                setLocalError(null);
                setLocalSuccess(null);
              }}
              className="font-sans text-[10px] uppercase tracking-widest text-secondary hover:text-primary transition-colors focus:outline-none cursor-pointer"
            >
              Lupa Sandi?
            </button>
          </div>
          <div className="relative">
            <Input
              key="login-password"
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              placeholder="••••••••"
              className="rounded-none border-border focus:border-primary focus-visible:ring-0 pl-10 pr-10"
            />
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary/60" />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary/60 hover:text-primary focus:outline-none transition-colors cursor-pointer"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isLoginPending}
          className="w-full font-sans text-xs uppercase tracking-widest py-6 rounded-none mt-2 cursor-pointer"
        >
          {isLoginPending ? "Masuk..." : "Masuk"}
        </Button>
      </div>
    </form>
  );
}
