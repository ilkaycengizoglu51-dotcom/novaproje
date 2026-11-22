import type { ReactNode } from 'react';
import { CST, DST, MS, STATUS, WST, date, money } from '@/lib/format';
import { PAY, payState, summary } from '@/lib/data';

const IC: Record<string, ReactNode> = {
  home: <path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />,
  folder: <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />,
  pay: <><rect x="3" y="6" width="18" height="12" rx="2" /><path d="M3 10h18M7 15h4" /></>,
  users: <><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6 6 0 0 1 3.5 6" /></>,
  key: <><circle cx="8" cy="15" r="4" /><path d="M11 12l9-9M17 6l3 3M14 9l2 2" /></>,
  list: <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />,
  site: <path d="M10 14L21 3M15 3h6v6M19 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5" />,
  file: <><path d="M7 3h7l5 5v13H7z" /><path d="M14 3v5h5M10 13h6M10 17h6" /></>,
  up: <><path d="M12 16V4M7 9l5-5 5 5" /><path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" /></>,
  sign: <><path d="M3 17c3-4 5-9 7-9 3 0-2 9 1 9 2 0 3-3 5-3s1 3 3 3" /><path d="M3 21h18" /></>,
  chat: <><path d="M4 5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H9l-5 4V6a1 1 0 0 1 1-1z" /><path d="M8 10h8M8 13h5" /></>,
  star: <path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" />,
  bolt: <path d="M13 3L5 13h6l-1 8 8-10h-6z" />,
  map: <><path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2z" /><path d="M9 4v14M15 6v14" /></>,
  play: <><circle cx="12" cy="12" r="9" /><path d="M10 8.5v7l6-3.5z" /></>,
  inbox: <><path d="M3 13l3-8h12l3 8v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z" /><path d="M3 13h5l1 3h6l1-3h5" /></>,
};
export const Icon = ({ n }: { n: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{IC[n]}</svg>
);
export const Badge = ({ s }: { s: string }) => <span className={`badge ${s}`}>{STATUS[s] || s}</span>;
export const CPill = ({ s, signed }: { s: string; signed?: string }) => <span className={`pill c-${s}`}>{s === 'imzalandi' && signed ? signed : CST[s]}</span>;
export const WPill = ({ s }: { s: string }) => <span className={`pill w-${s}`}>{WST[s] || s}</span>;
export const DPill = ({ s }: { s: string }) => <span className={`pill d-${s}`}>{DST[s]}</span>;
export function Prog({ v, label = 'Genel ilerleme' }: { v: number; label?: string }) {
  return (
    <div className="prog">
      <div className="prog-head"><span>{label}</span><b>%{v}</b></div>
      <div className="prog-track" role="progressbar" aria-valuenow={v} aria-valuemin={0} aria-valuemax={100} aria-label={label}><span style={{ width: `${v}%` }} /></div>
    </div>
  );
}
export function Kpis({ list }: { list: any[] }) {
  const s = summary(list);
  return (
    <dl className="kpis">
      <div className="kpi dark"><dt>Sözleşme toplamı</dt><dd>{money(s.total)}</dd></div>
      <div className="kpi"><dt>Ödenen</dt><dd>{money(s.paid)}</dd></div>
      <div className="kpi"><dt>Kalan</dt><dd>{money(s.rem)}</dd></div>
      <div className={`kpi ${s.od ? 'alert-k' : ''}`}><dt>{s.od ? 'Gecikmiş ödeme' : 'Sıradaki taksit'}</dt><dd>{s.od ? money(s.odA) : s.next ? money(s.next.amount_kurus) : '—'}</dd><small>{s.od ? `${s.od} taksitin vadesi geçti` : s.next ? date(s.next.due_date) : 'Kalan taksit yok'}</small></div>
    </dl>
  );
}
export function Milestones({ items }: { items: any[] }) {
  if (!items.length) return <p className="muted">Bu proje için iş programı henüz paylaşılmadı.</p>;
  return (
    <ol className="ms">
      {items.map((m) => (
        <li key={m.id} className={m.status}><span className="dot" aria-hidden="true" /><div><b>{m.title}</b><p>{MS[m.status]}{m.status === 'tamam' && m.completed_at ? ' · ' + date(m.completed_at) : m.due_date ? ' · Hedef: ' + date(m.due_date) : ''}</p></div></li>
      ))}
    </ol>
  );
}
export function Updates({ items }: { items: any[] }) {
  if (!items.length) return <p className="muted">Henüz paylaşılan bir güncelleme yok.</p>;
  return <ul className="upd">{items.map((u) => <li key={u.id}><time>{date(new Date(u.created_at).toISOString())}</time><b>{u.title}</b><p>{u.body}</p></li>)}</ul>;
}
export function PayTable({ list, showProject, actions, linkBase }: { list: any[]; showProject?: boolean; actions?: (i: any) => ReactNode; linkBase?: string }) {
  if (!list.length) return <p className="muted">Ödeme planı henüz girilmedi.</p>;
  return (
    <div className="tw"><table className="tb"><thead><tr>{showProject && <th scope="col">Proje</th>}<th scope="col">Taksit</th><th scope="col">Vade</th><th scope="col" className="num">Tutar</th><th scope="col">Durum</th>{actions && <th scope="col"><span className="sr">İşlemler</span></th>}</tr></thead>
      <tbody>{list.map((i) => { const st = payState(i); return (
        <tr key={i.id} className={st}>
          {showProject && <td>{linkBase ? <a href={`${linkBase}${i.project_id}`}>{i.project_name}</a> : i.project_name}{i.client_name && <small>{i.client_name}</small>}</td>}
          <td>{i.no}. taksit{i.note && <small>{i.note}</small>}</td><td>{date(i.due_date)}</td><td className="num">{money(i.amount_kurus)}</td>
          <td><span className={`pay ${st}`}>{PAY[st]}</span>{i.paid_at && <small>{date(i.paid_at)}</small>}</td>
          {actions && <td><div className="acts">{actions(i)}</div></td>}
        </tr>); })}</tbody></table></div>
  );
}
export const Alert = ({ t = 'ok', children }: { t?: 'ok' | 'err' | 'info'; children: ReactNode }) => <div className={`alert ${t}`} role={t === 'err' ? 'alert' : 'status'}>{children}</div>;
export function Logo() {
  return <span className="logo"><img className="logo-mark" src="/img/revmark.webp" alt="" /><span className="logo-words"><img className="logo-word" src="/img/revword.webp" alt="NOVAPROJE" /><small>Tarımsal Mühendislik</small></span></span>;
}
