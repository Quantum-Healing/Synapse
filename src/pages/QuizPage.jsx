import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { X, CheckCircle, XCircle, Trophy, RotateCcw, BookOpen } from 'lucide-react';
import { useApp } from '../context/AppContext';

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildQuestion(cards, currentCard) {
  // Build 4 answer options: 1 correct + 3 random wrong
  const wrong = shuffle(cards.filter((c) => c.id !== currentCard.id)).slice(0, 3);
  const options = shuffle([...wrong.map((c) => c.back), currentCard.back]);
  return { question: currentCard.front, correct: currentCard.back, options };
}

export default function QuizPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { decks, recordQuizResult } = useApp();
  const deck = decks.find((d) => d.id === id);

  const [questions, setQuestions] = useState([]);
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [results, setResults] = useState([]);
  const [done, setDone] = useState(false);

  const initQuiz = useCallback(() => {
    if (!deck || deck.cards.length < 2) return;
    const shuffled = shuffle(deck.cards);
    setQuestions(shuffled.map((card) => buildQuestion(deck.cards, card)));
    setQIndex(0);
    setSelected(null);
    setResults([]);
    setDone(false);
  }, [deck]);

  useEffect(() => { initQuiz(); }, [initQuiz]);

  if (!deck) return <div className="p-8 text-slate-500">Deck not found.</div>;
  if (deck.cards.length < 2) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-500 mb-4">Need at least 2 cards to take a quiz.</p>
          <button onClick={() => navigate(`/flashcards/${id}`)} className="px-4 py-2 bg-primary-600 text-white rounded-xl">
            Back to Deck
          </button>
        </div>
      </div>
    );
  }

  const q = questions[qIndex];
  const score = results.filter(Boolean).length;
  const progress = ((qIndex) / questions.length) * 100;

  const handleSelect = (option) => {
    if (selected !== null) return;
    setSelected(option);
    const correct = option === q.correct;
    const newResults = [...results, correct];

    setTimeout(() => {
      if (qIndex + 1 >= questions.length) {
        recordQuizResult(id, newResults.filter(Boolean).length, questions.length);
        setResults(newResults);
        setDone(true);
      } else {
        setResults(newResults);
        setQIndex((i) => i + 1);
        setSelected(null);
      }
    }, 1000);
  };

  const pct = Math.round((score / questions.length) * 100);
  const grade = pct >= 90 ? 'Excellent!' : pct >= 70 ? 'Good job!' : pct >= 50 ? 'Keep practicing!' : 'Keep studying!';

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-primary-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur border-b border-slate-100">
        <button
          onClick={() => navigate(`/flashcards/${id}`)}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-all"
        >
          <X size={18} />
          <span>Exit Quiz</span>
        </button>
        <div className="text-center">
          <p className="font-semibold text-slate-800 text-sm">{deck.title} — Quiz</p>
          {!done && <p className="text-xs text-slate-400">{qIndex + 1} / {questions.length}</p>}
        </div>
        <div className="text-sm font-semibold text-emerald-600">
          {results.filter(Boolean).length} / {results.length}
        </div>
      </div>

      {/* Progress */}
      <div className="h-1 bg-slate-100">
        <div
          className="h-full bg-emerald-500 transition-all duration-500"
          style={{ width: done ? '100%' : `${progress}%` }}
        />
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        {done ? (
          /* Results screen */
          <div className="w-full max-w-md animate-bounce-in">
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
              <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-5">
                <Trophy size={40} className="text-amber-500" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-1">{grade}</h2>
              <p className="text-slate-400 mb-6 text-sm">You scored {score} out of {questions.length}</p>

              {/* Big score */}
              <div
                className={`text-6xl font-black mb-8 ${pct >= 70 ? 'text-emerald-500' : pct >= 50 ? 'text-amber-500' : 'text-red-400'}`}
              >
                {pct}%
              </div>

              {/* Per-question review */}
              <div className="text-left space-y-2 mb-8 max-h-48 overflow-y-auto">
                {questions.map((qs, i) => (
                  <div key={i} className={`flex items-start gap-2 p-2 rounded-lg text-sm ${results[i] ? 'bg-emerald-50' : 'bg-red-50'}`}>
                    {results[i]
                      ? <CheckCircle size={15} className="text-emerald-500 mt-0.5 shrink-0" />
                      : <XCircle size={15} className="text-red-400 mt-0.5 shrink-0" />}
                    <span className="text-slate-600 line-clamp-2">{qs.question}</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={initQuiz}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  <RotateCcw size={14} /> Retry
                </button>
                <button
                  onClick={() => navigate(`/flashcards/${id}/study`)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-medium hover:bg-primary-700"
                >
                  <BookOpen size={14} /> Study
                </button>
              </div>
            </div>
          </div>
        ) : q ? (
          /* Question screen */
          <div className="w-full max-w-lg animate-fade-in">
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-5">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Question {qIndex + 1}</p>
              <p className="text-xl font-semibold text-slate-800 leading-snug">{q.question}</p>
            </div>

            <div className="space-y-3">
              {q.options.map((option) => {
                let cls = 'bg-white border-2 border-slate-100 text-slate-700 hover:border-primary-300 hover:bg-primary-50';
                if (selected !== null) {
                  if (option === q.correct) cls = 'bg-emerald-50 border-2 border-emerald-400 text-emerald-800';
                  else if (option === selected) cls = 'bg-red-50 border-2 border-red-400 text-red-700';
                  else cls = 'bg-white border-2 border-slate-100 text-slate-400 opacity-60';
                }

                return (
                  <button
                    key={option}
                    onClick={() => handleSelect(option)}
                    className={`w-full text-left px-5 py-3.5 rounded-xl text-sm font-medium transition-all ${cls}`}
                  >
                    <div className="flex items-center gap-3">
                      {selected !== null && option === q.correct && (
                        <CheckCircle size={16} className="text-emerald-500 shrink-0" />
                      )}
                      {selected !== null && option === selected && option !== q.correct && (
                        <XCircle size={16} className="text-red-400 shrink-0" />
                      )}
                      {option}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
