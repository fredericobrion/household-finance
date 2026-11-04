import { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';
import { supabase } from '@/lib/supabase';
import { Colors, Radius, Spacing } from '@/theme/colors';

export function SignInScreen({ initialError, retry }: { initialError: string | null; retry: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const inFlight = useRef(false);

  async function signIn() {
    if (inFlight.current) return;
    if (!email.trim() || !password) { setError('Informe email e senha.'); return; }
    inFlight.current = true;
    setBusy(true);
    setError('');
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (signInError) {
        setError(signInError.code === 'invalid_credentials'
          ? 'Email ou senha incorretos.'
          : 'Não foi possível entrar. Verifique sua conexão e tente novamente.');
      }
    } catch {
      setError('Não foi possível conectar. Tente novamente.');
    } finally {
      setPassword('');
      setBusy(false);
      inFlight.current = false;
    }
  }

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Entrar</Text>
        <Text style={styles.description}>Acesse sua conta com o email e a senha que você definiu.</Text>
        <TextInput accessibilityLabel="Email" placeholder="Email" placeholderTextColor={Colors.textMuted} style={styles.input}
          keyboardType="email-address" autoComplete="email" autoCapitalize="none" autoCorrect={false}
          value={email} onChangeText={setEmail} editable={!busy} />
        <TextInput accessibilityLabel="Senha" placeholder="Senha" placeholderTextColor={Colors.textMuted} style={styles.input}
          secureTextEntry autoComplete="current-password" autoCapitalize="none" autoCorrect={false}
          value={password} onChangeText={setPassword} editable={!busy} onSubmitEditing={signIn} />
        <TouchableOpacity accessibilityRole="button" disabled={busy} onPress={signIn} style={[styles.button, busy && { opacity: 0.5 }]}>
          <Text style={styles.buttonText}>{busy ? 'Entrando…' : 'Entrar'}</Text>
        </TouchableOpacity>
        {!!(error || initialError) && <Text accessibilityLiveRegion="polite" style={styles.error}>{error || initialError}</Text>}
        {!!initialError && <TouchableOpacity accessibilityRole="button" disabled={busy} onPress={retry} style={styles.button}>
          <Text style={styles.buttonText}>Tentar recuperar sessão salva</Text>
        </TouchableOpacity>}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  content: { flexGrow: 1, justifyContent: 'center', padding: Spacing.xl, gap: Spacing.lg },
  title: { color: Colors.text, fontSize: 30, fontWeight: '700' },
  description: { color: Colors.textSecondary, fontSize: 16, lineHeight: 24 },
  input: { backgroundColor: Colors.surface, color: Colors.text, padding: Spacing.lg, borderRadius: Radius.sm, borderWidth: 1, borderColor: Colors.border, fontSize: 16 },
  button: { backgroundColor: Colors.accent, borderRadius: Radius.sm, padding: Spacing.lg, alignItems: 'center' },
  buttonText: { color: Colors.background, fontSize: 16, fontWeight: '700' },
  error: { color: Colors.negative, fontSize: 15, lineHeight: 22 },
});
