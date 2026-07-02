import AsyncStorage from '@react-native-async-storage/async-storage';

import { addMonths } from '@/lib/month';
import type { MonthKey } from '@/types/budget';
import type { FunEntry, Person } from '@/types/fun';
import type { FunRepository } from './funRepository';

const K_PEOPLE = 'besteira:people';
const K_ENTRIES = 'besteira:entries';

function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

async function readJson<T>(key: string, fallback: T): Promise<T> {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJson(key: string, value: unknown): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export class LocalFunRepository implements FunRepository {
  async listPeople(): Promise<Person[]> {
    const people = await readJson<Person[]>(K_PEOPLE, []);
    return [...people].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  async addPerson(name: string): Promise<Person> {
    const people = await readJson<Person[]>(K_PEOPLE, []);
    const person: Person = { id: uid(), name, createdAt: new Date().toISOString() };
    people.push(person);
    await writeJson(K_PEOPLE, people);
    return person;
  }

  async deletePerson(id: string): Promise<void> {
    const people = await readJson<Person[]>(K_PEOPLE, []);
    await writeJson(
      K_PEOPLE,
      people.filter((p) => p.id !== id),
    );
    const entries = await readJson<FunEntry[]>(K_ENTRIES, []);
    await writeJson(
      K_ENTRIES,
      entries.filter((e) => e.personId !== id),
    );
  }

  async listEntries(personId: string, month: MonthKey): Promise<FunEntry[]> {
    const entries = await readJson<FunEntry[]>(K_ENTRIES, []);
    return entries
      .filter((e) => e.personId === personId && e.month === month)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  async balanceBefore(personId: string, month: MonthKey): Promise<number> {
    const entries = await readJson<FunEntry[]>(K_ENTRIES, []);
    return entries
      .filter((e) => e.personId === personId && e.month < month)
      .reduce((acc, e) => acc + (e.type === 'saldo' ? e.amount : -e.amount), 0);
  }

  async addSaldo(
    personId: string,
    month: MonthKey,
    amount: number,
    description: string,
  ): Promise<void> {
    const entries = await readJson<FunEntry[]>(K_ENTRIES, []);
    entries.push({
      id: uid(),
      personId,
      month,
      type: 'saldo',
      description,
      amount,
      groupId: null,
      installmentIndex: 1,
      installmentCount: 1,
      createdAt: new Date().toISOString(),
    });
    await writeJson(K_ENTRIES, entries);
  }

  async addGasto(
    personId: string,
    month: MonthKey,
    total: number,
    description: string,
    installments: number,
  ): Promise<void> {
    const n = Math.max(1, Math.floor(installments));
    const entries = await readJson<FunEntry[]>(K_ENTRIES, []);
    const now = new Date().toISOString();

    if (n === 1) {
      entries.push({
        id: uid(),
        personId,
        month,
        type: 'gasto',
        description,
        amount: total,
        groupId: null,
        installmentIndex: 1,
        installmentCount: 1,
        createdAt: now,
      });
    } else {
      const per = Math.round((total / n) * 100) / 100;
      const groupId = uid();
      for (let i = 0; i < n; i++) {
        entries.push({
          id: uid(),
          personId,
          month: addMonths(month, i),
          type: 'gasto',
          description,
          amount: i === n - 1 ? Math.round((total - per * (n - 1)) * 100) / 100 : per,
          groupId,
          installmentIndex: i + 1,
          installmentCount: n,
          createdAt: now,
        });
      }
    }

    await writeJson(K_ENTRIES, entries);
  }

  async deleteEntry(entry: FunEntry): Promise<void> {
    const entries = await readJson<FunEntry[]>(K_ENTRIES, []);
    const next = entry.groupId
      ? entries.filter((e) => e.groupId !== entry.groupId)
      : entries.filter((e) => e.id !== entry.id);
    await writeJson(K_ENTRIES, next);
  }
}
