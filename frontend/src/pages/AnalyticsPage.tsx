import { useEffect, useState } from 'react';
import { useAnalyticsStore } from '@/store/analyticsStore';
import { format, subDays } from 'date-fns';

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="card text-center">
      <p className="text-2xl font-bold">{value.toLocaleString()}</p>
      <p className="text-xs text-white/50 mt-1">{label}</p>
    </div>
  );
}

export default function AnalyticsPage() {
  const { dashboard, loading, error, fetchDashboard } = useAnalyticsStore();
  const [range, setRange] = useState(30);

  useEffect(() => {
    const to = new Date();
    const from = subDays(to, range);
    fetchDashboard(from.toISOString(), to.toISOString());
  }, [range, fetchDashboard]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <select
          className="input w-auto"
          value={range}
          onChange={(e) => setRange(Number(e.target.value))}
          aria-label="Date range"
        >
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-500/50 text-red-300 px-4 py-2 rounded-lg">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center text-white/40 py-12">Loading analytics...</div>
      ) : dashboard ? (
        <>
          {/* Aggregate metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard label="Likes" value={dashboard.aggregate.totalLikes} />
            <MetricCard label="Shares" value={dashboard.aggregate.totalShares} />
            <MetricCard label="Comments" value={dashboard.aggregate.totalComments} />
            <MetricCard label="Impressions" value={dashboard.aggregate.totalImpressions} />
          </div>

          {/* Engagement by day */}
          {dashboard.engagementByDay.length > 0 && (
            <div className="card">
              <h2 className="text-sm font-medium text-white/60 mb-4">Daily Engagement</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-white/40 border-b border-white/10">
                      <th className="text-left py-2 px-2">Date</th>
                      <th className="text-right py-2 px-2">Likes</th>
                      <th className="text-right py-2 px-2">Shares</th>
                      <th className="text-right py-2 px-2">Comments</th>
                      <th className="text-right py-2 px-2">Impressions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboard.engagementByDay.map((day) => (
                      <tr key={String(day.date)} className="border-b border-white/5">
                        <td className="py-2 px-2 text-white/70">
                          {format(new Date(day.date), 'MMM d')}
                        </td>
                        <td className="py-2 px-2 text-right">{day.likes}</td>
                        <td className="py-2 px-2 text-right">{day.shares}</td>
                        <td className="py-2 px-2 text-right">{day.comments}</td>
                        <td className="py-2 px-2 text-right">{day.impressions.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Top posts */}
          {dashboard.topPosts.length > 0 && (
            <div className="card">
              <h2 className="text-sm font-medium text-white/60 mb-4">Top Posts</h2>
              <div className="space-y-2">
                {dashboard.topPosts.map((post) => (
                  <div key={post.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                    <div className="flex items-center gap-2">
                      <span className="badge bg-brand-500/20 text-brand-500">{post.platformId}</span>
                      <span className="text-xs text-white/60">{format(new Date(post.collectedAt), 'MMM d')}</span>
                    </div>
                    <div className="flex gap-4 text-xs text-white/70">
                      <span>❤️ {post.likes}</span>
                      <span>🔄 {post.shares}</span>
                      <span>💬 {post.comments}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center text-white/40 py-12">No analytics data available</div>
      )}
    </div>
  );
}
