import { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '@/lib/supabase';
import { Colors, Radius, Spacing } from '@/theme/colors';

export function LinkAccountEmail({ userId }: { userId: string }) {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  async function submit(checkOnly: boolean) {
    if (busy) return;
    const address = email.trim();
    if (!checkOnly && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)) {
      setMessage('Informe um email válido.');
      return;
    }
    setBusy(true);
    setMessage('');
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) throw error;
      if (data.user.id !== userId) throw new Error('A sessão mudou. Reabra Minha conta antes de continuar.');
      if (checkOnly) {
        if (data.user.is_anonymous || !data.user.email_confirmed_at) {
          setMessage('Confirmação pendente. Abra o link enviado ao seu email e depois consulte novamente.');
        } else {
          const { error: refreshError } = await supabase.auth.refreshSession();
          if (refreshError) throw refreshError;
          setMessage('Email confirmado. Sua identidade e seus dados foram preservados.');
        }
        return;
      }
      if (!data.user.is_anonymous) {
        setMessage('Esta conta já é permanente. Reabra Minha conta para consultar o estado atual.');
        return;
      }
      const { error: updateError } = await supabase.auth.updateUser({ email: address });
      if (updateError) throw updateError;
      setMessage('Solicitação enviada. Confira sua caixa de entrada e spam, abra o link de confirmação e volte para consultar a confirmação.');
    } catch (error) {
      const code = (error as { code?: string })?.code;
      setMessage(code === 'email_exists' || code === 'user_already_exists'
        ? 'Este email já pertence a outra conta. Seu acesso atual foi mantido. Precisamos revisar essa conta antes de continuar.'
        : error instanceof Error ? error.message : 'Não foi possível concluir. Tente novamente.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Vincular email</Text>
      <Text style={styles.description}>Confirme um email para manter esta mesma conta. A confirmação será enviada para o endereço informado.</Text>
      <TextInput accessibilityLabel="Email da conta" placeholder="Seu email" placeholderTextColor={Colors.textMuted}
        value={email} onChangeText={setEmail} editable={!busy} autoCapitalize="none" autoCorrect={false}
        keyboardType="email-address" autoComplete="email" style={styles.input} />
      <TouchableOpacity accessibilityRole="button" disabled={busy} onPress={() => submit(false)} style={[styles.button, busy && styles.disabled]}>
        <Text style={styles.buttonText}>{busy ? 'Aguarde…' : 'Enviar confirmação'}</Text>
      </TouchableOpacity>
      <TouchableOpacity accessibilityRole="button" disabled={busy} onPress={() => submit(true)} style={styles.secondary}>
        <Text style={styles.title}>Consultar confirmação</Text>
      </TouchableOpacity>
      {!!message && <Text accessibilityLiveRegion="polite" style={styles.description}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: Colors.surface, padding: Spacing.lg, borderRadius: Radius.lg, gap: Spacing.md },
  title: { color: Colors.text, fontSize: 16, fontWeight: '600' },
  description: { color: Colors.textSecondary, fontSize: 15, lineHeight: 23 },
  input: { color: Colors.text, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.sm, padding: Spacing.md, fontSize: 16 },
  button: { backgroundColor: Colors.accent, padding: Spacing.lg, borderRadius: Radius.sm, alignItems: 'center' },
  buttonText: { color: Colors.background, fontWeight: '700', fontSize: 16 },
  secondary: { padding: Spacing.md, alignItems: 'center' },
  disabled: { opacity: 0.5 },
});
