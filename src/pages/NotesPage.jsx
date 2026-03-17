import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Pin, Palette, Tag, Folder, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import FolderPanel from '../components/notes/FolderPanel';
import NoteList from '../components/notes/NoteList';
import NoteEditor from '../components/notes/NoteEditor';

const NOTE_COLORS = [null, '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];

export default function NotesPage() {
  const [params, setParams] = useSearchParams();
  const { notes, folders, updateNote } = useApp();
  const [selectedId, setSelectedId] = useState(params.get('note') ?? null);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [tagInput, setTagInput] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);

  // Auto-select first note if none selected
  useEffect(() => {
    if (!selectedId && notes.length > 0) {
      setSelectedId(notes[0].id);
    }
  }, [notes, selectedId]);

  const selectedNote = notes.find((n) => n.id === selectedId);

  const handleSelect = (id) => {
    setSelectedId(id);
    if (id) setParams({ note: id });
    else setParams({});
  };

  const handleAddTag = (e) => {
    e.preventDefault();
    if (!tagInput.trim() || !selectedNote) return;
    const tag = tagInput.trim().toLowerCase();
    if (!selectedNote.tags?.includes(tag)) {
      updateNote(selectedNote.id, { tags: [...(selectedNote.tags ?? []), tag] });
    }
    setTagInput('');
    setShowTagInput(false);
  };

  const handleRemoveTag = (tag) => {
    updateNote(selectedNote.id, { tags: selectedNote.tags.filter((t) => t !== tag) });
  };

  const handleMoveToFolder = (folderId) => {
    updateNote(selectedNote.id, { folderId: folderId || null });
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ height: 'calc(100vh - 0px)' }}>
      {/* Folder panel */}
      <FolderPanel selectedFolder={selectedFolder} onSelectFolder={setSelectedFolder} />

      {/* Note list */}
      <div className="w-64 shrink-0 flex flex-col overflow-hidden">
        <NoteList
          selectedId={selectedId}
          onSelect={handleSelect}
          folderId={selectedFolder}
        />
      </div>

      {/* Editor */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {selectedNote ? (
          <>
            {/* Note meta bar */}
            <div className="flex items-center gap-3 px-6 py-2 bg-white border-b border-slate-100 flex-wrap">
              {/* Pin toggle */}
              <button
                onClick={() => updateNote(selectedNote.id, { pinned: !selectedNote.pinned })}
                className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border transition-all ${
                  selectedNote.pinned
                    ? 'border-amber-200 bg-amber-50 text-amber-600'
                    : 'border-slate-100 text-slate-400 hover:border-slate-200'
                }`}
                title={selectedNote.pinned ? 'Unpin' : 'Pin note'}
              >
                <Pin size={12} />
                {selectedNote.pinned ? 'Pinned' : 'Pin'}
              </button>

              {/* Color picker */}
              <div className="flex items-center gap-1.5">
                <Palette size={13} className="text-slate-300" />
                <div className="flex gap-1">
                  {NOTE_COLORS.map((c, i) => (
                    <button
                      key={i}
                      onClick={() => updateNote(selectedNote.id, { color: c })}
                      className={`w-4 h-4 rounded-full border-2 transition-all hover:scale-110 ${
                        selectedNote.color === c ? 'border-slate-400 scale-110' : 'border-transparent'
                      }`}
                      style={{ background: c ?? '#e2e8f0' }}
                      title={c ?? 'No color'}
                    />
                  ))}
                </div>
              </div>

              {/* Folder assign */}
              <div className="flex items-center gap-1.5">
                <Folder size={13} className="text-slate-300" />
                <select
                  value={selectedNote.folderId ?? ''}
                  onChange={(e) => handleMoveToFolder(e.target.value)}
                  className="text-xs border border-slate-100 rounded-lg px-2 py-1 text-slate-500 focus:outline-none focus:ring-1 focus:ring-primary-400 bg-white"
                >
                  <option value="">No folder</option>
                  {folders.map((f) => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>

              {/* Tags */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <Tag size={13} className="text-slate-300" />
                {selectedNote.tags?.map((tag) => (
                  <span key={tag} className="flex items-center gap-1 text-xs bg-primary-50 text-primary-600 px-2 py-0.5 rounded-full">
                    {tag}
                    <button onClick={() => handleRemoveTag(tag)} className="hover:text-red-500">
                      <X size={10} />
                    </button>
                  </span>
                ))}
                {showTagInput ? (
                  <form onSubmit={handleAddTag} className="inline-flex">
                    <input
                      autoFocus
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onBlur={() => { if (!tagInput.trim()) setShowTagInput(false); }}
                      placeholder="tag name..."
                      className="text-xs border border-primary-200 rounded-lg px-2 py-0.5 w-24 focus:outline-none focus:ring-1 focus:ring-primary-400"
                    />
                  </form>
                ) : (
                  <button
                    onClick={() => setShowTagInput(true)}
                    className="text-xs text-slate-300 hover:text-primary-500 px-1.5 py-0.5 rounded-full hover:bg-primary-50 transition-all"
                  >
                    + tag
                  </button>
                )}
              </div>
            </div>

            {/* Editor */}
            <div className="flex-1 overflow-y-auto">
              <NoteEditor note={selectedNote} />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-300">
            <div className="text-center">
              <div className="text-6xl mb-4">📝</div>
              <p className="text-lg font-medium">Select a note to start editing</p>
              <p className="text-sm mt-1">or create a new one</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
