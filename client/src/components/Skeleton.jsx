// Grey placeholder shapes shown while the real content loads.
export function ConversationListSkeleton() {
  return (
    <ul aria-hidden="true" className="animate-pulse">
      {[0, 1, 2, 3, 4].map((index) => (
        <li key={index} className="flex items-center gap-3 border-b border-slate-700/50 px-4 py-3">
          <div className="h-10 w-10 shrink-0 rounded-full bg-slate-700" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-1/2 rounded bg-slate-700" />
            <div className="h-3 w-3/4 rounded bg-slate-700/70" />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function MessageListSkeleton() {
  const rows = [
    { mine: false, width: 'w-48' },
    { mine: true, width: 'w-64' },
    { mine: false, width: 'w-40' },
    { mine: true, width: 'w-52' },
  ];

  return (
    <div aria-hidden="true" className="animate-pulse space-y-3">
      {rows.map((row, index) => (
        <div key={index} className={`flex ${row.mine ? 'justify-end' : 'justify-start'}`}>
          <div className={`h-10 rounded-2xl bg-slate-700 ${row.width}`} />
        </div>
      ))}
    </div>
  );
}