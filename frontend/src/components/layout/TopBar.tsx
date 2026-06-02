import { useLocation } from 'react-router-dom';

const TITLES: Record<string, string> = {
  '/compose': 'Compose',
  '/calendar': 'Calendar',
  '/analytics': 'Analytics',
  '/connections': 'Connections',
  '/post-types': 'Post Types',
  '/workflows': 'Workflows',
};

export default function TopBar() {
  const { pathname } = useLocation();
  const title = TITLES[pathname] ?? 'SMM';

  return (
    <header className="h-14 border-b border-white/10 px-6 flex items-center justify-between shrink-0">
      <h1 className="font-semibold text-white">{title}</h1>
      <div className="flex items-center gap-2">
        <span className="badge bg-green-500/15 text-green-400">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
          Live
        </span>
      </div>
    </header>
  );
}
