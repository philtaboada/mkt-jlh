"use server";
import { createClient } from "@/lib/supabase/server";
import { LoginInput, RegisterInput } from "../schemas/auth-schema";

export async function login(data: LoginInput) {
  const supabase = await createClient();
  const { data: session, error } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  });

  if (error) throw error;
  return session;
}

export async function register(data: RegisterInput) {
  const supabase = await  createClient();
  const { data: session, error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        full_name: data.full_name,
      },
    },
  });

  if (error) throw error;
  return session;
}

export async function logout() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
}


export async function forgotPassword(email: string) {
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) throw error;
}