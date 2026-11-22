'use client';
import { useEffect, useRef, useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import { uploadDocs, type UpState } from '@/app/actions/client';

function Zone({ id }: { id: number }) {
  const { pending } = useFormStatus(); const inp = useRef<HTMLInputElement>(null); const [over, setOver] = useState(false);
  return (
    <label className={`drop ${over ? 'over' : ''} ${pending ? 'busy' : ''}`} onDragOver={(e) => { e.preventDefault(); setOver(true); }} onDragLeave={() => setOver(false)}
      onDrop={(e) => { e.preventDefault(); setOver(false); if (inp.current && e.dataTransfer.files.length) { inp.current.files = e.dataTransfer.files; inp.current.form?.requestSubmit(); } }}>
      <input ref={inp} type="file" className="sr" name="files" multiple accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp" onChange={(e) => e.currentTarget.files?.length && e.currentTarget.form?.requestSubmit()} />
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true"><path d="M12 16V4M7 9l5-5 5 5" /><path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" /></svg>
      <span>{pending ? 'Yükleniyor…' : <><b>Dosya seçin</b> veya buraya sürükleyin</>}</span>
      <input type="hidden" name="request" value={id} />
    </label>
  );
}
export default function UploadZone({ id }: { id: number }) {
  const [st, action] = useFormState<UpState, FormData>(uploadDocs, {}); const router = useRouter();
  useEffect(() => { if (st.t) router.refresh(); }, [st.t, router]);
  return (<form action={action}><Zone id={id} />{st.error && <div className="alert err" role="alert" style={{ marginTop: 10 }}>{st.error}</div>}{st.ok && !st.error && <div className="alert ok" role="status" style={{ marginTop: 10 }}>{st.ok}</div>}</form>);
}
