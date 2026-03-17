import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, BookOpen, Edit2, Trophy, Clock, Layers } from 'lucide-react';
import { useApp } from '../context/AppContext';
import CardEditor from '../components/flashcards/CardEditor';
import CreateDeckModal from '../components/flashcards/CreateDeckModal';

export default function DeckDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { decks, updateDeck, studyProgress } = useApp();
  const deck = decks.find((d) => d.id === id);
  const [editOpen, setEditOpen] = useState(false);

  if (!deck) {
    return (
      <div className="flex-1 p-8">
        <p className="text-slate-500">Deck not found.</p>
      </div>
    );
  }

  const progress = studyProgress[id];

  return (
    <div className="flex-1 p-8 max-w-4xl">
      {/* Back */}
      <button
        onClick={() => navigate('/flashcards')}
        className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-600 transition-all mb-6"
      >
        <ArrowLeft size={16} /> All Decks
      </button>

      {/* Deck header */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-start gap-4">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
            style={{ background: deck.color ?? '#6366f1' }}
          >
            <Layers size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{deck.title}</h1>
            {deck.description && <p className="text-slate-400 text-sm mt-0.5">{deck.description}</p>}
          </div>
        </div>
        <button
          onClick={() => setEditOpen(true)}
          className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-500 hover:bg-slate-50 transition-all"
        >
          <Edit2 size={14} /> Edit
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { icon: BookOpen, label: 'Cards', value: deck.cards.length, color: 'primary' },
          { icon: Trophy, label: 'Best Score', value: progress ? `${Math.round((progress.bestScore / progress.lastTotal) * 100)}%` : '—', color: 'amber' },
          { icon: Play, label: 'Attempts', value: progress?.attempts ?? 0, color: 'emerald' },
          { icon: Clock, label: 'Last Studied', value: progress ? new Date(progress.lastStudied).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—', color: 'purple' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="bg-white rounded-xl p-4 border border-slate-100">
            <div className={`text-${color}-500 mb-1`}><Icon size={16} /></div>
            <p className="text-xl font-bold text-slate-800">{value}</p>
            <p className="text-xs text-slate-400">{label}</p>
          </div>
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 mb-8">
        <button
          onClick={() => navigate(`/flashcards/${id}/study`)}
          disabled={deck.cards.length === 0}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-600 text-white font-medium text-sm hover:bg-primary-700 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <BookOpen size={16} /> Study Mode
        </button>
        <button
          onClick={() => navigate(`/flashcards/${id}/quiz`)}
          disabled={deck.cards.length < 2}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 text-white font-medium text-sm hover:bg-emerald-700 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Play size={16} /> Quiz Mode
        </button>
      </div>

      {/* Card editor */}
      <div>
        <h2 className="text-lg font-semibold text-slate-800 mb-4">
          Cards ({deck.cards.length})
        </h2>
        <CardEditor deck={deck} />
      </div>

      <CreateDeckModal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        onSave={(data) => updateDeck(id, data)}
        initial={deck}
      />
    </div>
  );
}
