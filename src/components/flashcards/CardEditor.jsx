import { useState } from 'react';
import { Plus, Trash2, Save, GripVertical } from 'lucide-react';
import { useApp } from '../../context/AppContext';

function CardRow({ card, deckId, onDelete }) {
  const { updateCard } = useApp();
  const [front, setFront] = useState(card.front);
  const [back, setBack] = useState(card.back);
  const [dirty, setDirty] = useState(false);

  const save = () => {
    if (!front.trim() || !back.trim()) return;
    updateCard(deckId, card.id, { front: front.trim(), back: back.trim() });
    setDirty(false);
  };

  return (
    <div className="flex gap-3 items-start p-4 bg-white rounded-xl border border-slate-100 hover:border-primary-200 transition-all group">
      <GripVertical size={16} className="text-slate-200 mt-2.5 shrink-0 group-hover:text-slate-300" />

      <div className="flex-1 grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-slate-400 mb-1 block">Front</label>
          <textarea
            value={front}
            onChange={(e) => { setFront(e.target.value); setDirty(true); }}
            onBlur={save}
            rows={2}
            className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 resize-none"
            placeholder="Question or term..."
          />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-400 mb-1 block">Back</label>
          <textarea
            value={back}
            onChange={(e) => { setBack(e.target.value); setDirty(true); }}
            onBlur={save}
            rows={2}
            className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 resize-none"
            placeholder="Answer or definition..."
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5 shrink-0">
        {dirty && (
          <button
            onClick={save}
            className="p-1.5 rounded-lg bg-primary-50 text-primary-600 hover:bg-primary-100 transition-all"
            title="Save"
          >
            <Save size={14} />
          </button>
        )}
        <button
          onClick={() => onDelete(card.id)}
          className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all"
          title="Delete card"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

export default function CardEditor({ deck }) {
  const { addCard, deleteCard } = useApp();
  const [newFront, setNewFront] = useState('');
  const [newBack, setNewBack] = useState('');

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newFront.trim() || !newBack.trim()) return;
    addCard(deck.id, { front: newFront.trim(), back: newBack.trim() });
    setNewFront('');
    setNewBack('');
  };

  return (
    <div className="space-y-4">
      {/* Existing cards */}
      {deck.cards.length > 0 && (
        <div className="space-y-2">
          {deck.cards.map((card) => (
            <CardRow
              key={card.id}
              card={card}
              deckId={deck.id}
              onDelete={(cardId) => deleteCard(deck.id, cardId)}
            />
          ))}
        </div>
      )}

      {/* Add new card */}
      <form onSubmit={handleAdd} className="p-4 bg-primary-50 rounded-xl border-2 border-dashed border-primary-200">
        <p className="text-xs font-semibold text-primary-600 mb-3 uppercase tracking-wide">Add New Card</p>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">Front</label>
            <textarea
              value={newFront}
              onChange={(e) => setNewFront(e.target.value)}
              rows={2}
              className="w-full text-sm px-3 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 resize-none bg-white"
              placeholder="Question or term..."
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">Back</label>
            <textarea
              value={newBack}
              onChange={(e) => setNewBack(e.target.value)}
              rows={2}
              className="w-full text-sm px-3 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 resize-none bg-white"
              placeholder="Answer or definition..."
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={!newFront.trim() || !newBack.trim()}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus size={14} /> Add Card
        </button>
      </form>
    </div>
  );
}
