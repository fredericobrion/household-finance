const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

// Executa o módulo puro TypeScript sem adicionar um runner ao aplicativo.
const source = fs.readFileSync(path.join(__dirname, '../src/lib/investments.ts'), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } });
const context = { exports: {} };
vm.runInNewContext(compiled.outputText, context);
const { investmentTotals, parseQuantity } = context.exports;
const buy = (amount, quantity = null) => ({ amount, quantity });

test('avaliação manual preserva custo, quantidade e preço médio', () => {
  const result = investmentTotals([buy(2000, 100)], 2500);
  assert.equal(result.invested, 2000);
  assert.equal(result.quantity, 100);
  assert.equal(result.average, 20);
  assert.equal(result.gain, 500);
  assert.equal(result.gainPercent, 25);
});
test('novo aporte pondera o preço médio pelas quantidades', () => {
  const result = investmentTotals([buy(2000, 100), buy(1500, 50)], 4000);
  assert.equal(result.invested, 3500);
  assert.equal(result.quantity, 150);
  assert.equal(result.average, 3500 / 150);
  assert.equal(result.gain, 500);
});
test('posição vazia e renda fixa não dividem por zero', () => {
  const empty = investmentTotals([], 0);
  assert.equal(empty.average, 0);
  assert.equal(empty.gainPercent, null);
  const fixed = investmentTotals([buy(1000)], 1050);
  assert.equal(fixed.quantity, 0);
  assert.equal(fixed.gainPercent, 5);
});
test('centavos e perdas são calculados sem resíduos monetários', () => {
  const result = investmentTotals([buy(0.1), buy(0.2)], 0.2);
  assert.equal(result.invested, 0.3);
  assert.equal(result.gain, -0.1);
});
test('quantidades aceitam frações e rejeitam formatos ambíguos', () => {
  assert.equal(parseQuantity('2,5'), 2.5);
  assert.equal(parseQuantity('0.00000001'), 0.00000001);
  for (const value of ['', '1.000,00', '-1', '1e3', 'NaN', '0,000000001']) {
    assert.equal(Number.isNaN(parseQuantity(value)), true, value);
  }
});

const { filterInvestments, changeFilterCategory } = context.exports;
const noFilters = { category: '', institutionId: '', type: '', maturityYear: '' };
const positions = [
  { id: 'cdb', category: 'fixa', institution_id: 'bank-a', investment_type: 'CDB', maturity_date: '2028-03-10' },
  { id: 'reserve', category: 'fixa', institution_id: 'bank-a', investment_type: 'CDB', maturity_date: null },
  { id: 'lci', category: 'fixa', institution_id: 'bank-b', investment_type: 'LCI', maturity_date: '2029-12-01' },
  { id: 'stock', category: 'variavel', institution_id: 'bank-a', investment_type: 'Ação', maturity_date: null },
  { id: 'fii', category: 'variavel', institution_id: 'bank-b', investment_type: 'FII', maturity_date: null },
];
const ids = result => Array.from(result, item => item.id);
test('sem filtros mantém todos; instituição funciona sem categoria', () => {
  assert.deepEqual(ids(filterInvestments(positions, noFilters)), ['cdb', 'reserve', 'lci', 'stock', 'fii']);
  assert.deepEqual(ids(filterInvestments(positions, { ...noFilters, institutionId: 'bank-a' })), ['cdb', 'reserve', 'stock']);
});
test('combina categoria, instituição, tipo e ano de vencimento', () => {
  const fixed = { category: 'fixa', institutionId: 'bank-a', type: 'CDB', maturityYear: '2028' };
  assert.deepEqual(ids(filterInvestments(positions, fixed)), ['cdb']);
  assert.deepEqual(ids(filterInvestments(positions, { ...fixed, maturityYear: '2030' })), []);
  assert.deepEqual(ids(filterInvestments(positions, { ...noFilters, category: 'variavel', type: 'FII' })), ['fii']);
});
test('sem vencimento inclui reserva e exclui posições com data', () => {
  assert.deepEqual(ids(filterInvestments(positions, { ...noFilters, category: 'fixa', maturityYear: 'none' })), ['reserve']);
});
test('trocar categoria limpa dependências e preserva instituição', () => {
  const changed = changeFilterCategory({ category: 'fixa', institutionId: 'bank-a', type: 'CDB', maturityYear: '2028' }, 'variavel');
  assert.equal(changed.category, 'variavel');
  assert.equal(changed.type, '');
  assert.equal(changed.maturityYear, '');
  assert.equal(changed.institutionId, 'bank-a');
  assert.equal(changeFilterCategory(changed, '').category, '');
});
test('filtros ocultos não restringem a listagem', () => {
  assert.deepEqual(ids(filterInvestments(positions, { ...noFilters, type: 'CDB', maturityYear: '2028' })), ['cdb', 'reserve', 'lci', 'stock', 'fii']);
  assert.deepEqual(ids(filterInvestments(positions, { ...noFilters, category: 'variavel', maturityYear: '2028' })), ['stock', 'fii']);
});
