import { LoginForm } from "@/components/login-form";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2 bg-background">
      {/* Left side: LoginForm */}
      <div className="flex flex-col gap-4 p-6 md:p-10 justify-between">
        <div className="flex justify-center md:justify-start">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <img src="/logo.png" alt="SENIMAN_KAMERA" className="h-8 w-auto object-contain" />
            <span className="font-serif tracking-tighter text-lg">SENIMAN_KAMERA</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center py-12">
          <div className="w-full max-w-sm px-4">
            <LoginForm />
          </div>
        </div>
        <div className="text-center md:text-left font-sans text-[10px] uppercase tracking-widest text-secondary mt-auto">
          © {new Date().getFullYear()} SENIMAN_KAMERA
        </div>
      </div>

      {/* Right side: High-contrast Editorial Photography */}
      <div className="relative hidden bg-muted lg:block">
        <img
          src="/logo.jpg"
          alt="Seniman Kamera Logo"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-[4s] hover:scale-105"
        />
        {/* Subtle overlay to soften the image */}
        <div className="absolute inset-0 bg-black/10 mix-blend-overlay" />
      </div>
    </div>
  );
}
