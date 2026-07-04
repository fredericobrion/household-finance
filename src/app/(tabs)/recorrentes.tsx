import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '@/components/Card';
import {
  RecurringFormModal,
  type RecurringFormValues,
} from '@/components/RecurringFormModal';
import { useBudget } from '@/data/BudgetProvider';
import { formatCurrency } from '@/lib/format';
import { categoryMeta } from '@/theme/categories';
import { Colors, Radius, Spacing } from '@/theme/colors';
import type { RecurringExpense } from '@/types/budget';

export default function RecurringScreen() {
  const { loading, recurring, addRecurring, updateRecurring, deleteRecurring } =
    useBudget();
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<RecurringExpense | null>(null);

  function openNew() {
    setEditing(null);
    setModal(true);
  }

  function openEdit(item: RecurringExpense) {
    setEditing(item);
    setModal(true);
  }

  async function submit(values: RecurringFormValues) {
    try {
      if (editing) {
        await updateRecurring(editing.id, values);
      } else {
        await addRecurring(values);
      }
      setModal(false);
      setEditing(null);
    } catch {
      // erro já exibido pelo provider
    }
  }

  function confirmDelete(item: RecurringExpense) {
    Alert.alert('Excluir recorrente', `Remover "${item.description}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: () => {
          deleteRecurring(item.id).catch(() => {});
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={styles.safe} edges={[]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.intro}>
          Cadastre gastos que se repetem todo mês. Eles não entram sozinhos — no
          Orçamento, use “Incluir recorrente” para lançar no mês (ajustando o
          valor).
        </Text>

        <Card title="Gastos recorrentes">
          {loading ? (
            <ActivityIndicator
              color={Colors.accent}
              style={{ marginVertical: Spacing.lg }}
            />
          ) : recurring.length === 0 ? (
            <Text style={styles.empty}>Nenhum recorrente cadastrado.</Text>
          ) : (
            recurring.map((r) => {
              const meta = categoryMeta(r.category);
              return (
                <TouchableOpacity
                  key={r.id}
                  style={styles.row}
                  activeOpacity={0.7}
                  onPress={() => openEdit(r)}
                >
                  <View style={[styles.dot, { backgroundColor: meta.color }]} />
                  <View style={styles.info}>
                    <Text style={styles.desc} numberOfLines={1}>
                      {r.description}
                    </Text>
                    <Text style={styles.cat}>{meta.label}</Text>
                  </View>
                  <Text style={styles.amount}>
                    {r.baseAmount != null
                      ? formatCurrency(r.baseAmount)
                      : 'Sem valor'}
                  </Text>
                  <TouchableOpacity
                    onPress={() => confirmDelete(r)}
                    hitSlop={8}
                  >
                    <Ionicons
                      name="trash-outline"
                      size={18}
                      color={Colors.textMuted}
                    />
                  </TouchableOpacity>
                </TouchableOpacity>
              );
            })
          )}

          <TouchableOpacity style={styles.addButton} onPress={openNew}>
            <Ionicons name="add" size={20} color="#000" />
            <Text style={styles.addButtonText}>Adicionar recorrente</Text>
          </TouchableOpacity>
        </Card>
      </ScrollView>

      <RecurringFormModal
        visible={modal}
        initial={editing}
        onClose={() => {
          setModal(false);
          setEditing(null);
        }}
        onSubmit={submit}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.lg,
    gap: Spacing.lg,
    paddingBottom: Spacing.xxl * 2,
  },
  intro: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  empty: {
    color: Colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: Spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  info: {
    flex: 1,
  },
  desc: {
    color: Colors.text,
    fontSize: 15,
  },
  cat: {
    color: Colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  amount: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.accent,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    marginTop: Spacing.lg,
  },
  addButtonText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 15,
  },
});
