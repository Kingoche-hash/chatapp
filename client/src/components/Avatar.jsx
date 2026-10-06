const COLORS = [
  'bg-emerald-600',
  'bg-sky-600',
  'bg-violet-600',
  'bg-amber-600',
  'bg-rose-600',
  'bg-teal-600',
  'bg-indigo-600',
  'bg-pink-600',
];

const SIZES = {
  sm: 'h-8 w-8 text-sm',
  md: 'h-10 w-10 text-base',
  lg: 'h-12 w-12 text-lg',
};

// The same name always gets the same colour.
const colorFor = (name) => {
  let hash = 0;
  for (const character of name) hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  return COLORS[hash % COLORS.length];
};

// A coloured circle with the first letter of the name. `online` adds a green or grey dot.
export default function Avatar({ name = '?', size = 'md', online = null }) {
  const initial = (name.trim()[0] || '?').toUpperCase();

  return (
    <span className="relative inline-block shrink-0">
      <span
        aria-hidden="true"
        className={`flex items-center justify-center rounded-full font-semibold text-white ${SIZES[size]} ${colorFor(name)}`}
      >
        {initial}
      </span>
      {online !== null && (
        <span
          role="img"
          aria-label={online ? 'Online' : 'Offline'}
          className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-slate-800 ${
            online ? 'bg-emerald-400' : 'bg-slate-500'
          }`}
        />
      )}
    </span>
  );
}