import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, RefreshCw, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '138966607934-c1vb8o9irseogk6krovesrkhor84oihh.apps.googleusercontent.com';

export default function CalendarPage() {
  const { accessToken, requestSignIn } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const fetchEvents = useCallback(async (token) => {
    setLoading(true);
    setError(null);
    try {
      const start = new Date(year, month, 1).toISOString();
      const end = new Date(year, month + 1, 0, 23, 59, 59).toISOString();
      const res = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${start}&timeMax=${end}&orderBy=startTime&singleEvents=true&maxResults=200`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error('Failed to fetch events');
      const data = await res.json();
      setEvents(data.items || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  useEffect(() => {
    if (accessToken) fetchEvents(accessToken);
    else setEvents([]);
  }, [accessToken, fetchEvents]);

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Group events by day
  const eventsByDay = {};
  events.forEach((event) => {
    const d = new Date(event.start?.dateTime || event.start?.date);
    if (d.getMonth() === month && d.getFullYear() === year) {
      const day = d.getDate();
      if (!eventsByDay[day]) eventsByDay[day] = [];
      eventsByDay[day].push(event);
    }
  });

  // Colors for events
  const eventColors = [
    'bg-blue-500', 'bg-emerald-500', 'bg-purple-500', 'bg-amber-500', 'bg-rose-500', 'bg-cyan-500'
  ];

  function getEventColor(index) {
    return eventColors[index % eventColors.length];
  }

  function formatEventTime(event) {
    if (!event.start?.dateTime) return 'All day';
    const d = new Date(event.start.dateTime);
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }).toLowerCase();
  }

  // Build grid cells including trailing days from previous month
  const prevMonthDays = new Date(year, month, 0).getDate();
  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;

  if (!CLIENT_ID) {
    return (
      <div className="p-8">
        <div className="text-center text-slate-400 mt-20">
          Add <code className="bg-slate-100 px-1 rounded font-mono">VITE_GOOGLE_CLIENT_ID</code> to{' '}
          <code className="bg-slate-100 px-1 rounded font-mono">.env</code> to enable the calendar.
        </div>
      </div>
    );
  }

  if (!accessToken) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-black text-slate-800">Calendar</h1>
        </div>
        <div className="flex flex-col items-center justify-center mt-20 gap-4">
          <p className="text-slate-500">Sign in to view your Google Calendar</p>
          <button
            onClick={requestSignIn}
            className="px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors"
          >
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-slate-800">Calendar</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchEvents(accessToken)}
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 transition-colors"
            title="Refresh"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <a
            href="https://calendar.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 transition-colors"
            title="Open Google Calendar"
          >
            <ExternalLink size={16} />
          </a>
        </div>
      </div>

      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
          className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <h2 className="text-lg font-bold text-slate-700">{monthName}</h2>
        <button
          onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
          className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {error && (
        <div className="text-sm text-red-400 text-center mb-4">{error}</div>
      )}

      {/* Calendar grid */}
      <div className="flex-1 bg-white rounded-2xl border border-slate-100 overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-slate-100">
          {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((d) => (
            <div key={d} className="text-xs font-semibold text-slate-400 text-center py-3 border-r border-slate-100 last:border-r-0">
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 flex-1" style={{ gridAutoRows: '1fr' }}>
          {Array.from({ length: totalCells }).map((_, i) => {
            const dayNum = i - firstDay + 1;
            const isCurrentMonth = dayNum >= 1 && dayNum <= daysInMonth;
            const displayDay = isCurrentMonth
              ? dayNum
              : dayNum < 1
                ? prevMonthDays + dayNum
                : dayNum - daysInMonth;
            const isToday =
              isCurrentMonth &&
              dayNum === today.getDate() &&
              month === today.getMonth() &&
              year === today.getFullYear();
            const dayEvents = isCurrentMonth ? (eventsByDay[dayNum] || []) : [];

            return (
              <div
                key={i}
                className={`min-h-[100px] border-r border-b border-slate-100 last:border-r-0 p-1.5 ${
                  !isCurrentMonth ? 'bg-slate-50/50' : ''
                }`}
              >
                <div className="flex items-center justify-center mb-1">
                  <span
                    className={`text-xs w-6 h-6 flex items-center justify-center rounded-full font-medium ${
                      isToday
                        ? 'bg-primary-600 text-white font-bold'
                        : isCurrentMonth
                          ? 'text-slate-700'
                          : 'text-slate-300'
                    }`}
                  >
                    {displayDay}
                  </span>
                </div>
                <div className="space-y-0.5 overflow-hidden">
                  {dayEvents.slice(0, 3).map((event, idx) => (
                    <div
                      key={event.id}
                      className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] truncate ${
                        event.start?.dateTime
                          ? 'bg-slate-50'
                          : 'bg-emerald-50 text-emerald-700'
                      }`}
                      title={event.summary}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${getEventColor(idx)}`} />
                      <span className="text-slate-500 shrink-0">{formatEventTime(event)}</span>
                      <span className="text-slate-700 truncate font-medium">{event.summary}</span>
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-[10px] text-slate-400 px-1.5">
                      +{dayEvents.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
