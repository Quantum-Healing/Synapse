import { useState, useEffect, useCallback } from 'react';
import { Calendar, ChevronLeft, ChevronRight, ExternalLink, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export default function CalendarWidget() {
  const { accessToken, requestSignIn } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());

  const fetchEvents = useCallback(async (token) => {
    setLoading(true);
    setError(null);
    try {
      const now = new Date().toISOString();
      const end = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      const res = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${now}&timeMax=${end}&orderBy=startTime&singleEvents=true&maxResults=20`,
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
  }, []);

  useEffect(() => {
    if (accessToken) fetchEvents(accessToken);
    else setEvents([]);
  }, [accessToken, fetchEvents]);

  // Calendar grid helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  const eventDays = new Set(
    events
      .map((e) => {
        const d = new Date(e.start?.dateTime || e.start?.date);
        if (d.getMonth() === month && d.getFullYear() === year) return d.getDate();
        return null;
      })
      .filter(Boolean)
  );

  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const upcomingEvents = events
    .filter((e) => new Date(e.start?.dateTime || e.start?.date) >= todayStart)
    .slice(0, 5);

  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 flex flex-col gap-4 sticky top-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-primary-600" />
          <h2 className="text-lg font-bold text-slate-800">Calendar</h2>
        </div>
        <div className="flex items-center gap-1">
          {accessToken && (
            <button
              onClick={() => fetchEvents(accessToken)}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"
              title="Refresh"
            >
              <RefreshCw size={13} />
            </button>
          )}
          <a
            href="https://calendar.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"
            title="Open Google Calendar"
          >
            <ExternalLink size={13} />
          </a>
        </div>
      </div>

      {/* Mini Month Calendar */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
            className="p-1 rounded-lg hover:bg-slate-100 text-slate-500"
          >
            <ChevronLeft size={15} />
          </button>
          <span className="text-sm font-semibold text-slate-700">{monthName}</span>
          <button
            onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
            className="p-1 rounded-lg hover:bg-slate-100 text-slate-500"
          >
            <ChevronRight size={15} />
          </button>
        </div>

        <div className="grid grid-cols-7 text-center">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
            <div key={d} className="text-[11px] font-medium text-slate-400 py-1">
              {d}
            </div>
          ))}
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const isToday =
              day === today.getDate() &&
              month === today.getMonth() &&
              year === today.getFullYear();
            const hasEvent = eventDays.has(day);
            return (
              <div key={day} className="relative flex flex-col items-center py-0.5">
                <span
                  className={`text-xs w-6 h-6 flex items-center justify-center rounded-full transition-colors ${
                    isToday
                      ? 'bg-primary-600 text-white font-bold'
                      : 'text-slate-600 hover:bg-slate-100 cursor-default'
                  }`}
                >
                  {day}
                </span>
                {hasEvent && (
                  <span
                    className={`w-1 h-1 rounded-full ${isToday ? 'bg-white' : 'bg-primary-400'}`}
                    style={{ marginTop: 1 }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Events / sign-in prompt */}
      {!CLIENT_ID ? (
        <div className="text-xs text-slate-400 bg-slate-50 rounded-xl p-3 text-center leading-relaxed">
          Add <code className="bg-slate-100 px-1 rounded font-mono">VITE_GOOGLE_CLIENT_ID</code> to{' '}
          <code className="bg-slate-100 px-1 rounded font-mono">.env</code> to enable Google Calendar sync.
        </div>
      ) : !accessToken ? (
        <button
          onClick={requestSignIn}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all"
        >
          Sign in to see events
        </button>
      ) : loading ? (
        <div className="text-xs text-slate-400 text-center py-2">Loading events…</div>
      ) : error ? (
        <div className="text-xs text-red-400 text-center py-2">{error}</div>
      ) : upcomingEvents.length === 0 ? (
        <p className="text-xs text-slate-400 text-center py-2">No upcoming events</p>
      ) : (
        <div className="space-y-2">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Upcoming</p>
          {upcomingEvents.map((event) => {
            const start = new Date(event.start?.dateTime || event.start?.date);
            const isAllDay = !event.start?.dateTime;
            return (
              <div
                key={event.id}
                className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 hover:bg-primary-50 transition-colors"
              >
                <div className="flex flex-col items-center bg-white rounded-lg px-2 py-1 border border-slate-100 min-w-[36px] text-center shrink-0">
                  <span className="text-[9px] font-medium text-slate-400 uppercase leading-none">
                    {start.toLocaleDateString('en-US', { month: 'short' })}
                  </span>
                  <span className="text-sm font-bold text-slate-700 leading-tight">{start.getDate()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-700 truncate">{event.summary}</p>
                  <p className="text-[11px] text-slate-400">
                    {isAllDay
                      ? 'All day'
                      : start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
