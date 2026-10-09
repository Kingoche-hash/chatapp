// The wallpapers you can choose. Each is just a CSS background.
export const WALLPAPERS = [
  { key: 'default', name: 'Default', style: { backgroundColor: '#0f172a' } },
  {
    key: 'ocean',
    name: 'Ocean',
    style: { backgroundImage: 'linear-gradient(160deg, #0c4a6e, #0f172a 70%)' },
  },
  {
    key: 'sunset',
    name: 'Sunset',
    style: { backgroundImage: 'linear-gradient(160deg, #7c2d12, #1e1b4b 80%)' },
  },
  {
    key: 'forest',
    name: 'Forest',
    style: { backgroundImage: 'linear-gradient(160deg, #14532d, #0f172a 80%)' },
  },
  {
    key: 'midnight',
    name: 'Midnight',
    style: { backgroundImage: 'linear-gradient(160deg, #1e1b4b, #020617 80%)' },
  },
  {
    key: 'rose',
    name: 'Rose',
    style: { backgroundImage: 'linear-gradient(160deg, #831843, #1e1b4b 80%)' },
  },
  {
    key: 'dots',
    name: 'Dots',
    style: {
      backgroundColor: '#0f172a',
      backgroundImage: 'radial-gradient(#334155 1.2px, transparent 1.2px)',
      backgroundSize: '22px 22px',
    },
  },
  {
    key: 'grid',
    name: 'Grid',
    style: {
      backgroundColor: '#0f172a',
      backgroundImage:
        'linear-gradient(#1e293b 1px, transparent 1px), linear-gradient(90deg, #1e293b 1px, transparent 1px)',
      backgroundSize: '28px 28px',
    },
  },
];

export const getWallpaperStyle = (key) =>
  (WALLPAPERS.find((wallpaper) => wallpaper.key === key) || WALLPAPERS[0]).style;