import { createContext, useContext } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

const AppContext = createContext(null);

const SAMPLE_DECK = {
  id: 'sample-deck-1',
  title: 'Biology Basics',
  description: 'Fundamental biology concepts',
  color: '#6366f1',
  cards: [
    { id: 'c1', front: 'What is photosynthesis?', back: 'The process by which plants convert sunlight, water, and CO₂ into glucose and oxygen.' },
    { id: 'c2', front: 'What is mitosis?', back: 'A type of cell division resulting in two daughter cells with the same number of chromosomes as the parent cell.' },
    { id: 'c3', front: 'What is DNA?', back: 'Deoxyribonucleic acid — a molecule carrying genetic instructions for growth, development, and reproduction.' },
    { id: 'c4', front: 'What is an enzyme?', back: 'A biological catalyst that speeds up chemical reactions in cells without being consumed.' },
    { id: 'c5', front: 'What is osmosis?', back: 'The movement of water through a semipermeable membrane from a low solute concentration to a high solute concentration.' },
  ],
  createdAt: new Date('2024-01-01').toISOString(),
  updatedAt: new Date('2024-01-01').toISOString(),
};

const SAMPLE_NOTE = {
  id: 'sample-note-1',
  title: 'Welcome to Synapse Notes',
  content: '<h1>Welcome to Synapse! 🧠</h1><p>This is your note-taking space. You can write rich text notes here.</p><h2>Features</h2><ul><li>Rich text formatting</li><li>Organize with folders</li><li>Tag your notes</li><li>Full-text search</li></ul><h2>Tips</h2><p>Use the toolbar above to format your text. You can create <strong>bold</strong>, <em>italic</em>, and more!</p><blockquote>A note saved is a thought preserved.</blockquote>',
  folderId: null,
  tags: ['welcome', 'tutorial'],
  color: '#6366f1',
  pinned: true,
  createdAt: new Date('2024-01-01').toISOString(),
  updatedAt: new Date('2024-01-01').toISOString(),
};

export function AppProvider({ children }) {
  const [decks, setDecks] = useLocalStorage('synapse-decks', [SAMPLE_DECK]);
  const [notes, setNotes] = useLocalStorage('synapse-notes', [SAMPLE_NOTE]);
  const [folders, setFolders] = useLocalStorage('synapse-folders', []);
  const [studyProgress, setStudyProgress] = useLocalStorage('synapse-progress', {});

  // ── Deck operations ──────────────────────────────────────────────────
  const createDeck = (data) => {
    const deck = {
      id: crypto.randomUUID(),
      ...data,
      cards: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setDecks((prev) => [deck, ...prev]);
    return deck;
  };

  const updateDeck = (id, data) => {
    setDecks((prev) =>
      prev.map((d) => d.id === id ? { ...d, ...data, updatedAt: new Date().toISOString() } : d)
    );
  };

  const deleteDeck = (id) => {
    setDecks((prev) => prev.filter((d) => d.id !== id));
  };

  const addCard = (deckId, card) => {
    const newCard = { id: crypto.randomUUID(), ...card };
    setDecks((prev) =>
      prev.map((d) =>
        d.id === deckId
          ? { ...d, cards: [...d.cards, newCard], updatedAt: new Date().toISOString() }
          : d
      )
    );
    return newCard;
  };

  const updateCard = (deckId, cardId, data) => {
    setDecks((prev) =>
      prev.map((d) =>
        d.id === deckId
          ? {
              ...d,
              cards: d.cards.map((c) => (c.id === cardId ? { ...c, ...data } : c)),
              updatedAt: new Date().toISOString(),
            }
          : d
      )
    );
  };

  const deleteCard = (deckId, cardId) => {
    setDecks((prev) =>
      prev.map((d) =>
        d.id === deckId
          ? { ...d, cards: d.cards.filter((c) => c.id !== cardId), updatedAt: new Date().toISOString() }
          : d
      )
    );
  };

  // ── Note operations ──────────────────────────────────────────────────
  const createNote = (data = {}) => {
    const note = {
      id: crypto.randomUUID(),
      title: 'Untitled Note',
      content: '',
      folderId: null,
      tags: [],
      color: null,
      pinned: false,
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setNotes((prev) => [note, ...prev]);
    return note;
  };

  const updateNote = (id, data) => {
    setNotes((prev) =>
      prev.map((n) => n.id === id ? { ...n, ...data, updatedAt: new Date().toISOString() } : n)
    );
  };

  const deleteNote = (id) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  // ── Folder operations ──────────────────────────────────────────────────
  const createFolder = (name, color = '#6366f1') => {
    const folder = {
      id: crypto.randomUUID(),
      name,
      color,
      createdAt: new Date().toISOString(),
    };
    setFolders((prev) => [...prev, folder]);
    return folder;
  };

  const deleteFolder = (id) => {
    setFolders((prev) => prev.filter((f) => f.id !== id));
    setNotes((prev) => prev.map((n) => n.folderId === id ? { ...n, folderId: null } : n));
  };

  // ── Progress operations ──────────────────────────────────────────────
  const recordQuizResult = (deckId, score, total) => {
    setStudyProgress((prev) => ({
      ...prev,
      [deckId]: {
        lastScore: score,
        lastTotal: total,
        lastStudied: new Date().toISOString(),
        bestScore: Math.max(score, prev[deckId]?.bestScore ?? 0),
        attempts: (prev[deckId]?.attempts ?? 0) + 1,
      },
    }));
  };

  return (
    <AppContext.Provider value={{
      decks, notes, folders, studyProgress,
      createDeck, updateDeck, deleteDeck,
      addCard, updateCard, deleteCard,
      createNote, updateNote, deleteNote,
      createFolder, deleteFolder,
      recordQuizResult,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
