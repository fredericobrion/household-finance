import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { amountToCents, centsToAmount, formatCurrency, onlyDigits } from '@/lib/format';
import { CATEGORIES } from '@/theme/categories';
import { Colors, Radius, Spacing } from '@/theme/colors';
import type { CategoryKey, RecurringExpense } from '@/types/budget';

export interface RecurringFormValues {
  description: string;
  category: CategoryKey;
  baseAmount: number | null;
}

interface RecurringFormModalProps {
  visible: boolean;
  initial?: RecurringExpense | null;
  onClose: () => void;
  onSubmit: (values: RecurringFormValues) => void;
}

export function RecurringFormModal({
  visible,
  initial,
  onClose,
  onSubmit,
}: RecurringFormModalProps) {
  const insets = useSafeAreaInsets();
  const [description, setDescription] = useState('');
  const [amountText, setAmountText] = useState('');
  const [category, setCategory] = useState<CategoryKey | null>(null);

  useEffect(() => {
    if (!visible) return;
    setDescription(initial?.description ?? '');
    setAmountText(initial?.baseAmount != null ? amountToCents(initial.baseAmount) : '');
    setCategory(initial?.category ?? null);
  }, [visible, initial]);

  const baseAmount = amountText ? centsToAmount(amountText) : null;
  const canSave = description.trim().length > 0 && category !== null;

  function handleSave() {
    if (!canSave || category === null) return;
    onSubmit({ description: description.trim(), category, baseAmount });
  }

  return (
    <Modal
      visible={visible}
      transparent
      statusBarTranslucent
      animationType="slide"
      onRequestClose={onClose}>
      <KeyboardAvoidingView behavior="padding" style={styles.backdrop}>
        <View style={[styles.sheet, { paddingBottom: insets.bottom + Spacing.xl }]}>
          <View style={styles.handle} />
          <Text style={styles.title}>
            {initial ? 'Editar recorrente' : 'Novo recorrente'}
          </Text>

          <ScrollView keyboardShouldPersistTaps="handled">
            <Text style={styles.label}>Descrição</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex.: Internet"
              placeholderTextColor={Colors.textMuted}
              value={description}
              onChangeText={setDescription}
            />

            <Text style={styles.label}>Valor base (opcional)</Text>
            <TextInput
              style={styles.input}
              placeholder="R$ 0,00"
              placeholderTextColor={Colors.textMuted}
              keyboardType="numeric"
              value={amountText ? formatCurrency(baseAmount ?? 0) : ''}
              onChangeText={(text) => setAmountText(onlyDigits(text))}
            />

            <Text style={styles.label}>Categoria</Text>
            <View style={styles.categoryGrid}>
              {CATEGORIES.map((c) => {
                const active = category === c.key;
                return (
                  <TouchableOpacity
                    key={c.key}
                    onPress={() => setCategory(c.key)}
                    activeOpacity={0.7}
                    style={[styles.catChip, active && { borderColor: c.color }]}>
                    <View style={[styles.dot, { backgroundColor: c.color }]} />
                    <Text style={[styles.catText, active && styles.catTextActive]}>
                      {c.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          <View style={styles.actions}>
            <TouchableOpacity style={[styles.button, styles.cancel]} onPress={onClose}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.save, !canSave && styles.disabled]}
              onPress={handleSave}
              disabled={!canSave}>
              <Text style={styles.saveText}>Salvar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
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
    maxHeight: '88%',
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
    marginBottom: Spacing.md,
  },
  label: {
    color: Colors.textSecondary,
    fontSize: 13,
    marginBottom: Spacing.xs,
    marginTop: Spacing.md,
  },
  input: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    color: Colors.text,
    fontSize: 16,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  catChip: {
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
  catText: {
    color: Colors.textSecondary,
    fontSize: 13,
  },
  catTextActive: {
    color: Colors.text,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  button: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
  cancel: {
    backgroundColor: Colors.surfaceAlt,
  },
  cancelText: {
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  save: {
    backgroundColor: Colors.accent,
  },
  saveText: {
    color: '#000000',
    fontWeight: '700',
  },
  disabled: {
    opacity: 0.4,
  },
});
