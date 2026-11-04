import { useEffect, useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { changeFilterCategory } from '@/lib/investments';
import { Colors, Radius, Spacing } from '@/theme/colors';
import { EMPTY_INVESTMENT_FILTERS, INVESTMENT_TYPES, type Institution, type InvestmentFilters } from '@/types/investment';

interface Props {
  visible: boolean;
  filters: InvestmentFilters;
  institutions: Institution[];
  years: string[];
  onClose: () => void;
  onApply: (filters: InvestmentFilters) => void;
}
export function InvestmentFiltersModal({ visible, filters, institutions, years, onClose, onApply }: Props) {
  const insets = useSafeAreaInsets();
  const [draft, setDraft] = useState<InvestmentFilters>({ ...EMPTY_INVESTMENT_FILTERS });
  useEffect(() => { if (visible) setDraft({ ...filters }); }, [visible, filters]);
  function option(label: string, value: string, field: keyof InvestmentFilters) {
    const selected = draft[field] === value;
    return <TouchableOpacity key={value} accessibilityRole="radio" accessibilityState={{ checked: selected }}
      style={[styles.option, selected && { borderColor: Colors.accent }]} onPress={() => {
        setDraft(previous => field === 'category'
          ? changeFilterCategory(previous, value as InvestmentFilters['category'])
          : { ...previous, [field]: value });
      }}><Text style={{ color: selected ? Colors.accent : Colors.textSecondary }}>{label}</Text></TouchableOpacity>;
  }
  return <Modal visible={visible} transparent animationType="slide" statusBarTranslucent onRequestClose={onClose}>
    <View style={styles.backdrop}>
      <View style={[styles.sheet, { paddingBottom: insets.bottom + Spacing.lg }]}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>Filtrar investimentos</Text>
          <Text style={styles.label}>Categoria</Text>
          <View style={styles.choices}>
            {option('Todas', '', 'category')}{option('Renda fixa', 'fixa', 'category')}{option('Renda variável', 'variavel', 'category')}
          </View>
          <Text style={styles.label}>Instituição financeira</Text>
          <View style={styles.choices}>{option('Todas', '', 'institutionId')}{institutions.map(item => option(item.name, item.id, 'institutionId'))}</View>
          {draft.category && <>
            <Text style={styles.label}>Tipo de investimento</Text>
            <View style={styles.choices}>{option('Todos', '', 'type')}{INVESTMENT_TYPES[draft.category].map(type => option(type, type, 'type'))}</View>
          </>}
          {draft.category === 'fixa' && <>
            <Text style={styles.label}>Ano de vencimento</Text>
            <View style={styles.choices}>
              {option('Todos', '', 'maturityYear')}{option('Sem vencimento', 'none', 'maturityYear')}
              {years.map(year => option(year, year, 'maturityYear'))}
            </View>
          </>}
          <Text style={styles.help}>Os filtros são combinados e alteram somente a listagem. O resumo mantém o total do objetivo.</Text>
          <TouchableOpacity style={styles.button} onPress={() => setDraft({ ...EMPTY_INVESTMENT_FILTERS })}><Text style={styles.text}>Limpar filtros</Text></TouchableOpacity>
          <View style={styles.choices}>
            <TouchableOpacity style={[styles.button, { flex: 1 }]} onPress={onClose}><Text style={styles.text}>Cancelar</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.primary, { flex: 1 }]} onPress={() => onApply(draft)}><Text style={styles.primaryText}>Aplicar filtros</Text></TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </View>
  </Modal>;
}
const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.7)' },
  sheet: { maxHeight: '90%', backgroundColor: Colors.surface, borderTopLeftRadius: Radius.lg, borderTopRightRadius: Radius.lg },
  content: { padding: Spacing.lg, gap: Spacing.md },
  title: { color: Colors.text, fontSize: 22, fontWeight: '700' },
  label: { color: Colors.textSecondary, marginTop: Spacing.sm },
  choices: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  option: { padding: Spacing.sm, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.sm },
  button: { padding: Spacing.lg, backgroundColor: Colors.surfaceAlt, borderRadius: Radius.md, alignItems: 'center' },
  primary: { backgroundColor: Colors.accent },
  primaryText: { color: '#000', fontWeight: '700', fontSize: 16 },
  text: { color: Colors.text, fontSize: 16 },
  help: { color: Colors.textSecondary, fontSize: 13, lineHeight: 19 },
});
