import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Alert } from 'react-native';

import { currentMonthKey } from '@/lib/month';
import type { MonthKey } from '@/types/budget';
import type { FunEntry, Person } from '@/types/fun';
import type { FunRepository } from './funRepository';
import { SupabaseFunRepository } from './supabaseFunRepository';

// 🔁 Ponto único de troca da fonte de dados.
//    Local (offline): const repository = new LocalFunRepository();
//    Supabase (nuvem): const repository = new SupabaseFunRepository();
const repository: FunRepository = new SupabaseFunRepository();

function alertError(e: unknown) {
  Alert.alert('Erro', e instanceof Error ? e.message : 'Falha ao acessar os dados.');
}

interface BesteiraContextValue {
  loading: boolean;
  people: Person[];
  selectedPersonId: string | null;
  selectPerson: (id: string) => void;
  addPerson: (name: string) => Promise<void>;
  deletePerson: (id: string) => Promise<void>;
  month: MonthKey;
  setMonth: (m: MonthKey) => void;
  entries: FunEntry[];
  balanceBefore: number;
  addSaldo: (amount: number, description: string) => Promise<void>;
  addGasto: (total: number, description: string, installments: number) => Promise<void>;
  deleteEntry: (entry: FunEntry) => Promise<void>;
}

const BesteiraContext = createContext<BesteiraContextValue | null>(null);

export function BesteiraProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [people, setPeople] = useState<Person[]>([]);
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);
  const [month, setMonth] = useState<MonthKey>(currentMonthKey());
  const [entries, setEntries] = useState<FunEntry[]>([]);
  const [balanceBefore, setBalanceBefore] = useState(0);

  const refreshEntries = useCallback(async (pid: string, m: MonthKey) => {
    const [list, before] = await Promise.all([
      repository.listEntries(pid, m),
      repository.balanceBefore(pid, m),
    ]);
    setEntries(list);
    setBalanceBefore(before);
  }, []);

  // carga inicial das pessoas
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const list = await repository.listPeople();
        if (!active) return;
        setPeople(list);
        setSelectedPersonId((prev) => prev ?? list[0]?.id ?? null);
      } catch (e) {
        if (active) alertError(e);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // recarrega lançamentos quando muda pessoa ou mês
  useEffect(() => {
    let active = true;
    (async () => {
      if (!selectedPersonId) {
        setEntries([]);
        setBalanceBefore(0);
        return;
      }
      try {
        await refreshEntries(selectedPersonId, month);
      } catch (e) {
        if (active) alertError(e);
      }
    })();
    return () => {
      active = false;
    };
  }, [selectedPersonId, month, refreshEntries]);

  const addPerson = useCallback(async (name: string) => {
    try {
      const p = await repository.addPerson(name);
      setPeople(await repository.listPeople());
      setSelectedPersonId(p.id);
    } catch (e) {
      alertError(e);
      throw e;
    }
  }, []);

  const deletePerson = useCallback(async (id: string) => {
    try {
      await repository.deletePerson(id);
      const list = await repository.listPeople();
      setPeople(list);
      setSelectedPersonId((prev) => (prev === id ? list[0]?.id ?? null : prev));
    } catch (e) {
      alertError(e);
      throw e;
    }
  }, []);

  const addSaldo = useCallback(
    async (amount: number, description: string) => {
      if (!selectedPersonId) return;
      try {
        await repository.addSaldo(selectedPersonId, month, amount, description);
        await refreshEntries(selectedPersonId, month);
      } catch (e) {
        alertError(e);
        throw e;
      }
    },
    [selectedPersonId, month, refreshEntries],
  );

  const addGasto = useCallback(
    async (total: number, description: string, installments: number) => {
      if (!selectedPersonId) return;
      try {
        await repository.addGasto(selectedPersonId, month, total, description, installments);
        await refreshEntries(selectedPersonId, month);
      } catch (e) {
        alertError(e);
        throw e;
      }
    },
    [selectedPersonId, month, refreshEntries],
  );

  const deleteEntry = useCallback(
    async (entry: FunEntry) => {
      try {
        await repository.deleteEntry(entry);
        if (selectedPersonId) await refreshEntries(selectedPersonId, month);
      } catch (e) {
        alertError(e);
        throw e;
      }
    },
    [selectedPersonId, month, refreshEntries],
  );

  const value = useMemo<BesteiraContextValue>(
    () => ({
      loading,
      people,
      selectedPersonId,
      selectPerson: setSelectedPersonId,
      addPerson,
      deletePerson,
      month,
      setMonth,
      entries,
      balanceBefore,
      addSaldo,
      addGasto,
      deleteEntry,
    }),
    [
      loading,
      people,
      selectedPersonId,
      addPerson,
      deletePerson,
      month,
      entries,
      balanceBefore,
      addSaldo,
      addGasto,
      deleteEntry,
    ],
  );

  return <BesteiraContext.Provider value={value}>{children}</BesteiraContext.Provider>;
}

export function useBesteira(): BesteiraContextValue {
  const ctx = useContext(BesteiraContext);
  if (!ctx) throw new Error('useBesteira deve ser usado dentro de <BesteiraProvider>');
  return ctx;
}
