// PostgreSQL isolado; não se conecta ao Supabase de produção.
const { PGlite } = await import(process.env.PGLITE_MODULE ?? '@electric-sql/pglite');
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const db = new PGlite();
const migration = name => readFileSync(new URL(`../supabase/migrations/${name}`, import.meta.url), 'utf8');
const owner = '00000000-0000-0000-0000-000000000001';
const outsider = '00000000-0000-0000-0000-000000000002';
await db.exec(`
  create role anon;
  create role authenticated;
  create schema auth;
  create table auth.users(id uuid primary key, raw_user_meta_data jsonb default '{}');
  create function auth.uid() returns uuid language sql stable as $$
    select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
  $$;
  grant usage on schema auth, public to anon, authenticated;
`);
await db.exec(migration('0001_init.sql'));
await db.query('insert into auth.users(id) values ($1)', [owner]);
const house = (await db.query('select household_id from profiles where id=$1', [owner])).rows[0].household_id;
await db.exec(`grant select, insert, update, delete on all tables in schema public to anon, authenticated;
  grant update(household_id), insert(id) on profiles to authenticated;`);
await db.exec(migration('0011_restrict_household_membership.sql'));
// Idempotência da contenção.
await db.exec(migration('0011_restrict_household_membership.sql'));
await db.query('insert into auth.users(id, raw_user_meta_data) values ($1, $2)', [outsider, JSON.stringify({ household_id: house })]);
assert.equal((await db.query('select count(*)::int as n from profiles')).rows[0].n, 1);
assert.equal((await db.query('select count(*)::int as n from households')).rows[0].n, 1);
await db.exec(`set role authenticated; set request.jwt.claim.sub='${owner}';`);
await db.exec("update profiles set display_name='Morador' where id=auth.uid()");
assert.equal((await db.query('select display_name from profiles where id=auth.uid()')).rows[0].display_name, 'Morador');
await db.exec("insert into incomes(reference_month, amount) values ('2026-11-01', 100)");
assert.equal((await db.query('select count(*)::int as n from incomes')).rows[0].n, 1);
await assert.rejects(db.query('update profiles set household_id=$1 where id=auth.uid()', [house]), /permission denied/);
await assert.rejects(db.query('update profiles set id=$1 where id=auth.uid()', [outsider]), /permission denied/);
await assert.rejects(db.exec('delete from profiles where id=auth.uid()'), /permission denied/);
await db.exec(`set request.jwt.claim.sub='${outsider}';`);
assert.equal((await db.query('select auth_household_id() as id')).rows[0].id, null);
for (const table of ['profiles', 'households', 'goals', 'incomes', 'expenses']) {
  assert.equal((await db.query(`select count(*)::int as n from ${table}`)).rows[0].n, 0, table);
}
await assert.rejects(db.query('insert into profiles(id, household_id) values ($1,$2)', [outsider, house]), /permission denied/);
await assert.rejects(db.query("insert into incomes(household_id, reference_month, amount) values ($1,'2026-11-01',1)", [house]), /row-level security/);
await db.exec('update incomes set amount=0; delete from incomes;');
await db.exec(`set request.jwt.claim.sub='${owner}';`);
assert.equal(Number((await db.query('select amount from incomes')).rows[0].amount), 100);
await db.exec("set role anon; set request.jwt.claim.sub='';");
assert.equal((await db.query('select count(*)::int as n from incomes')).rows[0].n, 0);
await assert.rejects(db.query('insert into profiles(id, household_id) values ($1,$2)', [outsider, house]), /permission denied/);
await db.close();
console.log('OK: sessão existente preservada, cadastro sem associação, RLS, bloqueio de escrita em perfis e reaplicação.');
