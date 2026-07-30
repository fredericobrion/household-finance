import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
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

import {
  amountToCents,
  centsToAmount,
  dateToYmd,
  formatCurrency,
  normalizeText,
  onlyDigits,
  ymdToBR,
  ymdToDate,
  ymdToday,
} from '@/lib/format';
import { currentMonthKey } from '@/lib/month';
import { CATEGORIES } from '@/theme/categories';
import { Colors, Radius, Spacing } from '@/theme/colors';
import type { CategoryKey, Expense, ExpenseSuggestion, MonthKey } from '@/types/budget';

export interface ExpenseFormValues {
  description: string;
  amount: number;
  category: CategoryKey;
  date: string; // 'YYYY-MM-DD'
  installments: number;
}

interface ExpenseFormModalProps {
  visible: boolean;
  initial?: Expense | null;
  suggestions?: ExpenseSuggestion[];
  /** Trava a categoria (esconde o seletor) — usado ao incluir recorrente. */
  lockedCategory?: CategoryKey;
  presetDescription?: string;
  presetAmount?: number;
  title?: string;
  /** Descrições já lançadas no mês — para avisar de duplicado. */
  existingNames?: string[];
  /** Mês selecionado — define o dia padrão (hoje, ou 1º dia se mês passado). */
  defaultMonth: MonthKey;
  onClose: () => void;
  onSubmit: (values: ExpenseFormValues) => void;
}

export function ExpenseFormModal({
  visible,
  initial,
  suggestions = [],
  lockedCategory,
  presetDescription,
  presetAmount,
  title,
  existingNames = [],
  defaultMonth,
  onClose,
  onSubmit,
}: ExpenseFormModalProps) {
  const insets = useSafeAreaInsets();
  const [description, setDescription] = useState('');
  const [amountText, setAmountText] = useState('');
  const [category, setCategory] = useState<CategoryKey | null>(null);
  const [dateYmd, setDateYmd] = useState('');
  const [installmentsText, setInstallmentsText] = useState('1');
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    if (!visible) return;
    const fallbackDate =
      defaultMonth === currentMonthKey() ? ymdToday() : `${defaultMonth}-01`;
    setShowPicker(false);
    setInstallmentsText('1');
    if (initial) {
      setDescription(initial.description);
      setAmountText(amountToCents(initial.amount));
      setCategory(initial.category);
      setDateYmd(initial.date ?? fallbackDate);
    } else {
      setDescription(presetDescription ?? '');
      setAmountText(presetAmount != null ? amountToCents(presetAmount) : '');
      setCategory(lockedCategory ?? null);
      setDateYmd(fallbackDate);
    }
  }, [visible, initial, presetDescription, presetAmount, lockedCategory, defaultMonth]);

  const amount = centsToAmount(amountText);
  const installments = Math.max(1, Number(installmentsText) || 1);
  const canSave = amount > 0 && category !== null;
  const canSplit = !initial;

  const query = normalizeText(description);
  const matches =
    query.length === 0
      ? []
      : suggestions
          .filter((s) => {
            const nn = normalizeText(s.description);
            return nn.startsWith(query) && nn !== query;
          })
          .slice(0, 6);

  function applySuggestion(s: ExpenseSuggestion) {
    setDescription(s.description);
    if (!lockedCategory) setCategory(s.category);
  }

  const alreadyAdded =
    description.trim().length > 0 &&
    existingNames.some((n) => normalizeText(n) === query);

  function handleSave() {
    if (!canSave || category === null) return;
    onSubmit({
      description: description.trim(),
      amount,
      category,
      date: dateYmd,
      installments: canSplit ? installments : 1,
    });
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
            {title ?? (initial ? 'Editar gasto' : 'Novo gasto')}
          </Text>

          <ScrollView keyboardShouldPersistTaps="handled">
            <Text style={styles.label}>Descrição</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex.: Mercado"
              placeholderTextColor={Colors.textMuted}
              value={description}
              onChangeText={setDescription}
            />

            {matches.length > 0 ? (
              <View style={styles.suggestions}>
                {matches.map((s) => (
                  <TouchableOpacity
                    key={s.description}
                    style={styles.suggestionChip}
                    onPress={() => applySuggestion(s)}
                    activeOpacity={0.7}>
                    <Text style={styles.suggestionText}>{s.description}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : null}

            <Text style={styles.label}>Valor</Text>
            <TextInput
              style={styles.input}
              placeholder="R$ 0,00"
              placeholderTextColor={Colors.textMuted}
              keyboardType="numeric"
              value={amountText ? formatCurrency(amount) : ''}
              onChangeText={(text) => setAmountText(onlyDigits(text))}
            />

            {canSplit ? (
              <>
                <Text style={styles.label}>Dividir em quantas vezes?</Text>
                <TextInput
                  style={styles.input}
                  placeholder="1"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="numeric"
                  value={installmentsText}
                  onChangeText={(text) => setInstallmentsText(onlyDigits(text))}
                  maxLength={2}
                />
                {installments > 1 ? (
                  <Text style={styles.hint}>
                    {installments}x de {formatCurrency(amount / installments)}. Uma parcela por mês.
                  </Text>
                ) : null}
              </>
            ) : null}

            <Text style={styles.label}>Data</Text>
            <TouchableOpacity
              style={styles.dateField}
              onPress={() => setShowPicker(true)}
              activeOpacity={0.7}>
              <Text style={styles.dateText}>{dateYmd ? ymdToBR(dateYmd) : '—'}</Text>
              <Ionicons name="calendar-outline" size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
            {showPicker ? (
              <DateTimePicker
                value={dateYmd ? ymdToDate(dateYmd) : new Date()}
                mode="date"
                maximumDate={new Date()}
                onChange={(event, selected) => {
                  setShowPicker(false);
                  if (event.type === 'set' && selected) {
                    setDateYmd(dateToYmd(selected));
                  }
                }}
              />
            ) : null}

            {lockedCategory ? null : (
              <>
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
              </>
            )}
          </ScrollView>

          {alreadyAdded ? (
            <Text style={styles.warning}>
              ⚠ Já existe um gasto “{description.trim()}” neste mês.
            </Text>
          ) : null}

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
  dateField: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  dateText: {
    color: Colors.text,
    fontSize: 16,
  },
  suggestions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  suggestionChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.pill,
    backgroundColor: Colors.surfaceAlt,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  suggestionText: {
    color: Colors.text,
    fontSize: 13,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
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
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  catText: {
    color: Colors.textSecondary,
    fontSize: 13,
  },
  catTextActive: {
    color: Colors.text,
    fontWeight: '600',
  },
  warning: {
    color: Colors.negative,
    fontSize: 13,
    fontWeight: '600',
    marginTop: Spacing.md,
  },
  hint: {
    color: Colors.textMuted,
    fontSize: 13,
    marginTop: Spacing.sm,
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
