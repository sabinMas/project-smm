import { useEffect, useState } from 'react';
import { useComposeStore } from '@/store/composeStore';
import { usePostTypesStore } from '@/store/postTypesStore';
import PlatformPreview from '@/components/ui/PlatformPreview';
import type { PlatformId } from '@smm/shared';

const PLATFORM_LABELS: Record<PlatformId, string> = {
  x: 'X (Twitter)',
  linkedin: 'LinkedIn',
  facebook: 'Facebook',
  instagram: 'Instagram',
  threads: 'Threads',
  tiktok: 'TikTok',
  bluesky: 'Bluesky',
};

export default function ComposePage() {
  const {
    text,
    selectedPostTypeId,
    targetPlatforms,
    generatedContent,
    generating,
    publishing,
    scheduling,
    error,
    setText,
    setPostType,
    generate,
    publish,
    reset,
    schedule,
  } = useComposeStore();

  const { postTypes, fetch: fetchPostTypes } = usePostTypesStore();
  const [scheduleDate, setScheduleDate] = useState('');
  const [showSchedule, setShowSchedule] = useState(false);

  useEffect(() => {
    fetchPostTypes();
  }, [fetchPostTypes]);

  const handlePostTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const pt = postTypes.find((p) => p.id === e.target.value);
    if (pt) setPostType(pt.id, pt.targetPlatforms);
  };

  const handleSchedule = () => {
    if (scheduleDate) {
      schedule(scheduleDate);
      setShowSchedule(false);
      setScheduleDate('');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Compose</h1>

      {error && (
        <div className="bg-red-900/30 border border-red-500/50 text-red-300 px-4 py-2 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Editor */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card space-y-3">
            <label htmlFor="post-type" className="block text-sm text-white/60">
              Post Type
            </label>
            <select
              id="post-type"
              className="input"
              value={selectedPostTypeId || ''}
              onChange={handlePostTypeChange}
            >
              <option value="">Select a post type...</option>
              {postTypes.map((pt) => (
                <option key={pt.id} value={pt.id}>
                  {pt.name}
                </option>
              ))}
            </select>

            {targetPlatforms.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {targetPlatforms.map((p) => (
                  <span key={p} className="badge bg-brand-500/20 text-brand-500">
                    {PLATFORM_LABELS[p]}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="card">
            <label htmlFor="compose-text" className="block text-sm text-white/60 mb-2">
              Content
            </label>
            <textarea
              id="compose-text"
              className="input min-h-[200px] resize-y"
              placeholder="What would you like to post?"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <div className="flex items-center justify-between mt-3">
              <span className="text-xs text-white/40">{text.length} characters</span>
              <button
                className="btn-primary"
                disabled={!text || !selectedPostTypeId || generating}
                onClick={generate}
              >
                {generating ? 'Generating...' : '✨ Generate AI Content'}
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              className="btn-primary flex-1"
              disabled={publishing || !generatedContent}
              onClick={publish}
            >
              {publishing ? 'Publishing...' : '🚀 Publish Now'}
            </button>
            <button
              className="btn-ghost border border-white/10"
              disabled={!generatedContent}
              onClick={() => setShowSchedule(!showSchedule)}
            >
              📅 Schedule
            </button>
            <button className="btn-ghost" onClick={reset}>
              Clear
            </button>
          </div>

          {showSchedule && (
            <div className="card flex gap-3 items-end">
              <div className="flex-1">
                <label htmlFor="schedule-date" className="block text-sm text-white/60 mb-1">
                  Schedule for
                </label>
                <input
                  id="schedule-date"
                  type="datetime-local"
                  className="input"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                />
              </div>
              <button
                className="btn-primary"
                disabled={scheduling || !scheduleDate}
                onClick={handleSchedule}
              >
                {scheduling ? 'Scheduling...' : 'Confirm'}
              </button>
            </div>
          )}
        </div>

        {/* Platform previews */}
        <div className="space-y-4">
          <h2 className="text-sm font-medium text-white/60">Platform Previews</h2>
          {generatedContent ? (
            generatedContent.drafts.map((draft) => (
              <PlatformPreview
                key={draft.platform}
                platform={draft.platform}
                content={draft.adaptedContent}
              />
            ))
          ) : (
            <div className="card text-center text-white/40 text-sm py-8">
              Generate content to see platform previews
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
