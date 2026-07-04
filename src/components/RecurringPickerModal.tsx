import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { formatCurrency } from '@/lib/format';
import { categoryMeta } from '@/theme/categories';
import { Colors, Radius, Spacing } from '@/theme/colors';
import type { RecurringExpense } from '@/types/budget';

interface RecurringPickerModalProps {
  visible: boolean;
  recurring: RecurringExpense[];
  onPick: (item: RecurringExpense) => void;
  onClose: () => void;
}

export function RecurringPickerModal({
  visible,
  recurring,
  onPick,
  onClose,
}: RecurringPickerModalProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      statusBarTranslucent
      animationType="slide"
      onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.sheet, { paddingBottom: insets.bottom + Spacing.xl }]}>
          <View style={styles.handle} />
          <Text style={styles.title}>Incluir gasto recorrente</Text>

          {recurring.length === 0 ? (
            <Text style={styles.empty}>
              Nenhum recorrente cadastrado. Cadastre na aba “Recorrentes”.
            </Text>
          ) : (
            <ScrollView style={{ maxHeight: 380 }}>
              {recurring.map((r) => {
                const meta = categoryMeta(r.category);
                return (
                  <TouchableOpacity
                    key={r.id}
                    style={styles.row}
                    activeOpacity={0.7}
                    onPress={() => onPick(r)}>
                    <View style={[styles.dot, { backgroundColor: meta.color }]} />
                    <View style={styles.info}>
                      <Text style={styles.desc} numberOfLines={1}>
                        {r.description}
                      </Text>
                      <Text style={styles.cat}>{meta.label}</Text>
                    </View>
                    <Text style={styles.amount}>
                      {r.baseAmount != null ? formatCurrency(r.baseAmount) : '—'}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}

          <TouchableOpacity style={styles.cancel} onPress={onClose}>
            <Text style={styles.cancelText}>Fechar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg,
    padding: Spacing.lg,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    marginBottom: Spacing.md,
  },
  title: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  empty: {
    color: Colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: Spacing.xl,
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
    fontSize: 15,
    fontWeight: '600',
  },
  cancel: {
    marginTop: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    alignItems: 'center',
    backgroundColor: Colors.surfaceAlt,
  },
  cancelText: {
    color: Colors.textSecondary,
    fontWeight: '600',
  },
});
