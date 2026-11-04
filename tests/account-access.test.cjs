const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const source = fs.readFileSync(path.join(__dirname, '../src/lib/accountAccess.ts'), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } });
const context = { exports: {} };
vm.runInNewContext(compiled.outputText, context);
const { validatePassword, saveAccountPassword } = context.exports;
const password = 'test-only-passphrase';
function fixture() {
  const state = { updated: false, verified: false, houseChecked: false };
  const user = { id: 'owner', email: 'owner@example.test', email_confirmed_at: '2026-11-04', is_anonymous: false };
  const client = { auth: {
    getUser: async () => ({ data: { user }, error: null }),
    updateUser: async data => { assert.equal(data.password, password); state.updated = true; return { error: null }; },
  } };
  const verifier = {
    auth: { signInWithPassword: async data => { assert.equal(data.email, user.email); assert.equal(data.password, password); state.verified = true; return { data: { user }, error: null }; } },
    rpc: async name => { assert.equal(name, 'auth_household_id'); state.houseChecked = true; return { data: 'house', error: null }; },
  };
  return { client, verifier, user, state };
}
test('exige comprimento e confirmação sem remover espaços da senha', () => {
  assert.ok(validatePassword('short', 'short'));
  assert.ok(validatePassword(password, `${password} `));
  assert.equal(validatePassword(password, password), null);
});
test('salva e verifica senha, identidade e casa em cliente separado', async () => {
  const f = fixture();
  await saveAccountPassword(f.client, f.verifier, 'owner', password);
  assert.deepEqual(f.state, { updated: true, verified: true, houseChecked: true });
});
test('não altera senha se a sessão mudou ou o email não está confirmado', async () => {
  for (const mode of ['changed', 'anonymous', 'unconfirmed']) {
    const f = fixture();
    if (mode === 'changed') f.user.id = 'other';
    if (mode === 'anonymous') f.user.is_anonymous = true;
    if (mode === 'unconfirmed') f.user.email_confirmed_at = null;
    await assert.rejects(saveAccountPassword(f.client, f.verifier, 'owner', password));
    assert.equal(f.state.updated, false);
  }
});
test('falha no update não tenta login', async () => {
  const f = fixture();
  f.client.auth.updateUser = async () => ({ error: new Error('policy') });
  await assert.rejects(saveAccountPassword(f.client, f.verifier, 'owner', password), /policy/);
  assert.equal(f.state.verified, false);
});
test('não informa recuperação validada com erro de login, UUID diferente ou falta de casa', async () => {
  for (const mode of ['network', 'different-user', 'no-house']) {
    const f = fixture();
    if (mode === 'network') f.verifier.auth.signInWithPassword = async () => { throw new Error('network'); };
    if (mode === 'different-user') f.verifier.auth.signInWithPassword = async () => ({ data: { user: { id: 'other' } }, error: null });
    if (mode === 'no-house') f.verifier.rpc = async () => ({ data: null, error: null });
    await assert.rejects(saveAccountPassword(f.client, f.verifier, 'owner', password), /senha foi salva.*não foi possível validar/);
    assert.equal(f.state.updated, true);
  }
});
