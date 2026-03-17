import { useState } from 'react';
import { Search, Plus, Pin, Trash2, Folder } from 'lucide-react';
import { useApp } from '../../context/AppContext';

function stripHtml(html) {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}

function NoteItem({ note, selected, onClick, onDelete }) {
  const preview = stripHtml(note.content).slice(0, 80);
  const dateStr = new Date(note.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <div
      onClick={onClick}
      className={`group relative px-4 py-3 cursor-pointer border-b border-slate-50 transition-all ${
        selected ? 'bg-primary-50' : 'hover:bg-slate-50'
      }`}
    >
      {note.color && (
        <div
          className="absolute left-0 top-0 bottom-0 w-0.5 rounded-r"
          style={{ background: note.color }}
        />
      )}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 mb-0.5">
            {note.pinned && <Pin size={10} className="text-amber-400 shrink-0" />}
            <p className={`text-sm font-semibold truncate ${selected ? 'text-primary-700' : 'text-slate-700'}`}>
              {note.title || 'Untitled Note'}
            </p>
          </div>
          {preview && (
            <p className="text-xs text-slate-400 line-clamp-1">{preview}</p>
          )}
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-slate-300">{dateStr}</span>
            {note.tags?.length > 0 && (
              <div className="flex gap-1">
                {note.tags.slice(0, 2).map((tag) => (
                  <span key={tag} className="text-xs bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="shrink-0 p-1 rounded text-slate-200 hover:text-red-400 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}

export default function NoteList({ selectedId, onSelect, folderId }) {
  const { notes, folders, createNote, deleteNote } = useApp();
  const [search, setSearch] = useState('');

  const filtered = notes
    .filter((n) => {
      if (folderId === '__unorganized__') return !n.folderId;
      if (folderId) return n.folderId === folderId;
      return true;
    })
    .filter((n) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        n.title.toLowerCase().includes(q) ||
        stripHtml(n.content).toLowerCase().includes(q) ||
        n.tags?.some((t) => t.toLowerCase().includes(q))
      );
    })
    .sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    });

  const currentFolder = folderId ? folders.find((f) => f.id === folderId) : null;

  const handleCreate = () => {
    const note = createNote({ folderId: folderId === '__unorganized__' ? null : folderId });
    onSelect(note.id);
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-slate-100">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {currentFolder && (
              <div className="w-3 h-3 rounded-full" style={{ background: currentFolder.color }} />
            )}
            <h2 className="text-sm font-semibold text-slate-700">
              {currentFolder?.name ?? (folderId === '__unorganized__' ? 'Unorganized' : 'All Notes')}
            </h2>
            <span className="text-xs text-slate-300">({filtered.length})</span>
          </div>
          <button
            onClick={handleCreate}
            className="p-1.5 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-all"
            title="New Note"
          >
            <Plus size={14} />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notes..."
            className="w-full pl-8 pr-3 py-2 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-600 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-400"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="text-center py-12 px-4">
            {search ? (
              <p className="text-slate-300 text-xs">No notes match "{search}"</p>
            ) : (
              <div>
                <Folder size={24} className="text-slate-200 mx-auto mb-2" />
                <p className="text-slate-300 text-xs">No notes yet</p>
                <button onClick={handleCreate} className="mt-3 text-xs text-primary-500 hover:text-primary-600 font-medium">
                  + New Note
                </button>
              </div>
            )}
          </div>
        ) : (
          filtered.map((note) => (
            <NoteItem
              key={note.id}
              note={note}
              selected={note.id === selectedId}
              onClick={() => onSelect(note.id)}
              onDelete={() => {
                deleteNote(note.id);
                if (selectedId === note.id) onSelect(null);
              }}
            />
          ))
        )}
      </div>
    </div>
  );
}
