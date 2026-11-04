import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '@/data/AuthProvider';
import { LinkAccountEmail } from '@/components/LinkAccountEmail';
import { AccountPasswordForm } from '@/components/AccountPasswordForm';
import { Colors, Radius, Spacing } from '@/theme/colors';

export default function MinhaContaScreen() {
  const { session } = useAuth();
  const user = session?.user;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.description}>
        Confira qual usuário está conectado neste aparelho.
      </Text>
      <View style={styles.card}>
        <Text style={styles.label}>Identificador do usuário</Text>
        <Text selectable style={styles.identifier}>{user?.id ?? 'Sessão indisponível'}</Text>
        <Text style={styles.label}>Tipo de conta</Text>
        <Text style={styles.value}>
          {!user ? 'Indisponível' : user.is_anonymous === true ? 'Anônima' : user.is_anonymous === false ? 'Permanente' : 'Não informado'}
        </Text>
        {!!user?.email && <>
          <Text style={styles.label}>Email</Text>
          <Text selectable style={styles.value}>{user.email}</Text>
        </>}
      </View>
      {user?.is_anonymous === true && (
        <Text style={styles.description}>
          Esta conta ainda não tem um método de recuperação. Preserve os dados do app
          até vincular uma forma de acesso à sua conta.
        </Text>
      )}
      {user?.is_anonymous === true && <LinkAccountEmail userId={user.id} />}
      {user?.is_anonymous === false && <AccountPasswordForm userId={user.id} />}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.xl, gap: Spacing.xl, paddingBottom: Spacing.xxl },
  card: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.lg, gap: Spacing.md },
  label: { color: Colors.textSecondary, fontSize: 14 },
  identifier: { color: Colors.text, fontSize: 16, lineHeight: 24, marginBottom: Spacing.md },
  value: { color: Colors.text, fontSize: 16 },
  description: { color: Colors.textSecondary, fontSize: 15, lineHeight: 23 },
});
