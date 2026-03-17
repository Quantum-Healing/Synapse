import { useState } from 'react';
import { Plus, BookOpen } from 'lucide-react';
import { useApp } from '../context/AppContext';
import DeckCard from '../components/flashcards/DeckCard';
import CreateDeckModal from '../components/flashcards/CreateDeckModal';
import EmptyState from '../components/shared/EmptyState';

export default function FlashcardsPage() {
  const { decks, createDeck } = useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = decks.filter(
    (d) => d.title.toLowerCase().includes(search.toLowerCase()) ||
           d.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 p-8">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Flashcards</h1>
          <p className="text-slate-400 text-sm mt-0.5">{decks.length} deck{decks.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-all shadow-sm"
        >
          <Plus size={16} /> New Deck
        </button>
      </div>

      {/* Search */}
      {decks.length > 0 && (
        <div className="mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search decks..."
            className="w-full max-w-xs px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
          />
        </div>
      )}

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((deck) => (
            <DeckCard key={deck.id} deck={deck} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={BookOpen}
          title={search ? 'No decks found' : 'No decks yet'}
          description={search ? 'Try a different search term.' : 'Create your first flashcard deck to start studying.'}
          action={
            !search && (
              <button
                onClick={() => setModalOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-all"
              >
                <Plus size={15} /> Create First Deck
              </button>
            )
          }
        />
      )}

      <CreateDeckModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={(data) => createDeck(data)}
      />
    </div>
  );
}
