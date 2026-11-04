import { router, useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Alert, BackHandler, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '@/components/Card';
import { InvestmentFiltersModal } from '@/components/InvestmentFiltersModal';
import { InvestmentFormModal, type InvestmentForm } from '@/components/InvestmentFormModal';
import { InvestmentRepository } from '@/data/investmentRepository';
import { formatCurrency, formatDateShort, ymdToBR } from '@/lib/format';
import { filterInvestments, investmentTotals } from '@/lib/investments';
import { Colors, Radius, Spacing } from '@/theme/colors';
import { EMPTY_INVESTMENT_FILTERS, INVESTMENT_OBJECTIVES, type InvestmentFilters, type MaturityInput, type ContributionInput, type Institution, type Investment, type InvestmentObjective, type NewInvestment } from '@/types/investment';

const repository = new InvestmentRepository();
const errorMessage = (e: unknown) => e && typeof e === 'object' && 'message' in e ? String(e.message) : 'Não foi possível carregar os investimentos.';
const quantityFormat = (value: number) => value.toLocaleString('pt-BR', { maximumFractionDigits: 8 });

export default function InvestmentsScreen({ objective }: { objective?: InvestmentObjective }) {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState<InvestmentForm | null>(null);
  const [filters, setFilters] = useState<InvestmentFilters>({ ...EMPTY_INVESTMENT_FILTERS });
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const deletingRef = useRef(false);
  const request = useRef(0);
  const refresh = useCallback(async () => {
    const version = ++request.current;
    setLoading(true); setError('');
    try {
      const [items, banks] = await Promise.all([repository.list(), repository.institutions()]);
      if (version === request.current) { setInvestments(items); setInstitutions(banks); }
    } catch (e) { if (version === request.current) setError(errorMessage(e)); }
    finally { if (version === request.current) setLoading(false); }
  }, []);
  useFocusEffect(useCallback(() => { void refresh(); return () => { request.current++; }; }, [refresh]));
  const goBack = useCallback(() => {
    if (selectedId) {
      setSelectedId(null);
      return true;
    }
    if (objective) {
      router.dismissTo('/investimentos');
      return true;
    }
    return false;
  }, [selectedId, objective]);
  useFocusEffect(useCallback(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', goBack);
    return () => subscription.remove();
  }, [goBack]));
  const selected = investments.find(item => item.id === selectedId);
  const items = objective ? investments.filter(item => item.objective === objective) : investments;
  const filteredItems = filterInvestments(items, filters);
  const activeFilters = Object.values(filters).filter(Boolean).length;
  const maturityYears = [...new Set(items.filter(item => item.category === 'fixa' && item.maturity_date)
    .map(item => item.maturity_date!.slice(0, 4)))].sort();
  const totals = investmentTotals(items.flatMap(item => item.contributions), items.reduce((sum, item) => sum + item.current_value, 0));

  async function submit(input: NewInvestment | ContributionInput | MaturityInput | number) {
    if (!form) return;
    if (form.kind === 'create') await repository.create(input as NewInvestment);
    else if (form.kind === 'maturity') await repository.maturity(form.investment.id, (input as MaturityInput).maturity_date);
    else if (form.kind === 'value') await repository.value(form.investment.id, input as number);
    else await repository.saveContribution(form.investment.id, input as ContributionInput, form.contribution?.id);
    setForm(null);
    // A escrita já terminou. Falhas na atualização ficam na tela, sem reenviar o aporte.
    await refresh();
  }
  function removeInvestment(investment: Investment) {
    Alert.alert('Excluir investimento?', `“${investment.name}” e todos os seus aportes serão excluídos permanentemente. Esta ação não pode ser desfeita.`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir investimento', style: 'destructive', onPress: async () => {
        if (deletingRef.current) return;
        deletingRef.current = true; setDeleting(true);
        try {
          await repository.deleteInvestment(investment.id);
          setInvestments(previous => previous.filter(item => item.id !== investment.id));
          setSelectedId(null);
          await refresh();
        } catch (e) { Alert.alert('Não foi possível excluir o investimento', errorMessage(e)); }
        finally { deletingRef.current = false; setDeleting(false); }
      } },
    ]);
  }
  function removeContribution(id: string) {
    Alert.alert('Excluir aporte?', 'O histórico e a quantidade serão recalculados. O valor do aporte será subtraído do valor atual, limitado a zero.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: async () => {
        if (deletingRef.current) return;
        deletingRef.current = true; setDeleting(true);
        try { await repository.deleteContribution(id); await refresh(); }
        catch (e) { Alert.alert('Não foi possível excluir', errorMessage(e)); }
        finally { deletingRef.current = false; setDeleting(false); }
      } },
    ]);
  }
  const disabled = loading || deleting || error !== '';
  return <SafeAreaView edges={['bottom']} style={styles.safe}>
    <ScrollView contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} tintColor={Colors.accent} />}>
      <Text style={styles.heading}>{objective ? INVESTMENT_OBJECTIVES[objective] : 'Investimentos'}</Text>
      {objective && !selected && <Action label="‹ Voltar aos investimentos" onPress={goBack} />}
      {error !== '' && <Card><Text style={styles.error}>{error}</Text><Action label="Tentar novamente" onPress={() => void refresh()} /></Card>}
      {loading && <ActivityIndicator color={Colors.accent} />}
      {selected ? <>
        <Action label="‹ Voltar ao objetivo" onPress={goBack} />
        <Card title={selected.name}>
          <Text style={styles.secondary}>{INVESTMENT_OBJECTIVES[selected.objective]} · {selected.category === 'fixa' ? 'Renda fixa' : 'Renda variável'} · {selected.investment_type}</Text>
          <Text style={styles.secondary}>{institutions.find(bank => bank.id === selected.institution_id)?.name}</Text>
          {selected.category === 'fixa' && <Row label="Vencimento" value={selected.maturity_date ? ymdToBR(selected.maturity_date) : 'Sem vencimento'} />}
          <Metrics investment={selected} />
          <Text style={styles.secondary}>{selected.valued_at ? `Última avaliação manual: ${formatDateShort(selected.valued_at)}` : 'Sem avaliação manual. Valor atual acompanha os aportes.'}</Text>
          <View style={styles.investmentActions}>
            <Action standardized label="Adicionar aporte" primary disabled={disabled} onPress={() => setForm({ kind: 'contribution', investment: selected })} />
            <Action standardized label="Atualizar valor atual" disabled={disabled} onPress={() => setForm({ kind: 'value', investment: selected })} />
            {selected.category === 'fixa' && <Action standardized label="Editar vencimento" disabled={disabled} onPress={() => setForm({ kind: 'maturity', investment: selected })} />}
            <Action standardized label="Excluir investimento" danger disabled={disabled} onPress={() => removeInvestment(selected)} />
          </View>
        </Card>
        <Text style={styles.subtitle}>Histórico de aportes</Text>
        {selected.contributions.length === 0 && <Text style={styles.secondary}>Nenhum aporte registrado. Adicione o primeiro quando quiser.</Text>}
        {[...selected.contributions].sort((a, b) => b.occurred_on.localeCompare(a.occurred_on) || b.created_at.localeCompare(a.created_at)).map(item => <Card key={item.id}>
          <Text style={styles.subtitle}>{formatCurrency(item.amount)}</Text>
          <Text style={styles.secondary}>{ymdToBR(item.occurred_on)}</Text>
          {item.quantity !== null && <Text style={styles.secondary}>{quantityFormat(item.quantity)} unidades · {formatCurrency(item.amount / item.quantity)} por unidade</Text>}
          <View style={styles.actions}>
            <Action label="Editar" disabled={disabled} onPress={() => setForm({ kind: 'contribution', investment: selected, contribution: item })} />
            <Action label="Excluir" disabled={disabled} onPress={() => removeContribution(item.id)} />
          </View>
        </Card>)}
      </> : <>
        <Text style={styles.secondary}>Acompanhe seus aportes e atualize manualmente quanto seus investimentos valem.</Text>
        {!objective && (Object.keys(INVESTMENT_OBJECTIVES) as InvestmentObjective[]).map(key => {
          const group = investments.filter(item => item.objective === key);
          const current = group.reduce((sum, item) => sum + item.current_value, 0);
          const invested = investmentTotals(group.flatMap(item => item.contributions), current).invested;
          return <TouchableOpacity key={key} onPress={() => router.push({ pathname: '/investimentos/[objective]', params: { objective: key } })} accessibilityRole="button" accessibilityLabel={`Abrir ${INVESTMENT_OBJECTIVES[key]}`} style={styles.objective}>
            <Text style={styles.subtitle}>{INVESTMENT_OBJECTIVES[key]}</Text>
            <Text style={styles.secondary}>{group.length} investimento(s) · Aportado: {formatCurrency(invested)}</Text>
            <Text style={styles.value}>{formatCurrency(current)}</Text>
          </TouchableOpacity>;
        })}
        <Card title={objective ? 'Resumo do objetivo' : 'Resumo geral'}>
          <Row label="Total aportado" value={formatCurrency(totals.invested)} />
          <Row label="Valor atual" value={formatCurrency(items.reduce((sum, item) => sum + item.current_value, 0))} />
          <Gain gain={totals.gain} percent={totals.gainPercent} />
          {objective && <Action label="Cadastrar investimento" primary disabled={disabled} onPress={() => setForm({ kind: 'create', objective })} />}
        </Card>
        {objective && <>
          <View style={styles.listHeader}>
            <Text style={[styles.subtitle, styles.listTitle]}>Investimentos do objetivo</Text>
            <Action inline label={activeFilters ? `Filtros (${activeFilters})` : 'Filtros'} onPress={() => setFiltersOpen(true)} />
          </View>
          {activeFilters > 0 && <Action label="Limpar filtros" onPress={() => setFilters({ ...EMPTY_INVESTMENT_FILTERS })} />}
          {activeFilters > 0 && <Text style={styles.secondary}>Exibindo {filteredItems.length} de {items.length} investimento(s). O resumo mostra o total do objetivo.</Text>}
        </>}
        {objective && !loading && items.length === 0 && <Text style={styles.secondary}>Você ainda não cadastrou investimentos neste objetivo.</Text>}
        {objective && !loading && items.length > 0 && filteredItems.length === 0 && <Text style={styles.secondary}>Nenhum investimento corresponde aos filtros selecionados.</Text>}
        {objective && filteredItems.map(item => <TouchableOpacity key={item.id} onPress={() => setSelectedId(item.id)} accessibilityRole="button" accessibilityLabel={`Ver ${item.name}`}>
          <Card title={item.name}>
            <Text style={styles.secondary}>{item.investment_type} · {institutions.find(bank => bank.id === item.institution_id)?.name}</Text>
            {item.category === 'fixa' && <Text style={styles.secondary}>{item.maturity_date ? `Vencimento: ${ymdToBR(item.maturity_date)}` : 'Sem vencimento'}</Text>}
            <Row label="Valor atual" value={formatCurrency(item.current_value)} />
            <Text style={styles.link}>Ver detalhes e aportes →</Text>
          </Card>
        </TouchableOpacity>)}
      </>}
    </ScrollView>
    <InvestmentFiltersModal visible={filtersOpen} filters={filters} institutions={institutions} years={maturityYears}
      onClose={() => setFiltersOpen(false)} onApply={value => { setFilters(value); setFiltersOpen(false); }} />
    <InvestmentFormModal form={form} institutions={institutions} onClose={() => setForm(null)} onSubmit={submit} />
  </SafeAreaView>;
}
function Metrics({ investment }: { investment: Investment }) {
  const totals = investmentTotals(investment.contributions, investment.current_value);
  return <View style={{ marginVertical: Spacing.md }}>
    <Row label="Total aportado" value={formatCurrency(totals.invested)} />
    <Row label="Valor atual" value={formatCurrency(investment.current_value)} />
    <Gain gain={totals.gain} percent={totals.gainPercent} />
    {investment.category === 'variavel' && <>
      <Row label="Quantidade total" value={quantityFormat(totals.quantity)} />
      <Row label="Preço médio de compra" value={totals.quantity > 0 ? formatCurrency(totals.average) : '—'} />
    </>}
  </View>;
}
function Gain({ gain, percent }: { gain: number; percent: number | null }) {
  return <Row label="Valorização" value={`${formatCurrency(gain)}${percent === null ? ' · —' : ` · ${percent.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}%`}`} color={gain < 0 ? Colors.negative : Colors.positive} />;
}
function Row({ label, value, color = Colors.text }: { label: string; value: string; color?: string }) {
  return <View style={styles.row}><Text style={styles.secondary}>{label}</Text><Text style={[styles.value, { color }]}>{value}</Text></View>;
}
function Action({ label, onPress, primary, danger, disabled, standardized, inline }: { label: string; onPress: () => void; primary?: boolean; danger?: boolean; disabled?: boolean; standardized?: boolean; inline?: boolean }) {
  return <TouchableOpacity accessibilityRole="button" accessibilityState={{ disabled: !!disabled }} disabled={disabled} style={[styles.button, inline && styles.inlineButton, standardized && styles.investmentButton, primary && { backgroundColor: Colors.accent }, danger && { borderColor: Colors.negative, borderWidth: 1 }, disabled && { opacity: 0.4 }]} onPress={onPress}><Text style={{ color: primary ? '#000' : danger ? Colors.negative : Colors.text, fontWeight: '700', textAlign: 'center' }}>{label}</Text></TouchableOpacity>;
}
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg, gap: Spacing.lg, paddingBottom: Spacing.xxl },
  heading: { color: Colors.text, fontSize: 24, fontWeight: '800' },
  subtitle: { color: Colors.text, fontSize: 17, fontWeight: '700' },
  secondary: { color: Colors.textSecondary, fontSize: 14, lineHeight: 21 },
  objective: { backgroundColor: Colors.surface, padding: Spacing.lg, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, gap: Spacing.xs },
  value: { color: Colors.text, fontSize: 16, fontWeight: '700', flexShrink: 1 },
  row: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: Spacing.sm, paddingVertical: Spacing.sm },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginTop: Spacing.md },
  listHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.md, marginTop: Spacing.md },
  listTitle: { flex: 1 },
  inlineButton: { marginTop: 0, flexShrink: 0 },
  investmentActions: { gap: Spacing.sm, marginTop: Spacing.md },
  investmentButton: { width: '100%', minHeight: 52, justifyContent: 'center', marginTop: 0, borderWidth: 1, borderColor: 'transparent' },
  button: { backgroundColor: Colors.surfaceAlt, padding: Spacing.md, borderRadius: Radius.md, alignItems: 'center', marginTop: Spacing.sm },
  link: { color: Colors.accent, marginTop: Spacing.sm },
  error: { color: Colors.negative },
});
