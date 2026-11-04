import { Ionicons } from '@expo/vector-icons';
import { Drawer } from 'expo-router/drawer';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider, useAuth } from '@/data/AuthProvider';
import { SignInScreen } from '@/components/SignInScreen';
import { Colors } from '@/theme/colors';

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
    return <SignInScreen initialError={error} retry={retry} />;
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
        name="minha-conta"
        options={{
          title: 'Minha conta',
          drawerLabel: 'Minha conta',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="person-circle-outline" color={color} size={size} />
          ),
        }}
      />
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
        name="investimentos"
        options={{
          title: 'Investimentos',
          drawerLabel: 'Investimentos',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="trending-up-outline" color={color} size={size} />
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
  },
});
