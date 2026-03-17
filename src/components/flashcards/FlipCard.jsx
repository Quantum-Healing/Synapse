import { useState } from 'react';
import { RotateCcw } from 'lucide-react';

export default function FlipCard({ front, back, hint = 'Click to flip' }) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      className="perspective w-full h-full cursor-pointer select-none"
      onClick={() => setFlipped(!flipped)}
    >
      <div className={`card-inner w-full h-full ${flipped ? 'flipped' : ''}`}>
        {/* Front */}
        <div className="card-front bg-white border-2 border-primary-100 shadow-xl p-10 flex-col gap-4">
          <span className="text-xs font-semibold uppercase tracking-widest text-primary-400 mb-2">Front</span>
          <p className="text-2xl font-semibold text-slate-800 text-center leading-snug">{front}</p>
          <div className="absolute bottom-5 right-5 flex items-center gap-1.5 text-slate-300 text-xs">
            <RotateCcw size={12} />
            <span>{hint}</span>
          </div>
        </div>

        {/* Back */}
        <div className="card-back bg-primary-600 shadow-xl p-10 flex-col gap-4">
          <span className="text-xs font-semibold uppercase tracking-widest text-primary-200 mb-2">Back</span>
          <p className="text-2xl font-semibold text-white text-center leading-snug">{back}</p>
          <div className="absolute bottom-5 right-5 flex items-center gap-1.5 text-primary-300 text-xs">
            <RotateCcw size={12} />
            <span>Click to flip back</span>
          </div>
        </div>
      </div>
    </div>
  );
}
