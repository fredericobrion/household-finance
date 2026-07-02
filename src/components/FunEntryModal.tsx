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

import { centsToAmount, formatCurrency, onlyDigits } from '@/lib/format';
import { Colors, Radius, Spacing } from '@/theme/colors';
import type { FunType } from '@/types/fun';

export interface FunEntryValues {
  amount: number;
  description: string;
  installments: number;
}

interface FunEntryModalProps {
  visible: boolean;
  mode: FunType;
  onClose: () => void;
  onSubmit: (values: FunEntryValues) => void;
}

export function FunEntryModal({
  visible,
  mode,
  onClose,
  onSubmit,
}: FunEntryModalProps) {
  const insets = useSafeAreaInsets();
  const [description, setDescription] = useState('');
  const [amountText, setAmountText] = useState('');
  const [installmentsText, setInstallmentsText] = useState('1');

  useEffect(() => {
    if (visible) {
      setDescription(mode === 'saldo' ? 'Saldo' : '');
      setAmountText('');
      setInstallmentsText('1');
    }
  }, [visible, mode]);

  const isGasto = mode === 'gasto';
  const amount = centsToAmount(amountText);
  const installments = Math.max(1, Number(installmentsText) || 1);
  const canSave = amount > 0;

  const perInstallment =
    isGasto && installments > 1 ? amount / installments : 0;

  function handleSave() {
    if (!canSave) return;
    onSubmit({
      amount,
      description: description.trim(),
      installments: isGasto ? installments : 1,
    });
  }

  return (
    <Modal
      visible={visible}
      transparent
      statusBarTranslucent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView behavior="padding" style={styles.backdrop}>
        <View
          style={[styles.sheet, { paddingBottom: insets.bottom + Spacing.xl }]}
        >
          <View style={styles.handle} />
          <Text style={styles.title}>
            {isGasto ? 'Novo gasto' : 'Adicionar saldo'}
          </Text>

          <Text style={styles.label}>Descrição</Text>
          <TextInput
            style={styles.input}
            placeholder={isGasto ? 'Ex.: Kindle' : 'Ex.: Saldo do mês'}
            placeholderTextColor={Colors.textMuted}
            value={description}
            onChangeText={setDescription}
          />

          <Text style={styles.label}>Valor</Text>
          <TextInput
            style={styles.input}
            placeholder="R$ 0,00"
            placeholderTextColor={Colors.textMuted}
            keyboardType="numeric"
            value={amountText ? formatCurrency(amount) : ''}
            onChangeText={(text) => setAmountText(onlyDigits(text))}
          />

          {isGasto ? (
            <>
              <Text style={styles.label}>Dividir em quantas vezes?</Text>
              <TextInput
                style={styles.input}
                placeholder="1"
                placeholderTextColor={Colors.textMuted}
                keyboardType="numeric"
                value={installmentsText}
                onChangeText={(t) => setInstallmentsText(onlyDigits(t))}
                maxLength={2}
              />
              {installments > 1 ? (
                <Text style={styles.hint}>
                  {installments}x de {formatCurrency(perInstallment)} — uma por
                  mês, a partir deste
                </Text>
              ) : null}
            </>
          ) : null}

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.button, styles.cancel]}
              onPress={onClose}
            >
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.save, !canSave && styles.disabled]}
              onPress={handleSave}
              disabled={!canSave}
            >
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
  hint: {
    color: Colors.textSecondary,
    fontSize: 13,
    marginTop: Spacing.sm,
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
