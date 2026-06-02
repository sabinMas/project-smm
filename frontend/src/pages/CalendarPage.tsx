import { useEffect, useMemo } from 'react';
import { useCalendarStore } from '@/store/calendarStore';
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  isSameDay,
  addMonths,
  subMonths,
} from 'date-fns';
import type { PostStatus } from '@smm/shared';
import { clsx } from 'clsx';

const STATUS_COLORS: Record<PostStatus, string> = {
  draft: 'bg-white/20',
  scheduled: 'bg-brand-500',
  publishing: 'bg-yellow-500',
  published: 'bg-green-500',
  failed: 'bg-red-500',
  cancelled: 'bg-white/10',
};

export default function CalendarPage() {
  const { posts, loading, selectedMonth, fetch, setMonth, cancel } = useCalendarStore();

  const monthStart = startOfMonth(selectedMonth);
  const monthEnd = endOfMonth(selectedMonth);

  useEffect(() => {
    fetch(monthStart.toISOString(), monthEnd.toISOString());
  }, [selectedMonth, fetch]);

  const days = useMemo(
    () => eachDayOfInterval({ start: monthStart, end: monthEnd }),
    [selectedMonth]
  );

  const getPostsForDay = (day: Date) =>
    posts.filter((p) => p.scheduledAt && isSameDay(new Date(p.scheduledAt), day));

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Calendar</h1>
        <div className="flex items-center gap-3">
          <button className="btn-ghost" onClick={() => setMonth(subMonths(selectedMonth, 1))}>
            ←
          </button>
          <span className="text-sm font-medium">{format(selectedMonth, 'MMMM yyyy')}</span>
          <button className="btn-ghost" onClick={() => setMonth(addMonths(selectedMonth, 1))}>
            →
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center text-white/40 py-12">Loading...</div>
      ) : (
        <>
          {/* Day labels */}
          <div className="grid grid-cols-7 gap-1">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="text-center text-xs text-white/40 py-2">
                {d}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Offset for first day of month */}
            {Array.from({ length: monthStart.getDay() }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}

            {days.map((day) => {
              const dayPosts = getPostsForDay(day);
              return (
                <div
                  key={day.toISOString()}
                  className="card min-h-[80px] p-2 text-xs space-y-1"
                >
                  <span className="text-white/50">{format(day, 'd')}</span>
                  {dayPosts.map((post) => (
                    <div
                      key={post.id}
                      className="flex items-center gap-1 group"
                    >
                      <span
                        className={clsx('w-2 h-2 rounded-full flex-shrink-0', STATUS_COLORS[post.status])}
                      />
                      <span className="truncate text-white/70">{post.originalContent.slice(0, 20)}</span>
                      {post.status === 'scheduled' && (
                        <button
                          className="hidden group-hover:inline text-red-400 ml-auto"
                          onClick={() => cancel(post.id)}
                          aria-label={`Cancel post: ${post.originalContent.slice(0, 20)}`}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-white/60">
        {Object.entries(STATUS_COLORS).map(([status, color]) => (
          <div key={status} className="flex items-center gap-1">
            <span className={clsx('w-2 h-2 rounded-full', color)} />
            <span className="capitalize">{status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
