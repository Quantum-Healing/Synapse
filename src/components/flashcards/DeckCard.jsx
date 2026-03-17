import { useNavigate } from 'react-router-dom';
import { BookOpen, Play, Trophy, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#14b8a6'];

export default function DeckCard({ deck }) {
  const navigate = useNavigate();
  const { deleteDeck, studyProgress } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const progress = studyProgress[deck.id];

  useEffect(() => {
    const handler = (e) => { if (!menuRef.current?.contains(e.target)) setMenuOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const color = deck.color || COLORS[0];

  return (
    <div className="group bg-white rounded-2xl border border-slate-100 hover:border-primary-200 hover:shadow-lg transition-all duration-200 overflow-hidden cursor-pointer">
      {/* Color bar */}
      <div
        className="h-2"
        style={{ background: color }}
      />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div
            className="flex-1 min-w-0"
            onClick={() => navigate(`/flashcards/${deck.id}`)}
          >
            <h3 className="font-semibold text-slate-800 text-base truncate group-hover:text-primary-700 transition-colors">
              {deck.title}
            </h3>
            {deck.description && (
              <p className="text-slate-400 text-xs mt-0.5 truncate">{deck.description}</p>
            )}
          </div>

          {/* Menu */}
          <div className="relative ml-2" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1 rounded-lg text-slate-300 hover:text-slate-500 hover:bg-slate-50 opacity-0 group-hover:opacity-100 transition-all"
            >
              <MoreVertical size={16} />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-8 bg-white border border-slate-100 rounded-xl shadow-xl z-20 py-1 w-36">
                <button
                  onClick={() => { setMenuOpen(false); navigate(`/flashcards/${deck.id}`); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
                >
                  <Edit2 size={14} /> Edit
                </button>
                <button
                  onClick={() => { setMenuOpen(false); deleteDeck(deck.id); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-500 hover:bg-red-50"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3 text-xs text-slate-400 mb-4">
          <span className="flex items-center gap-1">
            <BookOpen size={12} />
            {deck.cards.length} card{deck.cards.length !== 1 ? 's' : ''}
          </span>
          {progress && (
            <span className="flex items-center gap-1 text-amber-500">
              <Trophy size={12} />
              Best: {Math.round((progress.bestScore / progress.lastTotal) * 100)}%
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/flashcards/${deck.id}/study`)}
            disabled={deck.cards.length === 0}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-primary-50 text-primary-700 hover:bg-primary-100 text-xs font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <BookOpen size={13} /> Study
          </button>
          <button
            onClick={() => navigate(`/flashcards/${deck.id}/quiz`)}
            disabled={deck.cards.length < 2}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Play size={13} /> Quiz
          </button>
        </div>
      </div>
    </div>
  );
}
