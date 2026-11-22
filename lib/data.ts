import { one, q } from './db';
import { todayISO } from './format';

const D = (c: string, as?: string) => `to_char(${c}, 'YYYY-MM-DD') AS ${as || c.split('.').pop()}`;
const PCOLS = `p.id, p.client_id, p.name, p.type, p.location, p.description, p.status, p.progress, ${D('p.start_date')}, ${D('p.target_date')}, p.updated_at`;
export const projectsOf = (cid: number) => q(`SELECT ${PCOLS} FROM projects p WHERE p.client_id = $1 ORDER BY p.created_at`, [cid]);
export const allProjects = () => q(`SELECT ${PCOLS}, u.name AS client_name FROM projects p JOIN users u ON u.id = p.client_id ORDER BY p.created_at DESC`);
export const project = (id: number) => one(`SELECT ${PCOLS}, u.name AS client_name, u.email AS client_email FROM projects p JOIN users u ON u.id = p.client_id WHERE p.id = $1`, [id]);
export const milestones = (pid: number) => q(`SELECT id, title, status, sort, ${D('due_date')}, ${D('completed_at')} FROM milestones WHERE project_id = $1 ORDER BY sort, id`, [pid]);
export const updates = (pid: number) => q('SELECT id, title, body, created_at FROM updates WHERE project_id = $1 ORDER BY created_at DESC', [pid]);
export const installments = (pid: number) => q(`SELECT id, project_id, no, amount_kurus, note, ${D('due_date')}, ${D('paid_at')} FROM installments WHERE project_id = $1 ORDER BY no`, [pid]);
export const installmentsOfClient = (cid: number) => q(`SELECT i.id, i.project_id, i.no, i.amount_kurus, i.note, ${D('i.due_date', 'due_date')}, ${D('i.paid_at', 'paid_at')}, p.name AS project_name
  FROM installments i JOIN projects p ON p.id = i.project_id WHERE p.client_id = $1 ORDER BY i.due_date`, [cid]);
export const allInstallments = () => q(`SELECT i.id, i.project_id, i.no, i.amount_kurus, i.note, ${D('i.due_date', 'due_date')}, ${D('i.paid_at', 'paid_at')}, p.name AS project_name, u.name AS client_name
  FROM installments i JOIN projects p ON p.id = i.project_id JOIN users u ON u.id = p.client_id ORDER BY (i.paid_at IS NOT NULL), i.due_date`);
export type Pay = 'odendi' | 'gecikti' | 'yaklasiyor' | 'bekliyor';
export function payState(i: any): Pay { if (i.paid_at) return 'odendi'; const t = todayISO(); if (i.due_date < t) return 'gecikti'; return (Date.parse(i.due_date) - Date.parse(t)) / 864e5 <= 15 ? 'yaklasiyor' : 'bekliyor'; }
export const PAY: Record<Pay, string> = { odendi: 'Ödendi', gecikti: 'Gecikmiş', yaklasiyor: 'Yaklaşıyor', bekliyor: 'Bekliyor' };
export function summary(list: any[]) {
  const t = todayISO(); let total = 0, paid = 0, od = 0, odA = 0, next: any = null;
  for (const i of list) { const a = Number(i.amount_kurus); total += a; if (i.paid_at) paid += a; else { if (i.due_date < t) { od++; odA += a; } if (!next || i.due_date < next.due_date) next = i; } }
  return { total, paid, rem: total - paid, od, odA, next };
}
export async function clientCounts(cid: number) {
  const r = await one(`SELECT
    (SELECT count(*) FROM contracts WHERE client_id = $1 AND status = 'gonderildi')::int AS sign,
    (SELECT count(*) FROM doc_requests WHERE client_id = $1 AND status IN ('bekliyor','reddedildi'))::int AS docs,
    (SELECT count(*) FROM messages WHERE client_id = $1 AND sender = 'admin' AND read_at IS NULL)::int AS msgs`, [cid]);
  return r || { sign: 0, docs: 0, msgs: 0 };
}
export async function adminCounts() {
  const r = await one(`SELECT
    (SELECT count(*) FROM messages WHERE sender = 'client' AND read_at IS NULL)::int AS msgs,
    (SELECT count(*) FROM contracts WHERE status IN ('imzalandi','revizyon'))::int AS contracts,
    (SELECT count(*) FROM doc_requests WHERE status = 'yuklendi')::int AS docs,
    (SELECT count(*) FROM quotes WHERE status = 'yeni')::int AS quotes,
    (SELECT count(*) FROM leads WHERE status IN ('gonderildi','inceleniyor'))::int AS leads,
    (SELECT count(*) FROM certificates WHERE status = 'inceleniyor')::int AS certs`);
  return r || { msgs: 0, contracts: 0, docs: 0, quotes: 0, leads: 0, certs: 0 };
}
export async function autoreplySettings() {
  const r = await one<{ value: any }>(`SELECT value FROM settings WHERE key = 'autoreply'`);
  return r?.value || { enabled: true, welcome: true, inHours: 'Merhaba {ad}, mesajınız proje ekibimize ulaştı. Kısa süre içinde size dönüş yapacağız.', offHours: 'Merhaba {ad}, mesajınız proje ekibimize ulaştı. İlk iş gününde saat 09:00’dan itibaren size dönüş yapacağız.' };
}
export const docFiles = (rid: number) => q(`SELECT f.id, f.name, f.size, f.mime, f.created_at FROM doc_files d JOIN files f ON f.id = d.file_id WHERE d.request_id = $1 ORDER BY f.created_at`, [rid]);
