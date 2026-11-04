import { useRef, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { saveAccountPassword, validatePassword } from '@/lib/accountAccess';
import { createVerificationClient, supabase } from '@/lib/supabase';
import { Colors, Radius, Spacing } from '@/theme/colors';

export function AccountPasswordForm({ userId }: { userId: string }) {
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const inFlight = useRef(false);

  async function save() {
    if (inFlight.current) return;
    const invalid = validatePassword(password, confirmation);
    if (invalid) { setMessage(invalid); return; }
    inFlight.current = true;
    setBusy(true);
    setMessage('');
    try {
      await saveAccountPassword(supabase, createVerificationClient(), userId, password);
      setMessage('Senha salva. Entrada com email e senha e acesso à sua casa verificados. Sua sessão continua ativa.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Não foi possível salvar. Tente novamente.');
    } finally {
      setPassword('');
      setConfirmation('');
      setBusy(false);
      inFlight.current = false;
    }
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Definir senha</Text>
      <Text style={styles.description}>Use pelo menos 12 caracteres. Você poderá entrar com seu email e esta senha se precisar recuperar o acesso.</Text>
      <TextInput accessibilityLabel="Nova senha" placeholder="Nova senha" placeholderTextColor={Colors.textMuted}
        secureTextEntry autoCapitalize="none" autoCorrect={false} autoComplete="new-password"
        value={password} onChangeText={setPassword} editable={!busy} style={styles.input} />
      <TextInput accessibilityLabel="Confirmar senha" placeholder="Confirmar senha" placeholderTextColor={Colors.textMuted}
        secureTextEntry autoCapitalize="none" autoCorrect={false} autoComplete="new-password"
        value={confirmation} onChangeText={setConfirmation} editable={!busy} style={styles.input} />
      <TouchableOpacity accessibilityRole="button" disabled={busy} onPress={save} style={[styles.button, busy && { opacity: 0.5 }]}>
        <Text style={styles.buttonText}>{busy ? 'Salvando e verificando…' : 'Salvar senha'}</Text>
      </TouchableOpacity>
      {!!message && <Text accessibilityLiveRegion="polite" style={styles.description}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: Colors.surface, padding: Spacing.lg, borderRadius: Radius.lg, gap: Spacing.md },
  title: { color: Colors.text, fontSize: 18, fontWeight: '600' },
  description: { color: Colors.textSecondary, fontSize: 15, lineHeight: 23 },
  input: { color: Colors.text, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.sm, padding: Spacing.md, fontSize: 16 },
  button: { backgroundColor: Colors.accent, padding: Spacing.lg, borderRadius: Radius.sm, alignItems: 'center' },
  buttonText: { color: Colors.background, fontSize: 16, fontWeight: '700' },
});
