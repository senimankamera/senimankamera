"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/src/infrastructure/supabase/server";

export async function loginAction(prevState: any, formData: FormData) {
  try {
    const email = formData.get("email")?.toString();
    const password = formData.get("password")?.toString();

    // Simple validation
    if (!email || !password) {
      return { error: "Email and password are required." };
    }

    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error: error.message };
    }
  } catch (error: any) {
    console.error("loginAction error caught:", error);
    if (error.digest && error.digest.startsWith("NEXT_REDIRECT")) {
      throw error;
    }
    return { error: error instanceof Error ? error.message : "Terjadi kesalahan sistem." };
  }

  redirect("/admin");
}

export async function logoutAction() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    console.error("Error signing out from Supabase:", error.message);
  }

  redirect("/login");
}

