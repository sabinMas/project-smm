import { useEffect } from 'react';
import { useConnectionsStore } from '@/store/connectionsStore';
import type { PlatformId, PlatformConnectionStatus } from '@smm/shared';
import { clsx } from 'clsx';

const ALL_PLATFORMS: PlatformId[] = ['x', 'linkedin', 'facebook', 'instagram', 'threads', 'tiktok', 'bluesky'];

const PLATFORM_INFO: Record<PlatformId, { name: string; icon: string }> = {
  x: { name: 'X (Twitter)', icon: '𝕏' },
  linkedin: { name: 'LinkedIn', icon: 'in' },
  facebook: { name: 'Facebook', icon: 'f' },
  instagram: { name: 'Instagram', icon: '📷' },
  threads: { name: 'Threads', icon: '@' },
  tiktok: { name: 'TikTok', icon: '♪' },
  bluesky: { name: 'Bluesky', icon: '🦋' },
};

const STATUS_STYLES: Record<PlatformConnectionStatus, { label: string; color: string }> = {
  active: { label: 'Connected', color: 'text-green-400' },
  expired: { label: 'Expired', color: 'text-yellow-400' },
  disconnected: { label: 'Disconnected', color: 'text-white/40' },
  error: { label: 'Error', color: 'text-red-400' },
};

export default function ConnectionsPage() {
  const { connections, loading, error, fetch, connect, disconnect } = useConnectionsStore();

  useEffect(() => {
    fetch();
  }, [fetch]);

  const getConnection = (platformId: PlatformId) =>
    connections.find((c) => c.platformId === platformId);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Platform Connections</h1>

      {error && (
        <div className="bg-red-900/30 border border-red-500/50 text-red-300 px-4 py-2 rounded-lg">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center text-white/40 py-12">Loading...</div>
      ) : (
        <div className="space-y-3">
          {ALL_PLATFORMS.map((platformId) => {
            const conn = getConnection(platformId);
            const info = PLATFORM_INFO[platformId];
            const statusInfo = conn ? STATUS_STYLES[conn.status] : null;

            return (
              <div key={platformId} className="card flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-surface-2 rounded-lg flex items-center justify-center text-lg font-bold">
                    {info?.icon}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{info?.name}</p>
                    {conn ? (
                      <p className={clsx('text-xs', statusInfo?.color)}>
                        {statusInfo?.label} • @{conn.platformUsername}
                      </p>
                    ) : (
                      <p className="text-xs text-white/40">Not connected</p>
                    )}
                  </div>
                </div>

                {conn && conn.status === 'active' ? (
                  <button
                    className="btn-ghost text-red-400 text-sm"
                    onClick={() => disconnect(conn.id)}
                  >
                    Disconnect
                  </button>
                ) : (
                  <button className="btn-primary text-sm" onClick={() => connect(platformId)}>
                    Connect
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* External integrations */}
      <h2 className="text-lg font-semibold mt-8">External Integrations</h2>
      <div className="space-y-3">
        <div className="card flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-surface-2 rounded-lg flex items-center justify-center text-lg">
              🎙️
            </div>
            <div>
              <p className="font-medium text-sm">Vapi (Voice AI)</p>
              <p className="text-xs text-white/40">Voice input for content creation</p>
            </div>
          </div>
          <span className="badge bg-white/10 text-white/50">Coming soon</span>
        </div>

        <div className="card flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-surface-2 rounded-lg flex items-center justify-center text-lg">
              🕷️
            </div>
            <div>
              <p className="font-medium text-sm">Apify (Web Scraping)</p>
              <p className="text-xs text-white/40">Trend research & competitor analysis</p>
            </div>
          </div>
          <span className="badge bg-white/10 text-white/50">Coming soon</span>
        </div>
      </div>
    </div>
  );
}
