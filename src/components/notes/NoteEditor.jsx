import { useEffect, useRef, useCallback, useState } from 'react';
import {
  Bold, Italic, Underline, List, ListOrdered, Quote,
  Code, Heading1, Heading2, Heading3, Minus, Link2, Type
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

function ToolbarBtn({ cmd, arg, icon: Icon, title, active }) {
  const exec = (e) => {
    e.preventDefault();
    document.execCommand(cmd, false, arg ?? null);
  };
  return (
    <button
      onMouseDown={exec}
      title={title}
      className={`p-1.5 rounded-md transition-all ${active ? 'bg-primary-100 text-primary-700' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'}`}
    >
      <Icon size={15} />
    </button>
  );
}

function FormatBtn({ tag, icon: Icon, title }) {
  const exec = (e) => {
    e.preventDefault();
    document.execCommand('formatBlock', false, tag);
  };
  return (
    <button
      onMouseDown={exec}
      title={title}
      className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-all"
    >
      <Icon size={15} />
    </button>
  );
}

export default function NoteEditor({ note }) {
  const { updateNote } = useApp();
  const editorRef = useRef(null);
  const titleRef = useRef(null);
  const saveTimer = useRef(null);
  const [wordCount, setWordCount] = useState(0);

  // Load content when note changes
  useEffect(() => {
    if (!editorRef.current) return;
    if (editorRef.current.innerHTML !== (note.content ?? '')) {
      editorRef.current.innerHTML = note.content ?? '';
    }
    if (titleRef.current && titleRef.current.value !== note.title) {
      titleRef.current.value = note.title;
    }
    // Count words
    const text = editorRef.current.innerText ?? '';
    setWordCount(text.trim() ? text.trim().split(/\s+/).length : 0);
  }, [note.id, note.content, note.title]);

  const scheduleSave = useCallback((field, value) => {
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      updateNote(note.id, { [field]: value });
    }, 600);
  }, [note.id, updateNote]);

  const handleContentInput = () => {
    const html = editorRef.current.innerHTML;
    const text = editorRef.current.innerText ?? '';
    setWordCount(text.trim() ? text.trim().split(/\s+/).length : 0);
    scheduleSave('content', html);
  };

  const handleTitleInput = () => {
    scheduleSave('title', titleRef.current.value);
  };

  const insertLink = (e) => {
    e.preventDefault();
    const url = window.prompt('Enter URL:');
    if (url) document.execCommand('createLink', false, url);
  };

  const insertHR = (e) => {
    e.preventDefault();
    document.execCommand('insertHorizontalRule', false, null);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-4 py-2 border-b border-slate-100 flex-wrap">
        <div className="flex items-center gap-0.5 pr-2 mr-1 border-r border-slate-100">
          <FormatBtn tag="h1" icon={Heading1} title="Heading 1" />
          <FormatBtn tag="h2" icon={Heading2} title="Heading 2" />
          <FormatBtn tag="h3" icon={Heading3} title="Heading 3" />
          <FormatBtn tag="p" icon={Type} title="Paragraph" />
        </div>
        <div className="flex items-center gap-0.5 pr-2 mr-1 border-r border-slate-100">
          <ToolbarBtn cmd="bold" icon={Bold} title="Bold (Ctrl+B)" />
          <ToolbarBtn cmd="italic" icon={Italic} title="Italic (Ctrl+I)" />
          <ToolbarBtn cmd="underline" icon={Underline} title="Underline (Ctrl+U)" />
        </div>
        <div className="flex items-center gap-0.5 pr-2 mr-1 border-r border-slate-100">
          <ToolbarBtn cmd="insertUnorderedList" icon={List} title="Bullet List" />
          <ToolbarBtn cmd="insertOrderedList" icon={ListOrdered} title="Numbered List" />
        </div>
        <div className="flex items-center gap-0.5">
          <FormatBtn tag="blockquote" icon={Quote} title="Blockquote" />
          <FormatBtn tag="pre" icon={Code} title="Code Block" />
          <button
            onMouseDown={insertLink}
            title="Insert Link"
            className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-all"
          >
            <Link2 size={15} />
          </button>
          <button
            onMouseDown={insertHR}
            title="Horizontal Rule"
            className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-all"
          >
            <Minus size={15} />
          </button>
        </div>
      </div>

      {/* Title */}
      <input
        ref={titleRef}
        defaultValue={note.title}
        onInput={handleTitleInput}
        placeholder="Untitled Note"
        className="px-8 pt-6 pb-2 text-2xl font-bold text-slate-800 border-none outline-none placeholder-slate-200 bg-white"
      />

      {/* Meta */}
      <p className="px-8 pb-3 text-xs text-slate-300">
        {new Date(note.updatedAt).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
        {' · '}
        {wordCount} word{wordCount !== 1 ? 's' : ''}
      </p>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleContentInput}
        className="note-content flex-1 px-8 py-2 overflow-y-auto focus:outline-none text-slate-700 text-[15px]"
        data-placeholder="Start writing..."
        style={{ minHeight: '300px' }}
      />

      <style>{`
        [data-placeholder]:empty:before {
          content: attr(data-placeholder);
          color: #cbd5e1;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}
