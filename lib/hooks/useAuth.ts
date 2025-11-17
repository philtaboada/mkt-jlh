'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import type {
  LoginInput,
  RegisterInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from '@/lib/schemas/authSchemas';

export function useAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const supabase: any = createClient();

  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ['auth', 'user'],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      return user;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  const loginMutation = useMutation({
    mutationFn: async ({ email, password }: LoginInput) => {
      if (!supabase || !supabase.auth || typeof supabase.auth.signInWithPassword !== 'function') {
        throw new Error(
          'Supabase auth client not available. Ensure @supabase/supabase-js is installed and createClient() returns a supabase client with auth. Also verify NEXT_PUBLIC_SUPABASE_XXX env vars.'
        );
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'user'] });
      router.push('/dashboard');
      router.refresh();
      toast.success('Sesión iniciada correctamente');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Error al iniciar sesión');
    },
  });

  const registerMutation = useMutation({
    mutationFn: async ({ email, password, name }: RegisterInput) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
          },
        },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'user'] });
      toast.success('Cuenta creada correctamente');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Error al crear la cuenta');
    },
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: async ({ email }: ForgotPasswordInput) => {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async ({ password }: ResetPasswordInput) => {
      const { error } = await supabase.auth.updateUser({
        password,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      router.push('/dashboard');
      router.refresh();
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.setQueryData(['auth', 'user'], null);
      queryClient.clear();
      router.push('/auth/login');
      router.refresh();
      toast('Sesión cerrada');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Error al cerrar sesión');
    },
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,

    login: loginMutation.mutate,
    register: registerMutation.mutate,
    forgotPassword: forgotPasswordMutation.mutate,
    resetPassword: resetPasswordMutation.mutate,
    logout: logoutMutation.mutate,

    isLoginLoading: loginMutation.isPending,
    isRegisterLoading: registerMutation.isPending,
    isForgotPasswordLoading: forgotPasswordMutation.isPending,
    isResetPasswordLoading: resetPasswordMutation.isPending,
    isLogoutLoading: logoutMutation.isPending,

    loginError: loginMutation.error,
    registerError: registerMutation.error,
    forgotPasswordError: forgotPasswordMutation.error,
    resetPasswordError: resetPasswordMutation.error,
  };
}
