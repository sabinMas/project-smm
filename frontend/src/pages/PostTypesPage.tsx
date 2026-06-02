import { useEffect, useState } from 'react';
import { usePostTypesStore } from '@/store/postTypesStore';
import type { PlatformId, FormattingPreferences } from '@smm/shared';
import { clsx } from 'clsx';

const ALL_PLATFORMS: PlatformId[] = ['x', 'linkedin', 'facebook', 'instagram', 'threads', 'tiktok', 'bluesky'];

const DEFAULT_FORMATTING: FormattingPreferences = {
  useEmojis: true,
  hashtagStyle: 'moderate',
  linkPlacement: 'end',
  mentionStyle: 'casual',
};

export default function PostTypesPage() {
  const { postTypes, loading, error, fetch, create, update, remove } = usePostTypesStore();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formTone, setFormTone] = useState('');
  const [formPlatforms, setFormPlatforms] = useState<PlatformId[]>([]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const resetForm = () => {
    setFormName('');
    setFormTone('');
    setFormPlatforms([]);
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await update(editingId, {
        name: formName,
        toneDescriptor: formTone,
        targetPlatforms: formPlatforms,
        formattingPreferences: DEFAULT_FORMATTING,
      });
    } else {
      await create({
        name: formName,
        toneDescriptor: formTone,
        targetPlatforms: formPlatforms,
        formattingPreferences: DEFAULT_FORMATTING,
      });
    }
    resetForm();
  };

  const startEdit = (pt: typeof postTypes[0]) => {
    setEditingId(pt.id);
    setFormName(pt.name);
    setFormTone(pt.toneDescriptor);
    setFormPlatforms(pt.targetPlatforms);
    setShowForm(true);
  };

  const togglePlatform = (p: PlatformId) => {
    setFormPlatforms((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Post Types</h1>
        <button className="btn-primary text-sm" onClick={() => setShowForm(!showForm)}>
          + New Post Type
        </button>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-500/50 text-red-300 px-4 py-2 rounded-lg">
          {error}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="card space-y-4">
          <h2 className="text-sm font-medium">
            {editingId ? 'Edit Post Type' : 'Create Post Type'}
          </h2>
          <div>
            <label htmlFor="pt-name" className="block text-xs text-white/60 mb-1">
              Name
            </label>
            <input
              id="pt-name"
              className="input"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="e.g. Business Forward"
              required
            />
          </div>
          <div>
            <label htmlFor="pt-tone" className="block text-xs text-white/60 mb-1">
              Tone Descriptor
            </label>
            <input
              id="pt-tone"
              className="input"
              value={formTone}
              onChange={(e) => setFormTone(e.target.value)}
              placeholder="e.g. professional, casual, witty"
              required
            />
          </div>
          <div>
            <p className="text-xs text-white/60 mb-2">Target Platforms</p>
            <div className="flex flex-wrap gap-2">
              {ALL_PLATFORMS.map((p) => (
                <button
                  key={p}
                  type="button"
                  className={clsx(
                    'badge cursor-pointer transition-colors',
                    formPlatforms.includes(p)
                      ? 'bg-brand-500 text-white'
                      : 'bg-surface-2 text-white/50 hover:text-white'
                  )}
                  onClick={() => togglePlatform(p)}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn-primary text-sm">
              {editingId ? 'Update' : 'Create'}
            </button>
            <button type="button" className="btn-ghost text-sm" onClick={resetForm}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* List */}
      {loading ? (
        <div className="text-center text-white/40 py-12">Loading...</div>
      ) : (
        <div className="space-y-3">
          {postTypes.map((pt) => (
            <div key={pt.id} className="card flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm">{pt.name}</p>
                  {pt.isDefault && (
                    <span className="badge bg-white/10 text-white/50">Default</span>
                  )}
                </div>
                <p className="text-xs text-white/50 mt-1">
                  {pt.toneDescriptor} • {pt.targetPlatforms.join(', ')}
                </p>
              </div>
              {!pt.isDefault && (
                <div className="flex gap-2">
                  <button className="btn-ghost text-xs" onClick={() => startEdit(pt)}>
                    Edit
                  </button>
                  <button
                    className="btn-ghost text-xs text-red-400"
                    onClick={() => remove(pt.id)}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
