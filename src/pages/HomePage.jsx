import { useNavigate } from 'react-router-dom';
import { BookOpen, StickyNote, Layers, Trophy, Plus, ArrowRight, Play } from 'lucide-react';
import { useApp } from '../context/AppContext';

function StatCard({ icon: Icon, label, value, color, bg }) {
  return (
    <div className={`${bg} rounded-2xl p-5`}>
      <div className={`${color} mb-3`}><Icon size={20} /></div>
      <p className="text-3xl font-black text-slate-800">{value}</p>
      <p className="text-sm text-slate-500 mt-0.5">{label}</p>
    </div>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const { decks, notes, studyProgress } = useApp();

  const totalCards = decks.reduce((sum, d) => sum + d.cards.length, 0);
  const quizzedDecks = Object.values(studyProgress);
  const avgScore = quizzedDecks.length
    ? Math.round(quizzedDecks.reduce((s, p) => s + (p.bestScore / p.lastTotal) * 100, 0) / quizzedDecks.length)
    : null;

  const recentDecks = [...decks]
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 4);

  const recentNotes = [...notes]
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 5);

  return (
    <div className="flex-1 p-8 max-w-5xl">
      {/* Hero */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-800 mb-1">Welcome back!</h1>
        <p className="text-slate-400">Here's an overview of your study materials.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard icon={BookOpen} label="Flashcard Decks" value={decks.length} color="text-primary-600" bg="bg-primary-50" />
        <StatCard icon={Layers} label="Total Cards" value={totalCards} color="text-purple-600" bg="bg-purple-50" />
        <StatCard icon={StickyNote} label="Notes" value={notes.length} color="text-amber-600" bg="bg-amber-50" />
        <StatCard
          icon={Trophy}
          label="Avg Quiz Score"
          value={avgScore !== null ? `${avgScore}%` : '—'}
          color="text-emerald-600"
          bg="bg-emerald-50"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Decks */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-800">Recent Decks</h2>
            <button
              onClick={() => navigate('/flashcards')}
              className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1"
            >
              View all <ArrowRight size={12} />
            </button>
          </div>

          {recentDecks.length === 0 ? (
            <div className="bg-white rounded-2xl border-2 border-dashed border-slate-100 p-8 text-center">
              <BookOpen size={24} className="text-slate-200 mx-auto mb-2" />
              <p className="text-slate-400 text-sm mb-4">No decks yet</p>
              <button
                onClick={() => navigate('/flashcards')}
                className="text-xs text-primary-600 font-medium hover:text-primary-700"
              >
                Create your first deck →
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {recentDecks.map((deck) => {
                const progress = studyProgress[deck.id];
                return (
                  <div
                    key={deck.id}
                    onClick={() => navigate(`/flashcards/${deck.id}`)}
                    className="group flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-100 hover:border-primary-200 hover:shadow-sm transition-all cursor-pointer"
                  >
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: deck.color ?? '#6366f1' }}
                    >
                      <BookOpen size={15} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-700 truncate group-hover:text-primary-700">
                        {deck.title}
                      </p>
                      <p className="text-xs text-slate-400">{deck.cards.length} cards</p>
                    </div>
                    {progress && (
                      <span className="text-xs font-bold text-emerald-600">
                        {Math.round((progress.bestScore / progress.lastTotal) * 100)}%
                      </span>
                    )}
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/flashcards/${deck.id}/study`); }}
                        className="p-1.5 rounded-lg bg-primary-50 text-primary-600 hover:bg-primary-100"
                        title="Study"
                      >
                        <BookOpen size={12} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/flashcards/${deck.id}/quiz`); }}
                        className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                        title="Quiz"
                      >
                        <Play size={12} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Notes */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-800">Recent Notes</h2>
            <button
              onClick={() => navigate('/notes')}
              className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1"
            >
              View all <ArrowRight size={12} />
            </button>
          </div>

          {recentNotes.length === 0 ? (
            <div className="bg-white rounded-2xl border-2 border-dashed border-slate-100 p-8 text-center">
              <StickyNote size={24} className="text-slate-200 mx-auto mb-2" />
              <p className="text-slate-400 text-sm mb-4">No notes yet</p>
              <button
                onClick={() => navigate('/notes')}
                className="text-xs text-primary-600 font-medium hover:text-primary-700"
              >
                Write your first note →
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {recentNotes.map((note) => {
                const tmp = document.createElement('div');
                tmp.innerHTML = note.content;
                const preview = (tmp.textContent || '').slice(0, 60);
                return (
                  <div
                    key={note.id}
                    onClick={() => navigate(`/notes?note=${note.id}`)}
                    className="group flex items-start gap-3 p-4 bg-white rounded-xl border border-slate-100 hover:border-amber-200 hover:shadow-sm transition-all cursor-pointer"
                  >
                    {note.color && (
                      <div className="w-1 h-full rounded-full self-stretch shrink-0" style={{ background: note.color }} />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-700 truncate group-hover:text-amber-600">
                        {note.title || 'Untitled Note'}
                      </p>
                      {preview && <p className="text-xs text-slate-400 truncate">{preview}</p>}
                    </div>
                    <span className="text-xs text-slate-300 shrink-0">
                      {new Date(note.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="mt-10 flex gap-3">
        <button
          onClick={() => navigate('/flashcards')}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-all shadow-sm"
        >
          <Plus size={15} /> New Deck
        </button>
        <button
          onClick={() => navigate('/notes')}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-all"
        >
          <Plus size={15} /> New Note
        </button>
      </div>
    </div>
  );
}
