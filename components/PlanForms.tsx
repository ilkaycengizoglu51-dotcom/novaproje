'use client';
import { useFormState } from 'react-dom';
import { addInstallment, generatePlan, type PlanState } from '@/app/actions/admin';
import { Submit } from './client-bits';
export default function PlanForms({ pid }: { pid: number }) {
  const [a, addA] = useFormState<PlanState, FormData>(addInstallment, {}), [b, planA] = useFormState<PlanState, FormData>(generatePlan, {});
  return (
    <div className="two">
      <form className="af" action={planA} noValidate><h3 className="wide" style={{ fontSize: 15 }}>Taksit planı oluştur</h3><input type="hidden" name="project" value={pid} />
        <div className="field"><label htmlFor="pl-t">Toplam tutar (TL)</label><input id="pl-t" name="total" inputMode="decimal" placeholder="200.000" /></div>
        <div className="field"><label htmlFor="pl-c">Taksit sayısı</label><input id="pl-c" name="count" type="number" min={1} max={120} defaultValue={12} /></div>
        <div className="field"><label htmlFor="pl-f">İlk vade</label><input id="pl-f" name="first" type="date" /></div>
        <div className="field"><label htmlFor="pl-e">Aralık</label><select id="pl-e" name="every" defaultValue="1"><option value="1">Her ay</option><option value="2">İki ayda bir</option><option value="3">Üç ayda bir</option><option value="6">Altı ayda bir</option></select></div>
        <label className="chk wide"><input type="checkbox" name="replace" /> Ödenmemiş mevcut taksitleri sil</label>
        {b.error && <div className="alert err wide" role="alert">{b.error}</div>}{b.ok && <div className="alert ok wide" role="status">{b.ok}</div>}
        <div className="wide"><Submit className="btn btn-ink btn-sm" pending="Oluşturuluyor">Planı oluştur</Submit></div></form>
      <form className="af" action={addA} noValidate><h3 className="wide" style={{ fontSize: 15 }}>Tek taksit ekle</h3><input type="hidden" name="project" value={pid} />
        <div className="field"><label htmlFor="in-a">Tutar (TL)</label><input id="in-a" name="amount" inputMode="decimal" /></div>
        <div className="field"><label htmlFor="in-d">Vade</label><input id="in-d" name="due" type="date" /></div>
        <div className="field wide"><label htmlFor="in-n">Not <span className="opt">(isteğe bağlı)</span></label><input id="in-n" name="note" placeholder="Örn. peşinat, dekont no" /></div>
        {a.error && <div className="alert err wide" role="alert">{a.error}</div>}{a.ok && <div className="alert ok wide" role="status">{a.ok}</div>}
        <div className="wide"><Submit className="btn btn-ghost2 btn-sm" pending="Ekleniyor">Taksiti ekle</Submit></div></form>
    </div>
  );
}
