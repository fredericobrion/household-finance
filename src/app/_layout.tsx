import { Ionicons } from '@expo/vector-icons';
import { Drawer } from 'expo-router/drawer';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider, useAuth } from '@/data/AuthProvider';
import { Colors, Radius, Spacing } from '@/theme/colors';

function Gate() {
  const { session, loading, error, retry } = useAuth();

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={Colors.accent} />
      </View>
    );
  }

  if (!session) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorTitle}>Não foi possível conectar</Text>
        <Text style={styles.errorMsg}>
          {error ?? 'Verifique sua internet e tente novamente.'}
        </Text>
        <TouchableOpacity style={styles.retry} onPress={retry}>
          <Text style={styles.retryText}>Tentar de novo</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <Drawer
      screenOptions={{
        headerStyle: { backgroundColor: Colors.surface },
        headerTintColor: Colors.text,
        headerTitleStyle: { fontWeight: '700' },
        drawerStyle: { backgroundColor: Colors.surface },
        drawerActiveTintColor: Colors.accent,
        drawerInactiveTintColor: Colors.textSecondary,
        drawerActiveBackgroundColor: Colors.surfaceAlt,
      }}>
      <Drawer.Screen
        name="(tabs)"
        options={{
          title: 'Orçamento',
          drawerLabel: 'Orçamento',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="wallet-outline" color={color} size={size} />
          ),
        }}
      />
      <Drawer.Screen
        name="besteira"
        options={{
          title: 'Gastos Pessoais',
          drawerLabel: 'Gastos Pessoais',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="happy-outline" color={color} size={size} />
          ),
        }}
      />
    </Drawer>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: Colors.background }}>
      <SafeAreaProvider>
        <AuthProvider>
          <StatusBar style="light" />
          <Gate />
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  errorTitle: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  errorMsg: {
    color: Colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
  },
  retry: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    marginTop: Spacing.sm,
  },
  retryText: {
    color: '#000',
    fontWeight: '700',
  },
});
