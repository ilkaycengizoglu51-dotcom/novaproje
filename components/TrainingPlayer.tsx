'use client';
import { useRef, useState } from 'react';
import { videoWatched } from '@/app/actions/training';
export default function TrainingPlayer({ k, src, poster, track, watched }: { k: string; src: string; poster: string; track: boolean; watched: boolean }) {
  const [done, setDone] = useState(watched), sent = useRef(false);
  return (
    <div className="tp">
      <video controls playsInline preload="metadata" poster={poster} src={src}
        onTimeUpdate={(e) => { const v = e.currentTarget; if (track && !sent.current && v.duration && v.currentTime / v.duration > 0.9) { sent.current = true; setDone(true); videoWatched(k); } }} />
      {track && <span className={`tp-badge ${done ? 'on' : ''}`}>{done ? '✓ Video izlendi' : 'Videoyu sonuna kadar izleyin'}</span>}
    </div>
  );
}
