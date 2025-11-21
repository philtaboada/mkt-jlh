import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { forgotPassword, getCurrentUser, login, logout, register } from '../api/auth';
import type { LoginInput, RegisterInput } from '../schemas/auth-schema';
import { toast } from 'sonner';

export function useLogin() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LoginInput) => login(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      toast.success('Sesión iniciada correctamente');
      router.push('/dashboard');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al iniciar sesión');
    },
  });
}

export function useRegister() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RegisterInput) => register(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      toast.success('Cuenta creada exitosamente');
      router.push('/dashboard');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al registrarse');
    },
  });
}

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.setQueryData(['user'], null);
      toast.success('Sesión cerrada');
      router.push('/auth/login');
    },
  });
}

export function useUser() {
  return useQuery({
    queryKey: ['user'],
    queryFn: getCurrentUser,
    retry: false,
    staleTime: Infinity,
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: async (email: string) => {
      forgotPassword(email);
    },
    onSuccess: () => {
      toast.success('Correo de recuperación enviado');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al enviar el correo de recuperación');
    },
  });
}
