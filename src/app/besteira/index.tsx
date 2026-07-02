import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
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

import { AddPersonModal } from '@/components/AddPersonModal';
import { Card } from '@/components/Card';
import { FunEntryModal, type FunEntryValues } from '@/components/FunEntryModal';
import { MonthSelector } from '@/components/MonthSelector';
import { useBesteira } from '@/data/BesteiraProvider';
import { formatCurrency } from '@/lib/format';
import { Colors, Radius, Spacing } from '@/theme/colors';
import type { FunEntry, FunType, Person } from '@/types/fun';

export default function BesteiraScreen() {
  const {
    loading,
    people,
    selectedPersonId,
    selectPerson,
    addPerson,
    deletePerson,
    month,
    setMonth,
    entries,
    balanceBefore,
    addSaldo,
    addGasto,
    deleteEntry,
  } = useBesteira();

  const [modal, setModal] = useState<FunType | null>(null);
  const [personModal, setPersonModal] = useState(false);

  const totals = useMemo(() => {
    const saldo = entries.filter((e) => e.type === 'saldo').reduce((a, e) => a + e.amount, 0);
    const gasto = entries.filter((e) => e.type === 'gasto').reduce((a, e) => a + e.amount, 0);
    return { saldo, gasto, final: balanceBefore + saldo - gasto };
  }, [entries, balanceBefore]);

  async function submit(values: FunEntryValues) {
    try {
      if (modal === 'saldo') {
        await addSaldo(values.amount, values.description);
      } else {
        await addGasto(values.amount, values.description, values.installments);
      }
      setModal(null);
    } catch {
      // erro já exibido pelo provider
    }
  }

  async function handleAddPerson(name: string) {
    try {
      await addPerson(name);
      setPersonModal(false);
    } catch {
      // erro já exibido pelo provider
    }
  }

  function confirmDeletePerson(person: Person) {
    Alert.alert(
      'Remover pessoa',
      `Remover "${person.name}" e todos os lançamentos da carteira dela?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: () => {
            deletePerson(person.id).catch(() => {});
          },
        },
      ],
    );
  }

  function confirmDelete(entry: FunEntry) {
    const isGroup = !!entry.groupId && entry.installmentCount > 1;
    Alert.alert(
      'Excluir',
      isGroup
        ? `Remover a compra e todas as ${entry.installmentCount} parcelas?`
        : `Remover "${entry.description || 'lançamento'}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            deleteEntry(entry).catch(() => {});
          },
        },
      ],
    );
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={Colors.accent} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      {/* Seletor de pessoas */}
      <View style={styles.peopleBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.peopleRow}>
          {people.map((p) => {
            const active = p.id === selectedPersonId;
            return (
              <TouchableOpacity
                key={p.id}
                onPress={() => selectPerson(p.id)}
                onLongPress={() => confirmDeletePerson(p)}
                style={[styles.personChip, active && styles.personChipActive]}
                activeOpacity={0.7}>
                <Ionicons
                  name="person-circle-outline"
                  size={16}
                  color={active ? Colors.text : Colors.textSecondary}
                />
                <Text style={[styles.personText, active && styles.personTextActive]}>
                  {p.name}
                </Text>
              </TouchableOpacity>
            );
          })}
          <TouchableOpacity
            onPress={() => setPersonModal(true)}
            style={[styles.personChip, styles.addChip]}
            activeOpacity={0.7}>
            <Ionicons name="add" size={16} color={Colors.accent} />
            <Text style={[styles.personText, { color: Colors.accent }]}>Pessoa</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {people.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="people-outline" size={48} color={Colors.textMuted} />
          <Text style={styles.emptyTitle}>Nenhuma pessoa ainda</Text>
          <Text style={styles.emptyMsg}>
            Cada pessoa tem sua própria carteira de gastos pessoais. Adicione a primeira.
          </Text>
          <TouchableOpacity style={styles.emptyBtn} onPress={() => setPersonModal(true)}>
            <Text style={styles.emptyBtnText}>Adicionar pessoa</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <MonthSelector month={month} onChange={setMonth} />

          <Card>
            <Text style={styles.balanceLabel}>Saldo do mês</Text>
            <Text
              style={[
                styles.balance,
                { color: totals.final < 0 ? Colors.negative : Colors.positive },
              ]}>
              {formatCurrency(totals.final)}
            </Text>
            <Text style={styles.carry}>
              Saldo inicial (do mês anterior): {formatCurrency(balanceBefore)}
            </Text>
            <View style={styles.chips}>
              <Text style={[styles.chip, { color: Colors.positive }]}>
                + {formatCurrency(totals.saldo)} saldo
              </Text>
              <Text style={[styles.chip, { color: Colors.negative }]}>
                − {formatCurrency(totals.gasto)} gasto
              </Text>
            </View>
          </Card>

          <View style={styles.buttons}>
            <TouchableOpacity style={[styles.btn, styles.btnSaldo]} onPress={() => setModal('saldo')}>
              <Ionicons name="add" size={18} color="#000" />
              <Text style={styles.btnText}>Saldo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, styles.btnGasto]} onPress={() => setModal('gasto')}>
              <Ionicons name="remove" size={18} color="#fff" />
              <Text style={styles.btnTextWhite}>Gasto</Text>
            </TouchableOpacity>
          </View>

          <Card title="Lançamentos do mês">
            {entries.length === 0 ? (
              <Text style={styles.emptyList}>Nada lançado neste mês.</Text>
            ) : (
              entries.map((e) => (
                <View key={e.id} style={styles.row}>
                  <View style={styles.rowInfo}>
                    <Text style={styles.rowDesc} numberOfLines={1}>
                      {e.description || (e.type === 'saldo' ? 'Saldo' : 'Gasto')}
                      {e.installmentCount > 1
                        ? ` (${e.installmentIndex}/${e.installmentCount})`
                        : ''}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.rowAmount,
                      { color: e.type === 'saldo' ? Colors.positive : Colors.negative },
                    ]}>
                    {e.type === 'saldo' ? '+' : '−'} {formatCurrency(e.amount)}
                  </Text>
                  <TouchableOpacity onPress={() => confirmDelete(e)} hitSlop={8}>
                    <Ionicons name="trash-outline" size={18} color={Colors.textMuted} />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </Card>

          <Text style={styles.tip}>Dica: segure o nome de uma pessoa para removê-la.</Text>
        </ScrollView>
      )}

      <FunEntryModal
        visible={modal !== null}
        mode={modal ?? 'gasto'}
        onClose={() => setModal(null)}
        onSubmit={submit}
      />
      <AddPersonModal
        visible={personModal}
        onClose={() => setPersonModal(false)}
        onSubmit={handleAddPerson}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  peopleBar: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  peopleRow: {
    gap: Spacing.sm,
    padding: Spacing.md,
  },
  personChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.pill,
    backgroundColor: Colors.surfaceAlt,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  personChipActive: {
    borderColor: Colors.text,
    backgroundColor: Colors.surface,
  },
  addChip: {
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  personText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  personTextActive: {
    color: Colors.text,
    fontWeight: '700',
  },
  content: {
    padding: Spacing.lg,
    gap: Spacing.lg,
    paddingBottom: Spacing.xxl * 2,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  emptyTitle: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  emptyMsg: {
    color: Colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
  },
  emptyBtn: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    marginTop: Spacing.sm,
  },
  emptyBtnText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 15,
  },
  balanceLabel: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  balance: {
    fontSize: 34,
    fontWeight: '800',
    marginTop: Spacing.xs,
  },
  carry: {
    color: Colors.textSecondary,
    fontSize: 13,
    marginTop: Spacing.sm,
  },
  chips: {
    flexDirection: 'row',
    gap: Spacing.lg,
    marginTop: Spacing.sm,
  },
  chip: {
    fontSize: 13,
    fontWeight: '600',
  },
  buttons: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  btn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
  },
  btnSaldo: {
    backgroundColor: Colors.positive,
  },
  btnGasto: {
    backgroundColor: Colors.negative,
  },
  btnText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 15,
  },
  btnTextWhite: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  emptyList: {
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
  rowInfo: {
    flex: 1,
  },
  rowDesc: {
    color: Colors.text,
    fontSize: 15,
  },
  rowAmount: {
    fontSize: 15,
    fontWeight: '700',
  },
  tip: {
    color: Colors.textMuted,
    fontSize: 12,
    textAlign: 'center',
  },
});
