import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { parseAmount } from '@/lib/format';
import { Colors, Radius, Spacing } from '@/theme/colors';

export interface IncomeFormValues {
  description: string;
  amount: number;
}

interface IncomeFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (values: IncomeFormValues) => void;
}

export function IncomeFormModal({ visible, onClose, onSubmit }: IncomeFormModalProps) {
  const insets = useSafeAreaInsets();
  const [description, setDescription] = useState('');
  const [amountText, setAmountText] = useState('');

  useEffect(() => {
    if (visible) {
      setDescription('');
      setAmountText('');
    }
  }, [visible]);

  const amount = parseAmount(amountText);
  const canSave = amount > 0;

  function handleSave() {
    if (!canSave) return;
    onSubmit({ description: description.trim(), amount });
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
          <Text style={styles.title}>Lançar renda</Text>

          <Text style={styles.label}>Descrição</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex.: Salário"
            placeholderTextColor={Colors.textMuted}
            value={description}
            onChangeText={setDescription}
          />

          <Text style={styles.label}>Valor (R$)</Text>
          <TextInput
            style={styles.input}
            placeholder="0,00"
            placeholderTextColor={Colors.textMuted}
            keyboardType="numeric"
            value={amountText}
            onChangeText={setAmountText}
          />

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
    paddingBottom: Spacing.xl,
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
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.xl,
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
