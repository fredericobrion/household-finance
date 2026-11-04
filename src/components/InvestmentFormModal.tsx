import DateTimePicker from '@react-native-community/datetimepicker';
import { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { amountToCents, centsToAmount, dateToYmd, formatCurrency, onlyDigits, ymdToday, ymdToBR, ymdToDate } from '@/lib/format';
import { contributionFromUnitPrice, parseQuantity } from '@/lib/investments';
import { Colors, Radius, Spacing } from '@/theme/colors';
import { INVESTMENT_TYPES, type Contribution, type ContributionInput, type Institution, type Investment, type InvestmentCategory, type InvestmentObjective, type NewInvestment, type MaturityInput } from '@/types/investment';

export type InvestmentForm = { kind: 'create'; objective: InvestmentObjective }
  | { kind: 'contribution'; investment: Investment; contribution?: Contribution }
  | { kind: 'value'; investment: Investment }
  | { kind: 'maturity'; investment: Investment };
interface Props {
  form: InvestmentForm | null;
  institutions: Institution[];
  onClose: () => void;
  onSubmit: (input: NewInvestment | ContributionInput | MaturityInput | number) => Promise<void>;
}

export function InvestmentFormModal({ form, institutions, onClose, onSubmit }: Props) {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [category, setCategory] = useState<InvestmentCategory>('fixa');
  const [type, setType] = useState('CDB');
  const [institution, setInstitution] = useState('');
  const [digits, setDigits] = useState('');
  const [entryMode, setEntryMode] = useState<'total' | 'unit'>('total');
  const [unitDigits, setUnitDigits] = useState('');
  const [quantityText, setQuantity] = useState('');
  const [date, setDate] = useState(ymdToday());
  const [dateOpen, setDateOpen] = useState(false);
  const [maturity, setMaturity] = useState<string | null>(null);
  const [maturityOpen, setMaturityOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const submitting = useRef(false);
  useEffect(() => {
    if (!form) return;
    const contribution = form.kind === 'contribution' ? form.contribution : undefined;
    setEntryMode('total'); setUnitDigits('');
    setName(''); setCategory(form.kind === 'create' ? 'fixa' : form.investment.category);
    setType('CDB'); setInstitution('');
    setMaturity(form.kind === 'maturity' ? form.investment.maturity_date : null); setMaturityOpen(false);
    setDigits(amountToCents(form.kind === 'value' ? form.investment.current_value : contribution?.amount ?? 0));
    setQuantity(contribution?.quantity?.toString().replace('.', ',') ?? '');
    setDate(contribution?.occurred_on ?? ymdToday()); setDateOpen(false); setError('');
  }, [form]);
  if (!form) return null;
  const quantity = parseQuantity(quantityText);
  const unitMode = form.kind === 'contribution' && category === 'variavel' && entryMode === 'unit';
  const unitPrice = centsToAmount(unitDigits);
  const amount = unitMode ? contributionFromUnitPrice(unitPrice, quantity) : centsToAmount(digits);
  const isVariable = category === 'variavel' && form.kind !== 'value' && form.kind !== 'maturity';
  const quantityValid = !isVariable || (form.kind === 'contribution' || amount > 0
    ? Number.isFinite(quantity) && quantity > 0 && quantity < 1e14
    : quantityText.trim() === '');
  const valid = Number.isFinite(amount) && amount < 1e12 && quantityValid
    && (form.kind !== 'contribution' || amount > 0)
    && (form.kind !== 'create' || (name.trim().length > 0 && institution !== ''));
  const title = form.kind === 'create' ? 'Novo investimento'
    : form.kind === 'maturity' ? 'Editar vencimento'
    : form.kind === 'value' ? 'Atualizar valor atual'
    : form.contribution ? 'Editar aporte' : 'Adicionar aporte';

  async function save() {
    if (!form || !valid || submitting.current) return;
    submitting.current = true; setSaving(true); setError('');
    const contribution: ContributionInput = { amount, quantity: isVariable && amount > 0 ? quantity : null, occurred_on: date };
    try {
      await onSubmit(form.kind === 'maturity' ? { maturity_date: maturity } : form.kind === 'value' ? amount : form.kind === 'contribution' ? contribution : {
        name: name.trim(), objective: form.objective, category, investment_type: type,
        institution_id: institution, maturity_date: category === 'fixa' ? maturity : null, initial: contribution,
      });
    } catch (e) {
      setError(e && typeof e === 'object' && 'message' in e ? String(e.message) : 'Não foi possível salvar. Tente novamente.');
    } finally { submitting.current = false; setSaving(false); }
  }
  return <Modal visible transparent animationType="slide" statusBarTranslucent onRequestClose={() => !saving && onClose()}>
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.backdrop}>
      <View style={[styles.sheet, { paddingBottom: insets.bottom + Spacing.lg }]}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
          <Text style={styles.title}>{title}</Text>
          {form.kind !== 'create' && <Text style={styles.help}>{form.investment.name}</Text>}
          {form.kind === 'create' && <>
            <Text style={styles.label}>Nome</Text>
            <TextInput accessibilityLabel="Nome do investimento" style={styles.input} value={name} onChangeText={setName} maxLength={100} placeholder="Ex.: PETR4, Tesouro IPCA+" placeholderTextColor={Colors.textMuted} editable={!saving} />
            <Text style={styles.label}>Categoria</Text>
            <View style={styles.choices}>{(['fixa', 'variavel'] as const).map(item => <Choice key={item} label={item === 'fixa' ? 'Renda fixa' : 'Renda variável'} selected={category === item} disabled={saving} onPress={() => { setCategory(item); setType(INVESTMENT_TYPES[item][0]); setQuantity(''); setMaturity(null); setMaturityOpen(false); }} />)}</View>
            <Text style={styles.label}>Tipo de investimento</Text>
            <View style={styles.choices}>{INVESTMENT_TYPES[category].map(item => <Choice key={item} label={item} selected={type === item} disabled={saving} onPress={() => setType(item)} />)}</View>
            <Text style={styles.label}>Instituição financeira</Text>
            <View style={styles.choices}>{institutions.map(item => <Choice key={item.id} label={item.name} selected={institution === item.id} disabled={saving} onPress={() => setInstitution(item.id)} />)}</View>
            {institutions.length === 0 && <Text style={styles.error}>Nenhuma instituição disponível. Recarregue a tela.</Text>}
          </>}
          {(form.kind === 'maturity' || (form.kind === 'create' && category === 'fixa')) && <>
            <Text style={styles.label}>Vencimento (opcional)</Text>
            <TouchableOpacity style={styles.input} disabled={saving} accessibilityLabel="Selecionar vencimento do investimento" onPress={() => setMaturityOpen(true)}>
              <Text style={styles.text}>{maturity ? ymdToBR(maturity) : 'Sem vencimento · toque para informar'}</Text>
            </TouchableOpacity>
            {maturityOpen && <DateTimePicker value={maturity ? ymdToDate(maturity) : new Date()} mode="date" onChange={(event, selected) => {
              setMaturityOpen(Platform.OS === 'ios');
              if (event.type !== 'dismissed' && selected) setMaturity(dateToYmd(selected));
            }} />}
            {maturity && <TouchableOpacity disabled={saving} onPress={() => { setMaturity(null); setMaturityOpen(false); }}><Text style={styles.help}>Remover vencimento</Text></TouchableOpacity>}
            <Text style={styles.help}>Deixe sem vencimento para reservas ou aplicações sem uma data definida.</Text>
          </>}
          {form.kind !== 'maturity' && <>
            {form.kind === 'contribution' && isVariable && <>
              <Text style={styles.label}>Como informar o aporte?</Text>
              <View style={styles.choices}>
                <Choice label="Valor total" selected={entryMode === 'total'} disabled={saving} onPress={() => setEntryMode('total')} />
                <Choice label="Preço médio" selected={entryMode === 'unit'} disabled={saving} onPress={() => setEntryMode('unit')} />
              </View>
            </>}
            <Text style={styles.label}>{unitMode ? 'Preço médio por unidade deste aporte' : form.kind === 'value' ? 'Quanto vale hoje?' : form.kind === 'create' ? 'Investimento inicial (opcional)' : 'Valor aplicado'}</Text>
            <TextInput accessibilityLabel={unitMode ? "Preço médio por unidade" : "Valor em reais"} style={styles.input} value={unitMode ? (unitDigits ? formatCurrency(unitPrice) : '') : (digits ? formatCurrency(amount) : '')} onChangeText={text => unitMode ? setUnitDigits(onlyDigits(text)) : setDigits(onlyDigits(text))} keyboardType="numeric" maxLength={22} placeholder="R$ 0,00" placeholderTextColor={Colors.textMuted} editable={!saving} />
            {form.kind === 'value' && <Text style={styles.help}>Atualiza o saldo sem alterar o histórico de aportes ou o preço médio de compra.</Text>}
            {isVariable && <>
              <Text style={styles.label}>Quantidade de ações, cotas ou unidades</Text>
              <TextInput accessibilityLabel="Quantidade adquirida" style={styles.input} value={quantityText} onChangeText={setQuantity} keyboardType="decimal-pad" maxLength={23} placeholder="Ex.: 100 ou 2,5" placeholderTextColor={Colors.textMuted} editable={!saving} />
              {unitMode && <Text style={styles.help}>{Number.isFinite(amount) && amount > 0 ? `Total do aporte: ${formatCurrency(amount)}` : 'Informe o preço por unidade e a quantidade para calcular o total.'} O preço informado é o desta compra; o preço médio da carteira será recalculado pelo histórico.</Text>}
              <Text style={styles.help}>{amount > 0 && quantity > 0 ? `Preço por unidade: ${formatCurrency(amount / quantity)}` : 'Informe valor e quantidade para calcular o preço por unidade. Sem investimento inicial, deixe a quantidade vazia.'}</Text>
              {!quantityValid && <Text style={styles.error}>Informe uma quantidade positiva (até 8 casas decimais) ou deixe vazia se o valor inicial for zero.</Text>}
            </>}
            {form.kind !== 'value' && (amount > 0 || form.kind === 'contribution') && <>
              <Text style={styles.label}>Data do aporte</Text>
              <TouchableOpacity style={styles.input} disabled={saving} onPress={() => setDateOpen(true)} accessibilityLabel="Selecionar data do aporte"><Text style={styles.text}>{ymdToBR(date)}</Text></TouchableOpacity>
              {dateOpen && <DateTimePicker value={ymdToDate(date)} mode="date" maximumDate={new Date()} onChange={(_event, selected) => { setDateOpen(Platform.OS === 'ios'); if (selected) setDate(dateToYmd(selected)); }} />}
              <Text style={styles.help}>O valor aplicado será somado ao valor atual. Ao editar, somente a diferença será ajustada.</Text>
            </>}
          </>}
          {error !== '' && <Text style={styles.error} accessibilityRole="alert">{error}</Text>}
          <View style={styles.choices}>
            <TouchableOpacity style={styles.button} disabled={saving} onPress={onClose}><Text style={styles.text}>Cancelar</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.primary, (!valid || saving) && { opacity: 0.4 }]} disabled={!valid || saving} onPress={save}><Text style={styles.primaryText}>{saving ? 'Salvando…' : 'Salvar'}</Text></TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  </Modal>;
}
function Choice({ label, selected, disabled, onPress }: { label: string; selected: boolean; disabled: boolean; onPress: () => void }) {
  return <TouchableOpacity accessibilityRole="radio" accessibilityState={{ checked: selected, disabled }} disabled={disabled} onPress={onPress} style={[styles.choice, selected && { borderColor: Colors.accent }]}><Text style={{ color: selected ? Colors.accent : Colors.textSecondary }}>{label}</Text></TouchableOpacity>;
}
const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.7)' },
  sheet: { maxHeight: '92%', backgroundColor: Colors.surface, borderTopLeftRadius: Radius.lg, borderTopRightRadius: Radius.lg },
  content: { padding: Spacing.lg, gap: Spacing.md },
  title: { color: Colors.text, fontSize: 22, fontWeight: '700' },
  label: { color: Colors.textSecondary, marginTop: Spacing.sm },
  text: { color: Colors.text, fontSize: 16 },
  help: { color: Colors.textSecondary, fontSize: 13, lineHeight: 19 },
  input: { backgroundColor: Colors.surfaceAlt, borderRadius: Radius.md, padding: Spacing.md, color: Colors.text, fontSize: 16 },
  choices: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  choice: { padding: Spacing.sm, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.sm },
  button: { flex: 1, alignItems: 'center', padding: Spacing.lg, backgroundColor: Colors.surfaceAlt, borderRadius: Radius.md },
  primary: { backgroundColor: Colors.accent },
  primaryText: { color: '#000', fontWeight: '700', fontSize: 16 },
  error: { color: Colors.negative },
});
