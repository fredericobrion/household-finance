import { ScrollView, StyleSheet, Text, View } from 'react-native';

import type { BudgetSummary } from '@/lib/budget';
import { formatCurrency, formatPercent } from '@/lib/format';
import { Colors, Spacing } from '@/theme/colors';

const COL = {
  name: 150,
  spent: 120,
  should: 120,
  used: 80,
  total: 80,
};
const TABLE_WIDTH = COL.name + COL.spent + COL.should + COL.used + COL.total;

function usedColor(usedPct: number, hasGoal: boolean): string {
  if (!hasGoal) return Colors.textSecondary;
  return usedPct >= 100 ? Colors.negative : Colors.positive;
}

export function SummaryTable({ summary }: { summary: BudgetSummary }) {
  const { rows, totalSpent, totalIncome, usedPct } = summary;

  return (
    <View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ width: TABLE_WIDTH }}>
          <View style={styles.headerRow}>
            <Text style={[styles.th, { width: COL.name }]}>Budget</Text>
            <Text style={[styles.th, styles.right, { width: COL.spent }]}>Valor Gasto</Text>
            <Text style={[styles.th, styles.right, { width: COL.should }]}>Devo gastar</Text>
            <Text style={[styles.th, styles.right, { width: COL.used }]}>Utilizado</Text>
            <Text style={[styles.th, styles.right, { width: COL.total }]}>Total</Text>
          </View>

          {rows.map((r) => (
            <View key={r.key} style={styles.row}>
              <View style={[styles.nameCell, { width: COL.name }]}>
                <View style={[styles.dot, { backgroundColor: r.color }]} />
                <Text style={styles.nameText} numberOfLines={1}>
                  {r.label}
                </Text>
              </View>
              <Text style={[styles.td, styles.right, { width: COL.spent }]}>
                {formatCurrency(r.spent)}
              </Text>
              <Text style={[styles.td, styles.right, { width: COL.should }]}>
                {formatCurrency(r.shouldSpend)}
              </Text>
              <Text
                style={[
                  styles.td,
                  styles.right,
                  { width: COL.used, color: usedColor(r.usedPct, r.goalPct > 0) },
                ]}>
                {formatPercent(r.usedPct, 1)}
              </Text>
              <Text style={[styles.td, styles.right, styles.muted, { width: COL.total }]}>
                {formatPercent(r.totalPct, 1)}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.footerItem}>
          <Text style={[styles.footerValue, { color: Colors.positive }]}>
            {formatCurrency(totalSpent)}
          </Text>
          <Text style={styles.footerLabel}>Total gastos</Text>
        </View>
        <View style={styles.footerItem}>
          <Text style={[styles.footerValue, { color: Colors.negative }]}>
            {formatCurrency(totalIncome)}
          </Text>
          <Text style={styles.footerLabel}>Renda total</Text>
        </View>
        <View style={styles.footerItem}>
          <Text style={[styles.footerValue, { color: Colors.text }]}>
            {formatPercent(usedPct, 0)}
          </Text>
          <Text style={styles.footerLabel}>Utilizado</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingBottom: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  th: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  td: {
    color: Colors.text,
    fontSize: 13,
  },
  right: {
    textAlign: 'right',
  },
  muted: {
    color: Colors.textSecondary,
  },
  nameCell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  nameText: {
    color: Colors.text,
    fontSize: 13,
    flexShrink: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.lg,
  },
  footerItem: {
    flex: 1,
  },
  footerValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  footerLabel: {
    color: Colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
});
