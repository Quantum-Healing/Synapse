import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, RotateCcw, Shuffle, X, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import FlipCard from '../components/flashcards/FlipCard';

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function StudyPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { decks } = useApp();
  const deck = decks.find((d) => d.id === id);

  const [cards, setCards] = useState(() => deck?.cards ?? []);
  const [index, setIndex] = useState(0);
  const [isShuffled, setIsShuffled] = useState(false);
  const [completed, setCompleted] = useState(false);

  const go = useCallback((dir) => {
    setIndex((prev) => {
      const next = prev + dir;
      if (next < 0) return prev;
      if (next >= cards.length) { setCompleted(true); return prev; }
      return next;
    });
  }, [cards.length]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
      if (e.key === 'Escape') navigate(`/flashcards/${id}`);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [go, navigate, id]);

  const toggleShuffle = () => {
    if (isShuffled) {
      setCards(deck.cards);
    } else {
      setCards(shuffle(deck.cards));
    }
    setIsShuffled(!isShuffled);
    setIndex(0);
    setCompleted(false);
  };

  const restart = () => {
    setIndex(0);
    setCompleted(false);
  };

  if (!deck) return <div className="p-8 text-slate-500">Deck not found.</div>;
  if (deck.cards.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-500 mb-4">This deck has no cards yet.</p>
          <button onClick={() => navigate(`/flashcards/${id}`)} className="btn-primary">
            Back to Deck
          </button>
        </div>
      </div>
    );
  }

  const card = cards[index];
  const progress = ((index + 1) / cards.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-purple-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur border-b border-slate-100">
        <button
          onClick={() => navigate(`/flashcards/${id}`)}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-all"
        >
          <X size={18} />
          <span>Exit Study</span>
        </button>
        <div className="text-center">
          <p className="font-semibold text-slate-800 text-sm">{deck.title}</p>
          <p className="text-xs text-slate-400">{index + 1} / {cards.length}</p>
        </div>
        <button
          onClick={toggleShuffle}
          className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all ${
            isShuffled ? 'bg-primary-50 border-primary-200 text-primary-700' : 'border-slate-200 text-slate-500 hover:border-slate-300'
          }`}
        >
          <Shuffle size={13} /> Shuffle
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-slate-100">
        <div
          className="h-full bg-primary-500 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Card area */}
      <div className="flex-1 flex items-center justify-center p-8">
        {completed ? (
          <div className="text-center animate-bounce-in">
            <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={40} className="text-emerald-500" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">All done!</h2>
            <p className="text-slate-400 mb-8">You've gone through all {cards.length} cards.</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={restart}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-all"
              >
                <RotateCcw size={16} /> Study Again
              </button>
              <button
                onClick={() => navigate(`/flashcards/${id}/quiz`)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-600 text-white font-medium hover:bg-primary-700 transition-all"
              >
                Take Quiz
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-2xl">
            <div className="h-72 md:h-80">
              <FlipCard key={`${card.id}-${index}`} front={card.front} back={card.back} />
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      {!completed && (
        <div className="flex items-center justify-center gap-6 pb-10">
          <button
            onClick={() => go(-1)}
            disabled={index === 0}
            className="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            <ArrowLeft size={20} />
          </button>
          <span className="text-sm text-slate-400 font-medium">Space or click card to flip</span>
          <button
            onClick={() => go(1)}
            className="w-12 h-12 rounded-full bg-primary-600 flex items-center justify-center text-white hover:bg-primary-700 transition-all shadow-md"
          >
            <ArrowRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
}
