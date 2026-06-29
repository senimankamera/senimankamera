"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export function PublicLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isSuccessPage = pathname.startsWith("/book/success");

  return (
    <>
      {!isSuccessPage && <Header />}
      <main className={`flex-1 ${isSuccessPage ? "pt-0" : "pt-[88px]"}`}>
        {children}
      </main>
      {!isSuccessPage && <Footer />}
    </>
  );
}
