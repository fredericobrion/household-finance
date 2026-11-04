import { Redirect, useLocalSearchParams } from 'expo-router';

import InvestmentsScreen from '@/components/InvestmentsScreen';
import { INVESTMENT_OBJECTIVES, type InvestmentObjective } from '@/types/investment';

export default function InvestmentObjectiveScreen() {
  const { objective } = useLocalSearchParams<{ objective?: string | string[] }>();
  if (typeof objective !== 'string' || !Object.prototype.hasOwnProperty.call(INVESTMENT_OBJECTIVES, objective)) {
    return <Redirect href="/investimentos" />;
  }
  return <InvestmentsScreen key={objective} objective={objective as InvestmentObjective} />;
}
