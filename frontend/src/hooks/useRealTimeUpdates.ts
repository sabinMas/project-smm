import { useEffect } from 'react';
import { useWebSocket } from './useWebSocket';
import { useCalendarStore } from '@/store/calendarStore';

/**
 * Subscribes to WebSocket messages for publish status updates
 * and updates local state accordingly.
 */
export function useRealTimeUpdates() {
  const { connected, subscribe } = useWebSocket();

  useEffect(() => {
    const unsub = subscribe((msg) => {
      if (msg.type === 'publish_status') {
        const { postId, status } = msg.payload as {
          postId: string;
          status: string;
        };
        const store = useCalendarStore.getState();
        const updated = store.posts.map((p) =>
          p.id === postId ? { ...p, status: status as any } : p
        );
        useCalendarStore.setState({ posts: updated });
      }
    });
    return unsub;
  }, [subscribe]);

  return { connected };
}
