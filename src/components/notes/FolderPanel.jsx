import { useState } from 'react';
import { Folder, FolderOpen, Plus, Trash2, StickyNote } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const FOLDER_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#14b8a6'];

export default function FolderPanel({ selectedFolder, onSelectFolder }) {
  const { folders, notes, createFolder, deleteFolder } = useApp();
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(FOLDER_COLORS[0]);

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    createFolder(newName.trim(), newColor);
    setNewName('');
    setNewColor(FOLDER_COLORS[0]);
    setCreating(false);
  };

  const countInFolder = (fid) => notes.filter((n) => n.folderId === fid).length;
  const unorganized = notes.filter((n) => !n.folderId).length;

  return (
    <div className="flex flex-col h-full bg-slate-50 border-r border-slate-100 w-48 shrink-0">
      <div className="px-3 py-3 border-b border-slate-100">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Folders</span>
          <button
            onClick={() => setCreating(!creating)}
            className="p-1 rounded-md text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition-all"
            title="New folder"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      {/* Create form */}
      {creating && (
        <form onSubmit={handleCreate} className="p-3 border-b border-slate-100 bg-white">
          <input
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Folder name..."
            className="w-full text-xs px-2 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-400 mb-2"
          />
          <div className="flex gap-1 flex-wrap mb-2">
            {FOLDER_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setNewColor(c)}
                className={`w-5 h-5 rounded-full transition-all ${newColor === c ? 'ring-2 ring-offset-1 ring-slate-400 scale-110' : 'hover:scale-105'}`}
                style={{ background: c }}
              />
            ))}
          </div>
          <div className="flex gap-1">
            <button type="button" onClick={() => setCreating(false)} className="flex-1 text-xs py-1 rounded-lg border border-slate-200 text-slate-500">
              Cancel
            </button>
            <button type="submit" className="flex-1 text-xs py-1 rounded-lg bg-primary-600 text-white">
              Create
            </button>
          </div>
        </form>
      )}

      <div className="flex-1 overflow-y-auto py-1">
        {/* All notes */}
        <button
          onClick={() => onSelectFolder(null)}
          className={`w-full flex items-center gap-2 px-3 py-2 text-xs transition-all ${
            selectedFolder === null ? 'bg-primary-50 text-primary-700 font-semibold' : 'text-slate-500 hover:bg-slate-100'
          }`}
        >
          <StickyNote size={13} className="shrink-0" />
          <span className="flex-1 text-left truncate">All Notes</span>
          <span className="text-slate-300 text-xs">{notes.length}</span>
        </button>

        {/* Folders */}
        {folders.map((folder) => {
          const active = selectedFolder === folder.id;
          return (
            <div key={folder.id} className="group relative flex items-center">
              <button
                onClick={() => onSelectFolder(folder.id)}
                className={`flex-1 flex items-center gap-2 px-3 py-2 text-xs transition-all ${
                  active ? 'bg-primary-50 text-primary-700 font-semibold' : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                {active
                  ? <FolderOpen size={13} className="shrink-0" style={{ color: folder.color }} />
                  : <Folder size={13} className="shrink-0" style={{ color: folder.color }} />}
                <span className="flex-1 text-left truncate">{folder.name}</span>
                <span className="text-slate-300 text-xs">{countInFolder(folder.id)}</span>
              </button>
              <button
                onClick={() => {
                  if (selectedFolder === folder.id) onSelectFolder(null);
                  deleteFolder(folder.id);
                }}
                className="absolute right-1 p-1 rounded text-slate-200 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
              >
                <Trash2 size={11} />
              </button>
            </div>
          );
        })}

        {/* Unorganized */}
        {unorganized > 0 && (
          <button
            onClick={() => onSelectFolder('__unorganized__')}
            className={`w-full flex items-center gap-2 px-3 py-2 text-xs transition-all ${
              selectedFolder === '__unorganized__' ? 'bg-primary-50 text-primary-700 font-semibold' : 'text-slate-400 hover:bg-slate-100'
            }`}
          >
            <Folder size={13} className="shrink-0 text-slate-300" />
            <span className="flex-1 text-left">Unorganized</span>
            <span className="text-slate-300 text-xs">{unorganized}</span>
          </button>
        )}
      </div>
    </div>
  );
}
