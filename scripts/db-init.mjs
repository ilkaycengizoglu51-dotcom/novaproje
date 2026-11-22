// Tabloları oluşturur, varsayılan ayarları yazar ve ilk yönetici hesabını açar.
// Kullanım: npm run db:init
import { readFileSync, existsSync } from 'node:fs';
import { randomBytes, scryptSync } from 'node:crypto';
import pg from 'pg';

for (const f of ['.env.local', '.env']) {
  if (!existsSync(f)) continue;
  for (const line of readFileSync(f, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}
if (!process.env.DATABASE_URL) { console.error('DATABASE_URL tanımlı değil. .env.local dosyasına ekleyin.'); process.exit(1); }
const db = new pg.Client({ connectionString: process.env.DATABASE_URL, ssl: process.env.DATABASE_SSL === 'false' ? false : { rejectUnauthorized: false } });
await db.connect();
await db.query(readFileSync(new URL('../db/schema.sql', import.meta.url), 'utf8'));
console.log('Tablolar hazır.');
await db.query(`INSERT INTO settings (key, value) VALUES ('autoreply', $1) ON CONFLICT (key) DO NOTHING`, [JSON.stringify({
  enabled: true, welcome: true,
  inHours: 'Merhaba {ad}, mesajınız proje ekibimize ulaştı. Mesai saatleri içindeyiz; kısa süre içinde size dönüş yapacağız.',
  offHours: 'Merhaba {ad}, mesajınız proje ekibimize ulaştı. Şu an mesai saatleri dışındayız; ilk iş gününde saat 09:00’dan itibaren size dönüş yapacağız.',
})]);
const username = (process.env.ADMIN_USERNAME || 'yonetici').trim().toLowerCase();
const ex = await db.query('SELECT id FROM users WHERE username = $1', [username]);
if (ex.rowCount) console.log(`"${username}" zaten var, dokunulmadı.`);
else {
  let pw = process.env.ADMIN_PASSWORD; const gen = !pw;
  if (!pw) { const a = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789'; pw = Array.from(randomBytes(14), (b) => a[b % a.length]).join(''); }
  const salt = randomBytes(16), hash = scryptSync(pw, salt, 64, { N: 16384, r: 8, p: 1 });
  await db.query(`INSERT INTO users (username, password_hash, name, email, role, must_change_password) VALUES ($1,$2,$3,$4,'admin',$5)`,
    [username, `scrypt$${salt.toString('hex')}$${hash.toString('hex')}`, process.env.ADMIN_NAME || 'NOVAPROJE Yönetim', process.env.ADMIN_EMAIL || null, gen]);
  console.log(`Yönetici hesabı açıldı: ${username}`); if (gen) console.log(`Geçici şifre: ${pw}  (ilk girişte değiştirin)`);
}
await db.end();
