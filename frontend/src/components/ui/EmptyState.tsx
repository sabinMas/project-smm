interface Props {
  icon: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export default function EmptyState({ icon, title, description, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
      <span className="text-4xl">{icon}</span>
      <p className="text-white font-medium">{title}</p>
      {description && <p className="text-white/50 text-sm max-w-xs">{description}</p>}
      {action}
    </div>
  );
}
