import type { SupabaseClient } from '@supabase/supabase-js';

export function validatePassword(password: string, confirmation: string): string | null {
  if (password.length < 12) return 'Use uma senha com pelo menos 12 caracteres.';
  if (password !== confirmation) return 'As senhas não coincidem.';
  return null;
}

export async function saveAccountPassword(
  client: SupabaseClient, verifier: SupabaseClient, userId: string, password: string,
) {
  const { data, error } = await client.auth.getUser();
  if (error) throw error;
  if (data.user.id !== userId) throw new Error('A sessão mudou. Reabra Minha conta.');
  const user = data.user;
  if (user.is_anonymous || !user.email || !user.email_confirmed_at) {
    throw new Error('Confirme o email desta conta antes de definir a senha.');
  }
  const { error: updateError } = await client.auth.updateUser({ password });
  if (updateError) throw updateError;

  // Confirma recuperação sem encerrar a sessão principal nem armazenar outra.
  try {
    const { data: signedIn, error: signInError } = await verifier.auth.signInWithPassword({ email: user.email, password });
    if (signInError) throw signInError;
    if (signedIn.user?.id !== userId) throw new Error('Identidade diferente.');
    const { data: house, error: houseError } = await verifier.rpc('auth_household_id');
    if (houseError || !house) throw new Error('Vínculo não confirmado.');
  } catch {
    throw new Error('A senha foi salva, mas não foi possível validar a entrada e o acesso à casa. Mantenha esta sessão e tente novamente quando houver conexão.');
  }
}
