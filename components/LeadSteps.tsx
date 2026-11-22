import { LST, dt } from '@/lib/format';
export function LeadPill({ s }: { s: string }) { const m: Record<string, string> = { gonderildi: 'c-gonderildi', inceleniyor: 'c-imzalandi', eksik: 'c-revizyon', onaylandi: 'c-tamamlandi', reddedildi: 'c-iptal' }; return <span className={`pill ${m[s]}`}>{LST[s]}</span>; }
export function LeadSteps({ status }: { status: string }) {
  const lbl = ['Ön kayıt gönderildi', status === 'eksik' ? 'Eksik bilgi istendi' : 'Yönetici incelemesi', status === 'reddedildi' ? 'Onaylanmadı' : 'Onay · danışan hesabı'];
  const k = status === 'onaylandi' ? 3 : status === 'reddedildi' ? 2 : status === 'gonderildi' ? 1 : 1;
  return <ol className="cstep lead-steps">{lbl.map((l, i) => <li key={l} className={(i < k ? 'done' : i === k ? 'now' : '') + (i === 1 && status === 'eksik' ? ' warn' : '') + (i === 2 && status === 'reddedildi' ? ' no' : '')}><span>{i < k ? '✓' : i + 1}</span>{l}</li>)}</ol>;
}
export const Timeline = ({ ev }: { ev: any[] }) => <ul className="log">{ev.map((e, i) => <li key={i}><time>{dt(e.at)}</time><span><b>{e.who}</b> · {e.what}</span></li>)}</ul>;
