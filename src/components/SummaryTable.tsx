import { StyleSheet, Text, View } from 'react-native';

import type { BudgetSummary } from '@/lib/budget';
import { formatCurrency, formatPercent } from '@/lib/format';
import { Colors, Spacing } from '@/theme/colors';

function usedColor(usedPct: number, hasGoal: boolean): string {
  if (!hasGoal) return Colors.textSecondary;
  return usedPct >= 100 ? Colors.negative : Colors.positive;
}

export function SummaryTable({ summary }: { summary: BudgetSummary }) {
  const { rows, totalSpent, totalIncome, usedPct } = summary;

  return (
    <View>
      <View style={styles.headerRow}>
        <Text style={[styles.th, styles.colName]}>Budget</Text>
        <Text style={[styles.th, styles.colNum]}>Gasto</Text>
        <Text style={[styles.th, styles.colNum]}>Devo gastar</Text>
        <Text style={[styles.th, styles.colSmall]}>Usado</Text>
        <Text style={[styles.th, styles.colSmall]}>Total</Text>
      </View>

      {rows.map((r) => (
        <View key={r.key} style={styles.row}>
          <View style={[styles.colName, styles.nameCell]}>
            <View style={[styles.dot, { backgroundColor: r.color }]} />
            <Text style={styles.nameText} numberOfLines={1}>
              {r.label}
            </Text>
          </View>
          <Text style={[styles.td, styles.colNum]}>{formatCurrency(r.spent)}</Text>
          <Text style={[styles.td, styles.colNum]}>{formatCurrency(r.shouldSpend)}</Text>
          <Text
            style={[styles.td, styles.colSmall, { color: usedColor(r.usedPct, r.goalPct > 0) }]}>
            {formatPercent(r.usedPct, 1)}
          </Text>
          <Text style={[styles.td, styles.colSmall, styles.muted]}>
            {formatPercent(r.totalPct, 1)}
          </Text>
        </View>
      ))}

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
    fontSize: 11,
    fontWeight: '600',
  },
  td: {
    color: Colors.text,
    fontSize: 11.5,
  },
  muted: {
    color: Colors.textSecondary,
  },
  colName: {
    flex: 1.5,
  },
  colNum: {
    flex: 1.15,
    textAlign: 'right',
  },
  colSmall: {
    flex: 0.85,
    textAlign: 'right',
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
    fontSize: 12,
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
