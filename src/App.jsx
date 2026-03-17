import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Sidebar from './components/layout/Sidebar';
import HomePage from './pages/HomePage';
import FlashcardsPage from './pages/FlashcardsPage';
import DeckDetailPage from './pages/DeckDetailPage';
import StudyPage from './pages/StudyPage';
import QuizPage from './pages/QuizPage';
import NotesPage from './pages/NotesPage';

function Layout({ children }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          {/* Full-screen modes (no sidebar) */}
          <Route path="/flashcards/:id/study" element={<StudyPage />} />
          <Route path="/flashcards/:id/quiz" element={<QuizPage />} />

          {/* Main app with sidebar */}
          <Route path="/" element={<Layout><HomePage /></Layout>} />
          <Route path="/flashcards" element={<Layout><FlashcardsPage /></Layout>} />
          <Route path="/flashcards/:id" element={<Layout><DeckDetailPage /></Layout>} />
          <Route path="/notes" element={<Layout><NotesPage /></Layout>} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
